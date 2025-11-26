package api

import (
	"time"

	"cartesia/internal/domain"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterTeacherRoutes define rutas para la aplicación de profesor
func RegisterTeacherRoutes(r fiber.Router, d *gorm.DB, jwtSecret string) {
	// Obtener mi solicitud
	r.Get("/teacher/applications/me", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var app domain.TeacherApplication
		if err := d.Where("user_id = ?", uid).First(&app).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return c.JSON(fiber.Map{"status": "none"})
			}
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(app)
	})

	// Crear/actualizar datos de pasos 2 y 3
	r.Post("/teacher/applications", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var body struct {
			PublicName string `json:"publicName"`
			LegalName  string `json:"legalName"`
			Email      string `json:"email"`
			Phone      string `json:"phone"`
			Location   string `json:"location"`
			Referral   string `json:"referral"`
			Topics     string `json:"topics"`
			Ages       string `json:"ages"`
			Expertise  string `json:"expertise"`
			Years      string `json:"years"`
			Bio        string `json:"bio"`
		}
		if err := c.BodyParser(&body); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
		}
		var app domain.TeacherApplication
		if err := d.Where("user_id = ?", uid).First(&app).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				app = domain.TeacherApplication{UserID: uid}
				if err := d.Create(&app).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		app.PublicName = body.PublicName
		app.LegalName = body.LegalName
		app.Email = body.Email
		app.Phone = body.Phone
		app.Location = body.Location
		app.Referral = body.Referral
		app.Topics = body.Topics
		app.Ages = body.Ages
		app.Expertise = body.Expertise
		app.Years = body.Years
		app.Bio = body.Bio
		now := time.Now()
		app.UpdatedAt = &now
		if err := d.Save(&app).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	// Guardar URL de video (el archivo se sube por /resources/upload)
	r.Post("/teacher/applications/video", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var body struct {
			VideoURL string `json:"videoUrl"`
		}
		if err := c.BodyParser(&body); err != nil || body.VideoURL == "" {
			return fiber.NewError(fiber.StatusBadRequest, "videoUrl requerido")
		}
		var app domain.TeacherApplication
		if err := d.Where("user_id = ?", uid).First(&app).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				app = domain.TeacherApplication{UserID: uid, VideoURL: body.VideoURL}
				if err := d.Create(&app).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			app.VideoURL = body.VideoURL
			now := time.Now()
			app.UpdatedAt = &now
			if err := d.Save(&app).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	r.Post("/teacher/applications/cv", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var body struct {
			CVURL string `json:"cvUrl"`
		}
		if err := c.BodyParser(&body); err != nil || body.CVURL == "" {
			return fiber.NewError(fiber.StatusBadRequest, "cvUrl requerido")
		}
		var app domain.TeacherApplication
		if err := d.Where("user_id = ?", uid).First(&app).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				app = domain.TeacherApplication{UserID: uid, CVURL: body.CVURL}
				if err := d.Create(&app).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			app.CVURL = body.CVURL
			now := time.Now()
			app.UpdatedAt = &now
			if err := d.Save(&app).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	// Enviar solicitud (acepta términos)
	r.Post("/teacher/applications/submit", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var body struct {
			Agree bool `json:"agree"`
		}
		if err := c.BodyParser(&body); err != nil || !body.Agree {
			return fiber.NewError(fiber.StatusBadRequest, "Debes aceptar los términos")
		}
		var app domain.TeacherApplication
		if err := d.Where("user_id = ?", uid).First(&app).Error; err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Completa los pasos previos")
		}
		now := time.Now()
		app.Status = "submitted"
		app.SubmittedAt = &now
		app.UpdatedAt = &now
		if err := d.Save(&app).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"ok": true})
	})
}
