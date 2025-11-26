package api

import (
	"strconv"
	"time"

	"cartesia/internal/domain"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterDiagramRoutes define rutas para el diagrama del roadmap
func RegisterDiagramRoutes(r fiber.Router, d *gorm.DB, jwtSecret string) {
	// Obtener diagrama por learning path id
	r.Get("/learning-paths/:id/diagram", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var diagram domain.RoadmapDiagram
		if err := d.Where("learning_path_id = ?", uint(id)).First(&diagram).Error; err != nil {
			// Si no hay diagrama, devolver uno vacío
			if err == gorm.ErrRecordNotFound {
				return c.JSON(fiber.Map{"diagramJSON": "{\"nodes\":[],\"edges\":[]}"})
			}
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"diagramJSON": diagram.DiagramJSON})
	})

	// Actualizar/crear diagrama (requiere autor)
	r.Put("/learning-paths/:id/diagram", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		// Verificar permisos y lock
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "LearningPath no encontrado")
		}
		var collab domain.LearningPathCollaborator
		hasCollab := d.Where("learning_path_id = ? AND user_id = ?", lp.ID, uid).First(&collab).Error == nil
		if !(lp.CreatedByID == uid || (hasCollab && (collab.Role == "owner" || collab.Role == "editor"))) {
			return fiber.NewError(fiber.StatusForbidden, "No autorizado")
		}
		if lp.LockedByID != nil && *lp.LockedByID != uid {
			return fiber.NewError(423, "Bloqueado por otro usuario")
		}
		// Body
		var body struct {
			DiagramJSON string `json:"diagramJSON"`
		}
		if err := c.BodyParser(&body); err != nil || body.DiagramJSON == "" {
			return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
		}
		// Upsert
		var diagram domain.RoadmapDiagram
		if err := d.Where("learning_path_id = ?", lp.ID).First(&diagram).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				diagram = domain.RoadmapDiagram{LearningPathID: lp.ID, CreatedByID: uid, DiagramJSON: body.DiagramJSON}
				if err := d.Create(&diagram).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error al crear diagrama")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			now := time.Now()
			diagram.DiagramJSON = body.DiagramJSON
			diagram.UpdatedAt = &now
			if err := d.Save(&diagram).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error al actualizar diagrama")
			}
		}
		// Versionado y auditoría
		_ = d.Create(&domain.RoadmapVersion{LearningPathID: lp.ID, AuthorID: uid, DiagramJSON: body.DiagramJSON}).Error
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_update_diagram", TargetID: lp.ID}).Error
		return c.JSON(fiber.Map{"ok": true})
	})
}
