package api

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"cartesia/internal/domain"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

// Requests
type registerReq struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// JWT
func generateToken(userID uint, secret string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   strconv.FormatUint(uint64(userID), 10),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func parseToken(tokenStr, secret string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, fiber.ErrUnauthorized
}

// Middleware
func jwtMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" || len(auth) < 8 || auth[:7] != "Bearer " {
			return fiber.ErrUnauthorized
		}
		claims, err := parseToken(auth[7:], secret)
		if err != nil {
			return fiber.ErrUnauthorized
		}
		var uid uint
		for i := 0; i < len(claims.Subject); i++ {
			uid = uid*10 + uint(claims.Subject[i]-'0')
		}
		if uid == 0 {
			return fiber.ErrUnauthorized
		}
		c.Locals("userID", uid)
		return c.Next()
	}
}

// RegisterAuthRoutes agrega rutas de autenticación
func RegisterAuthRoutes(r fiber.Router, d *gorm.DB, jwtSecret string) {
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:4200"
	}
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")
	if redirectURL == "" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		redirectURL = "http://localhost:" + port + "/api/v1/auth/google/callback"
	}
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  redirectURL,
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}

	// Registro
	r.Post("/auth/register", func(c *fiber.Ctx) error {
		var req registerReq
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
		}
		if req.Username == "" || req.Email == "" || len(req.Password) < 8 {
			return fiber.NewError(fiber.StatusBadRequest, "Datos inválidos")
		}

		var exists int64
		if err := d.Model(&domain.User{}).Where("email = ? OR username = ?", req.Email, req.Username).Count(&exists).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		if exists > 0 {
			return fiber.NewError(fiber.StatusConflict, "Usuario ya existe")
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al encriptar")
		}
		u := domain.User{Username: req.Username, Email: req.Email, PasswordHash: string(hash)}
		if err := d.Create(&u).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al crear usuario")
		}

		token, err := generateToken(u.ID, jwtSecret)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al generar token")
		}
		return c.JSON(fiber.Map{"token": token, "user": fiber.Map{"id": u.ID, "username": u.Username, "email": u.Email}})
	})

	// Login
	r.Post("/auth/login", func(c *fiber.Ctx) error {
		var req loginReq
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
		}
		if req.Email == "" || len(req.Password) < 8 {
			return fiber.NewError(fiber.StatusBadRequest, "Datos inválidos")
		}

		var u domain.User
		if err := d.Where("email = ?", req.Email).First(&u).Error; err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Credenciales inválidas")
		}
		if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Credenciales inválidas")
		}
		token, err := generateToken(u.ID, jwtSecret)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al generar token")
		}
		return c.JSON(fiber.Map{"token": token, "user": fiber.Map{"id": u.ID, "username": u.Username, "email": u.Email}})
	})

	// Perfil
	r.Get("/me", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var u domain.User
		if err := d.Model(&domain.User{}).Where("id = ?", uid).First(&u).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Usuario no encontrado")
		}
		return c.JSON(fiber.Map{"id": u.ID, "username": u.Username, "email": u.Email})
	})

	// Google OAuth
	r.Get("/auth/google", func(c *fiber.Ctx) error {
		state := uuid.NewString()
		c.Cookie(&fiber.Cookie{
			Name:     "oauth_state",
			Value:    state,
			HTTPOnly: true,
			Secure:   false,
			SameSite: "Lax",
			Expires:  time.Now().Add(10 * time.Minute),
		})
		url := conf.AuthCodeURL(state)
		return c.Redirect(url, fiber.StatusTemporaryRedirect)
	})

	r.Get("/auth/google/callback", func(c *fiber.Ctx) error {
		state := c.Query("state")
		code := c.Query("code")
		st := c.Cookies("oauth_state")
		if state == "" || code == "" || st == "" || st != state {
			return fiber.NewError(fiber.StatusBadRequest, "OAuth inválido")
		}
		ctx := context.Background()
		tok, err := conf.Exchange(ctx, code)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Intercambio falló")
		}
		client := conf.Client(ctx, tok)
		resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Perfil inválido")
		}
		defer resp.Body.Close()

		// Struct corregido
		var info struct {
			ID           string `json:"id"`
			Email        string `json:"email"`
			UserMetadata struct {
				FullName string `json:"full_name"`
				Name     string `json:"name"`
			} `json:"user_metadata"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&info); err != nil || info.Email == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "Perfil inválido")
		}

		var u domain.User
		if err := d.Where("email = ?", info.Email).First(&u).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				username := info.UserMetadata.FullName
				if username == "" {
					username = info.UserMetadata.Name
				}
				if username == "" {
					username = info.Email
				}
				ph, _ := bcrypt.GenerateFromPassword([]byte(uuid.NewString()), bcrypt.DefaultCost)
				u = domain.User{Username: username, Email: info.Email, PasswordHash: string(ph)}
				if err := d.Create(&u).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear usuario")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		token, err := generateToken(u.ID, jwtSecret)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al generar token")
		}
		return c.Redirect(frontendURL+"/login?token="+token, fiber.StatusTemporaryRedirect)
	})

	// Supabase exchange
	r.Post("/auth/supabase/exchange", func(c *fiber.Ctx) error {
		var body struct {
			AccessToken string `json:"accessToken"`
		}
		if err := c.BodyParser(&body); err != nil || body.AccessToken == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Token requerido")
		}

		req, _ := http.NewRequest("GET", os.Getenv("SUPABASE_URL")+"/auth/v1/user", nil)
		req.Header.Set("Authorization", "Bearer "+body.AccessToken)
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			if resp != nil {
				resp.Body.Close()
			}
			return fiber.NewError(fiber.StatusUnauthorized, "Token inválido")
		}
		defer resp.Body.Close()

		// Struct corregido
		var uinfo struct {
			Email        string `json:"email"`
			UserMetadata struct {
				FullName string `json:"full_name"`
				Name     string `json:"name"`
			} `json:"user_metadata"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&uinfo); err != nil || uinfo.Email == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "Usuario inválido")
		}

		var u domain.User
		if err := d.Where("email = ?", uinfo.Email).First(&u).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				username := uinfo.UserMetadata.FullName
				if username == "" {
					username = uinfo.UserMetadata.Name
				}
				if username == "" {
					username = uinfo.Email
				}
				ph, _ := bcrypt.GenerateFromPassword([]byte(uuid.NewString()), bcrypt.DefaultCost)
				u = domain.User{Username: username, Email: uinfo.Email, PasswordHash: string(ph)}
				if err := d.Create(&u).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear usuario")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}

		token, err := generateToken(u.ID, jwtSecret)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error al generar token")
		}
		return c.JSON(fiber.Map{"token": token})
	})
}
