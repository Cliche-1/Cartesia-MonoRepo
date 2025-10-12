package api

import (
    "strconv"

    "cartesia/internal/domain"
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

// RegisterLearningPathRoutes define rutas para LearningPaths
func RegisterLearningPathRoutes(r fiber.Router, d *gorm.DB, jwtSecret string) {
    // Listar
    r.Get("/learning-paths", func(c *fiber.Ctx) error {
        q := c.Query("q")
        var lps []domain.LearningPath
        tx := d
        if q != "" {
            tx = tx.Where("title LIKE ?", "%"+q+"%")
        }
        if err := tx.Order("created_at DESC").Find(&lps).Error; err != nil {
            return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
        }
        return c.JSON(lps)
    })

    // Crear (requiere auth)
    r.Post("/learning-paths", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
        uid, _ := c.Locals("userID").(uint)
        var body struct {
            Title       string `json:"title"`
            Description string `json:"description"`
        }
        if err := c.BodyParser(&body); err != nil {
            return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
        }
        if body.Title == "" {
            return fiber.NewError(fiber.StatusBadRequest, "Título requerido")
        }
        lp := domain.LearningPath{Title: body.Title, Description: body.Description, CreatedByID: uid}
        if err := d.Create(&lp).Error; err != nil {
            return fiber.NewError(fiber.StatusInternalServerError, "Error al crear")
        }
        return c.Status(fiber.StatusCreated).JSON(lp)
    })

    // Obtener por id
    r.Get("/learning-paths/:id", func(c *fiber.Ctx) error {
        idStr := c.Params("id")
        id, err := strconv.ParseUint(idStr, 10, 64)
        if err != nil {
            return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
        }
        var lp domain.LearningPath
        if err := d.First(&lp, uint(id)).Error; err != nil {
            return fiber.NewError(fiber.StatusNotFound, "No encontrado")
        }
        return c.JSON(lp)
    })
}