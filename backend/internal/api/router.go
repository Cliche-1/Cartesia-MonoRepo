package api

import (
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

// RegisterRoutes registra rutas bajo /api/v1
func RegisterRoutes(app *fiber.App, db *gorm.DB, jwtSecret string) {
    api := app.Group("/api/v1")
    // Salud
    api.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })

    // Auth
    RegisterAuthRoutes(api, db, jwtSecret)

    // Learning Paths
    RegisterLearningPathRoutes(api, db, jwtSecret)

    // Diagram
    RegisterDiagramRoutes(api, db, jwtSecret)
}