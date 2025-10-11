package api

import (
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

// RegisterRoutes registra rutas bajo /api/v1
func RegisterRoutes(app *fiber.App, db *gorm.DB) {
    api := app.Group("/api/v1")
    api.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })
}