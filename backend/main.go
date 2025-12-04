package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex;size:255;not null" json:"username"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Roadmap struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Visibility  string    `gorm:"size:16;not null;default:private" json:"visibility"`
	JSONData    string    `gorm:"type:text" json:"-"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UserRoadmap struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	RoadmapID uint      `gorm:"index;not null" json:"roadmap_id"`
	CreatedAt time.Time `json:"created_at"`
}

type RoadmapComment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	RoadmapID uint      `gorm:"index;not null" json:"roadmap_id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type RegisterPayload struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type MeResponse struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

func main() {
	dsn := getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cartesia?sslmode=disable")
	jwtSecret := getenv("JWT_SECRET", "dev-secret")
	port := getenv("PORT", "8080")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	if err := db.AutoMigrate(&User{}, &Roadmap{}, &UserRoadmap{}, &RoadmapComment{}); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:4200",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	api := app.Group("/api/v1")

	api.Post("/auth/register", func(c *fiber.Ctx) error {
		var p RegisterPayload
		if err := c.BodyParser(&p); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "payload inválido"})
		}
		p.Email = strings.TrimSpace(p.Email)
		p.Username = strings.TrimSpace(p.Username)
		if p.Email == "" || p.Username == "" || p.Password == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "faltan campos"})
		}
		// unicidad
		var count int64
		db.Model(&User{}).Where("email = ?", p.Email).Or("username = ?", p.Username).Count(&count)
		if count > 0 {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "usuario ya existe"})
		}
		// hash simple con bcrypt
		hash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo registrar"})
		}
		u := &User{Email: p.Email, Username: p.Username, PasswordHash: string(hash)}
		if err := db.Create(u).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo crear usuario"})
		}
		token, err := makeToken(jwtSecret, u)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo emitir token"})
		}
		return c.JSON(AuthResponse{Token: token})
	})

	api.Post("/auth/login", func(c *fiber.Ctx) error {
		var p LoginPayload
		if err := c.BodyParser(&p); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "payload inválido"})
		}
		var u User
		if err := db.Where("email = ?", p.Email).First(&u).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "credenciales"})
		}
		if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(p.Password)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "credenciales"})
		}
		token, err := makeToken(jwtSecret, &u)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo emitir token"})
		}
		return c.JSON(AuthResponse{Token: token})
	})

	api.Get("/me", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		return c.JSON(MeResponse{ID: claims.UserID, Email: claims.Email, Username: claims.Username})
	})

	api.Post("/learning-paths", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		var payload struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			Visibility  string `json:"visibility"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "payload inválido"})
		}
		vis := "private"
		if strings.EqualFold(strings.TrimSpace(payload.Visibility), "public") {
			vis = "public"
		}
		r := &Roadmap{Title: strings.TrimSpace(payload.Title), Description: strings.TrimSpace(payload.Description), Visibility: vis}
		if err := db.Create(r).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo crear"})
		}
		ur := &UserRoadmap{UserID: claims.UserID, RoadmapID: r.ID}
		_ = db.Create(ur).Error
		return c.JSON(fiber.Map{"id": r.ID, "title": r.Title, "description": r.Description, "createdAt": r.CreatedAt})
	})

	api.Get("/learning-paths", func(c *fiber.Ctx) error {
		var list []Roadmap
		if err := db.Order("created_at desc").Find(&list).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo listar"})
		}
		var out []fiber.Map
		for _, r := range list {
			out = append(out, fiber.Map{"id": r.ID, "title": r.Title, "description": r.Description, "visibility": r.Visibility, "createdAt": r.CreatedAt})
		}
		return c.JSON(out)
	})

	api.Get("/public-learning-paths", func(c *fiber.Ctx) error {
		var list []Roadmap
		if err := db.Where("visibility = ?", "public").Order("created_at desc").Find(&list).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo listar"})
		}
		var out []fiber.Map
		for _, r := range list {
			out = append(out, fiber.Map{"id": r.ID, "title": r.Title, "description": r.Description, "visibility": r.Visibility, "createdAt": r.CreatedAt})
		}
		return c.JSON(out)
	})

	api.Get("/learning-paths/mine", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		var list []Roadmap
		if err := db.Joins("JOIN user_roadmaps ur ON ur.roadmap_id = roadmaps.id").Where("ur.user_id = ?", claims.UserID).Order("roadmaps.created_at desc").Find(&list).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo listar"})
		}
		var out []fiber.Map
		for _, r := range list {
			out = append(out, fiber.Map{"id": r.ID, "title": r.Title, "description": r.Description, "visibility": r.Visibility, "createdAt": r.CreatedAt})
		}
		return c.JSON(out)

	})

	api.Put("/learning-paths/:id", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		m := map[string]string{}
		// intentar primero como application/json
		if c.Is("json") {
			_ = json.Unmarshal(c.Body(), &m)
		}
		// leer campos como form si están presentes
		if v := c.FormValue("title"); v != "" {
			m["title"] = v
		}
		if v := c.FormValue("description"); v != "" {
			m["description"] = v
		}
		if v := c.FormValue("visibility"); v != "" {
			m["visibility"] = v
		}
		if len(m) == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "payload inválido"})
		}
		var r Roadmap
		if err := db.First(&r, c.Params("id")).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "no encontrado"})
		}
		var ur UserRoadmap
		if err := db.Where("user_id = ? AND roadmap_id = ?", claims.UserID, r.ID).First(&ur).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		if v, ok := m["title"]; ok {
			r.Title = strings.TrimSpace(v)
		}
		if v, ok := m["description"]; ok {
			r.Description = strings.TrimSpace(v)
		}
		if v, ok := m["visibility"]; ok {
			if strings.EqualFold(strings.TrimSpace(v), "public") {
				r.Visibility = "public"
			} else {
				r.Visibility = "private"
			}
		}
		if err := db.Save(&r).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo actualizar"})
		}
		return c.JSON(fiber.Map{"id": r.ID, "title": r.Title, "description": r.Description, "visibility": r.Visibility, "createdAt": r.CreatedAt})
	})

	api.Delete("/learning-paths/:id", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		var r Roadmap
		if err := db.First(&r, c.Params("id")).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "no encontrado"})
		}
		var ur UserRoadmap
		if err := db.Where("user_id = ? AND roadmap_id = ?", claims.UserID, r.ID).First(&ur).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		if err := db.Where("roadmap_id = ?", r.ID).Delete(&UserRoadmap{}).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"ok": false})
		}
		if err := db.Delete(&r).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"ok": false})
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	api.Get("/learning-paths/:id/diagram", func(c *fiber.Ctx) error {
		var r Roadmap
		if err := db.First(&r, c.Params("id")).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"diagramJSON": "{\"nodes\":[],\"edges\":[]}"})
		}
		dj := r.JSONData
		if dj == "" {
			dj = "{\"nodes\":[],\"edges\":[]}"
		}
		return c.JSON(fiber.Map{"diagramJSON": dj})
	})

	api.Put("/learning-paths/:id/diagram", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		var payload struct {
			DiagramJSON string `json:"diagramJSON"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "payload inválido"})
		}
		var r Roadmap
		if err := db.First(&r, c.Params("id")).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "no encontrado"})
		}
		var ur UserRoadmap
		if err := db.Where("user_id = ? AND roadmap_id = ?", claims.UserID, r.ID).First(&ur).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		r.JSONData = payload.DiagramJSON
		if err := db.Save(&r).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"ok": false})
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	api.Get("/learning-paths/:id/comments", func(c *fiber.Ctx) error {
		lpID := c.Params("id")
		var comments []RoadmapComment
		if err := db.Where("roadmap_id = ?", lpID).Order("created_at desc").Find(&comments).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"items": []fiber.Map{}})
		}
		// fetch usernames in batch
		userIDs := make([]uint, 0, len(comments))
		for _, cm := range comments {
			userIDs = append(userIDs, cm.UserID)
		}
		var users []User
		if len(userIDs) > 0 {
			if err := db.Where("id IN ?", userIDs).Find(&users).Error; err != nil {
				users = []User{}
			}
		}
		uname := map[uint]string{}
		for _, u := range users {
			uname[u.ID] = u.Username
		}
		items := make([]fiber.Map, 0, len(comments))
		for _, cm := range comments {
			items = append(items, fiber.Map{"id": cm.ID, "content": cm.Content, "createdAt": cm.CreatedAt, "username": uname[cm.UserID]})
		}
		return c.JSON(fiber.Map{"items": items})
	})

	api.Post("/learning-paths/:id/comments", func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no autorizado"})
		}
		claims, err := parseToken(jwtSecret, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token inválido"})
		}
		lpID := c.Params("id")
		var r Roadmap
		if err := db.First(&r, lpID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "no encontrado"})
		}
		// accept json or form
		var body struct {
			Content string `json:"content"`
		}
		if c.Is("json") {
			if err := json.Unmarshal(c.Body(), &body); err != nil {
				body.Content = ""
			}
		} else {
			body.Content = c.FormValue("content")
		}
		content := strings.TrimSpace(body.Content)
		if content == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "contenido vacío"})
		}
		cm := &RoadmapComment{RoadmapID: r.ID, UserID: claims.UserID, Content: content}
		if err := db.Create(cm).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no se pudo comentar"})
		}
		return c.JSON(fiber.Map{"id": cm.ID})
	})

	api.Post("/learning-paths/:id/lock", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ok": true})
	})
	api.Post("/learning-paths/:id/unlock", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ok": true})
	})
	api.Get("/learning-paths/:id/collaborators", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"items": []fiber.Map{}})
	})
	api.Post("/learning-paths/:id/invite", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"token": "dummy-token"})
	})

	log.Printf("Servidor escuchando en :%s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatal(err)
	}
}

type tokenClaims struct {
	UserID   uint   `json:"uid"`
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func makeToken(secret string, u *User) (string, error) {
	claims := tokenClaims{
		UserID:   u.ID,
		Email:    u.Email,
		Username: u.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func parseToken(secret, token string) (*tokenClaims, error) {
	parsed, err := jwt.ParseWithClaims(token, &tokenClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := parsed.Claims.(*tokenClaims); ok && parsed.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

func getenv(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}
