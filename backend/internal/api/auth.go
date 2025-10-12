package api

import (
    "strconv"
    "time"

    "cartesia/internal/domain"
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type registerReq struct {
    Username string `json:"username"`
    Email    string `json:"email"`
    Password string `json:"password"`
}

type loginReq struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

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

// jwtMiddleware valida el token y coloca userID en c.Locals("userID")
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
        // claims.Subject contiene userID como string; convertimos a uint con parse
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
}