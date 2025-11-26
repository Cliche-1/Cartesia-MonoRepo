package api

import (
	"fmt"
	"strconv"
	"time"

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

	// Listar solo los creados por el usuario autenticado
	r.Get("/learning-paths/mine", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		var lps []domain.LearningPath
		if err := d.Where("created_by_id = ?", uid).Order("created_at DESC").Find(&lps).Error; err != nil {
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
			Visibility  string `json:"visibility"`
		}
		if err := c.BodyParser(&body); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "JSON inválido")
		}
		if body.Title == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Título requerido")
		}
		vis := body.Visibility
		if vis != "public" {
			vis = "private"
		}
		lp := domain.LearningPath{Title: body.Title, Description: body.Description, Visibility: vis, CreatedByID: uid}
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

	r.Post("/learning-paths/:id/lock", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		id, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var collab domain.LearningPathCollaborator
		hasCollab := d.Where("learning_path_id = ? AND user_id = ?", lp.ID, uid).First(&collab).Error == nil
		if !(lp.CreatedByID == uid || (hasCollab && (collab.Role == "owner" || collab.Role == "editor"))) {
			return fiber.NewError(fiber.StatusForbidden, "No autorizado")
		}
		if lp.LockedByID != nil && *lp.LockedByID != uid {
			return fiber.NewError(423, "Ya bloqueado")
		}
		now := time.Now()
		lp.LockedByID = &uid
		lp.LockedAt = &now
		if err := d.Save(&lp).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error lock")
		}
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_lock", TargetID: lp.ID}).Error
		return c.JSON(fiber.Map{"ok": true})
	})

	r.Post("/learning-paths/:id/unlock", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		id, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		if lp.LockedByID != nil && *lp.LockedByID != uid && lp.CreatedByID != uid {
			return fiber.NewError(fiber.StatusForbidden, "No autorizado")
		}
		lp.LockedByID = nil
		lp.LockedAt = nil
		if err := d.Save(&lp).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error unlock")
		}
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_unlock", TargetID: lp.ID}).Error
		return c.JSON(fiber.Map{"ok": true})
	})

	r.Get("/learning-paths/:id/collaborators", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		id, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		if lp.CreatedByID != uid {
			var collab domain.LearningPathCollaborator
			if d.Where("learning_path_id = ? AND user_id = ?", lp.ID, uid).First(&collab).Error != nil {
				return fiber.NewError(fiber.StatusForbidden, "No autorizado")
			}
		}
		var list []domain.LearningPathCollaborator
		if err := d.Where("learning_path_id = ?", lp.ID).Find(&list).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"items": list})
	})

	r.Post("/learning-paths/:id/invite", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		id, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		if lp.CreatedByID != uid {
			return fiber.NewError(fiber.StatusForbidden, "Solo propietario puede invitar")
		}
		var body struct {
			Email string `json:"email"`
			Role  string `json:"role"`
		}
		if err := c.BodyParser(&body); err != nil || body.Email == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Email requerido")
		}
		role := body.Role
		if role == "" {
			role = "collaborator"
		}
		token := fmt.Sprintf("tok_%d_%d_%d", lp.ID, uid, time.Now().UnixNano())
		inv := domain.LearningPathInvite{LearningPathID: lp.ID, Email: body.Email, Role: role, Token: token, ExpiresAt: time.Now().Add(7 * 24 * time.Hour)}
		if err := d.Create(&inv).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_invite", TargetID: lp.ID, Data: body.Email}).Error
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"token": inv.Token})
	})

	r.Post("/learning-paths/invitations/:token/accept", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		token := c.Params("token")
		var inv domain.LearningPathInvite
		if err := d.Where("token = ?", token).First(&inv).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Invitación no encontrada")
		}
		if time.Now().After(inv.ExpiresAt) {
			return fiber.NewError(fiber.StatusGone, "Invitación expirada")
		}
		if inv.Accepted {
			return c.JSON(fiber.Map{"ok": true})
		}
		var coll domain.LearningPathCollaborator
		if err := d.Where("learning_path_id = ? AND user_id = ?", inv.LearningPathID, uid).First(&coll).Error; err == nil {
			coll.Role = inv.Role
			if err := d.Save(&coll).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			coll = domain.LearningPathCollaborator{LearningPathID: inv.LearningPathID, UserID: uid, Role: inv.Role}
			if err := d.Create(&coll).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		inv.Accepted = true
		if err := d.Save(&inv).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_invite_accept", TargetID: inv.LearningPathID}).Error
		return c.JSON(fiber.Map{"ok": true})
	})

	r.Get("/learning-paths/:id/summary", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var stepsCount int64
		if err := d.Model(&domain.PathStep{}).Where("learning_path_id = ?", lp.ID).Count(&stepsCount).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		var resourcesCount int64
		if err := d.Raw("SELECT COUNT(*) FROM resources r JOIN path_steps ps ON r.path_step_id = ps.id WHERE ps.learning_path_id = ?", lp.ID).Scan(&resourcesCount).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		var author domain.User
		_ = d.First(&author, lp.CreatedByID).Error
		var url string
		_ = d.Raw("SELECT r.url FROM resources r JOIN path_steps ps ON r.path_step_id = ps.id WHERE ps.learning_path_id = ? ORDER BY r.id ASC LIMIT 1", lp.ID).Scan(&url).Error
		thumb := ""
		provider := ""
		if url != "" {
			meta := fetchURLMetadata(url)
			if v, ok := meta["thumbnail"].(string); ok {
				thumb = v
			}
			if p, ok := meta["provider"].(string); ok {
				provider = p
			}
		}
		return c.JSON(fiber.Map{
			"id":             lp.ID,
			"title":          lp.Title,
			"description":    lp.Description,
			"createdAt":      lp.CreatedAt,
			"author":         fiber.Map{"id": author.ID, "username": author.Username},
			"stepsCount":     stepsCount,
			"resourcesCount": resourcesCount,
			"thumbnail":      thumb,
			"provider":       provider,
		})
	})

	r.Get("/learning-paths/:id/comments", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		type Row struct {
			ID        uint
			Content   string
			CreatedAt string
			Username  string
		}
		var rows []Row
		q := "SELECT c.id, c.content, c.created_at, u.username FROM comments c JOIN users u ON u.id = c.user_id JOIN path_steps ps ON ps.id = c.path_step_id WHERE ps.learning_path_id = ? " +
			"UNION ALL SELECT rc.id, rc.content, rc.created_at, u.username FROM roadmap_comments rc JOIN users u ON u.id = rc.user_id WHERE rc.learning_path_id = ? " +
			"ORDER BY created_at DESC LIMIT 50"
		if err := d.Raw(q, uint(id), uint(id)).Scan(&rows).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"items": rows})
	})

	// Comentar un roadmap (requiere auth)
	r.Post("/learning-paths/:id/comments", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var body struct {
			Content string `json:"content"`
		}
		if err := c.BodyParser(&body); err != nil || body.Content == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Contenido requerido")
		}
		cm := domain.RoadmapComment{UserID: uid, LearningPathID: lp.ID, Content: body.Content}
		if err := d.Create(&cm).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"id": cm.ID})
	})

	// Comentar un paso del roadmap (recurso asociado) (requiere auth)
	r.Post("/path-steps/:id/comments", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var ps domain.PathStep
		if err := d.First(&ps, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var body struct {
			Content string `json:"content"`
		}
		if err := c.BodyParser(&body); err != nil || body.Content == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Contenido requerido")
		}
		cm := domain.Comment{UserID: uid, PathStepID: ps.ID, Content: body.Content}
		if err := d.Create(&cm).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"id": cm.ID})
	})

	// Calificar un roadmap (upsert por usuario)
	r.Post("/learning-paths/:id/rate", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var body struct {
			Score int `json:"score"`
		}
		if err := c.BodyParser(&body); err != nil || body.Score < 1 || body.Score > 5 {
			return fiber.NewError(fiber.StatusBadRequest, "Score 1..5")
		}
		var rrow domain.Rating
		if err := d.Where("user_id = ? AND target_type = ? AND target_id = ?", uid, "learning_path", lp.ID).First(&rrow).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				rrow = domain.Rating{UserID: uid, TargetType: "learning_path", TargetID: lp.ID, Score: body.Score}
				if err := d.Create(&rrow).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			rrow.Score = body.Score
			if err := d.Save(&rrow).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	// Obtener estadísticas de rating de un roadmap
	r.Get("/learning-paths/:id/ratings", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		type Stat struct {
			Score int
			Count int
		}
		var stats []Stat
		if err := d.Raw("SELECT score, COUNT(*) as count FROM ratings WHERE target_type = ? AND target_id = ? GROUP BY score ORDER BY score DESC", "learning_path", uint(id)).Scan(&stats).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		var avg float64
		_ = d.Raw("SELECT AVG(score) FROM ratings WHERE target_type = ? AND target_id = ?", "learning_path", uint(id)).Scan(&avg).Error
		return c.JSON(fiber.Map{"avg": avg, "breakdown": stats})
	})

	// Listar versiones del roadmap
	r.Get("/learning-paths/:id/versions", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var list []domain.RoadmapVersion
		if err := d.Where("learning_path_id = ?", uint(id)).Order("created_at DESC").Find(&list).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"items": list})
	})

	// Obtener una versión específica
	r.Get("/learning-paths/:id/versions/:vid", func(c *fiber.Ctx) error {
		idStr := c.Params("id")
		vidStr := c.Params("vid")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		vid, err := strconv.ParseUint(vidStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Versión inválida")
		}
		var v domain.RoadmapVersion
		if err := d.Where("learning_path_id = ? AND id = ?", uint(id), uint(vid)).First(&v).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		return c.JSON(fiber.Map{"diagramJSON": v.DiagramJSON, "createdAt": v.CreatedAt, "authorId": v.AuthorID})
	})

	// Registrar exportación (logs)
	r.Post("/learning-paths/:id/export/log", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var lp domain.LearningPath
		if err := d.First(&lp, uint(id)).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "No encontrado")
		}
		var body struct {
			IncludeResources bool   `json:"includeResources"`
			IncludeComments  bool   `json:"includeComments"`
			VersionID        *uint  `json:"versionId"`
			PageSize         string `json:"pageSize"`
			Orientation      string `json:"orientation"`
		}
		_ = c.BodyParser(&body)
		data := fmt.Sprintf("resources=%v;comments=%v;version=%v;size=%s;orient=%s", body.IncludeResources, body.IncludeComments, body.VersionID, body.PageSize, body.Orientation)
		_ = d.Create(&domain.AuditLog{UserID: uid, Action: "lp_export_pdf", TargetID: lp.ID, Data: data}).Error
		return c.JSON(fiber.Map{"ok": true})
	})
}
