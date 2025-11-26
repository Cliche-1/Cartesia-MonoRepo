package api

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterSearchRoutes implementa búsqueda avanzada de roadmaps con filtros
func RegisterSearchRoutes(r fiber.Router, d *gorm.DB, jwtSecret string) {
	// Sugerencias/autocompletar (público)
	r.Get("/search/suggestions", func(c *fiber.Ctx) error {
		q := strings.TrimSpace(c.Query("q"))
		if q == "" {
			return c.JSON(fiber.Map{"learningPaths": []fiber.Map{}, "pathSteps": []fiber.Map{}})
		}
		// Limitar resultados
		var lpRes []struct {
			ID    uint
			Title string
		}
		if err := d.Raw("SELECT id, title FROM learning_paths WHERE title LIKE ? ORDER BY created_at DESC LIMIT 5", "%"+q+"%").Scan(&lpRes).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		var psRes []struct {
			ID             uint
			Title          string
			LearningPathID uint
		}
		if err := d.Raw("SELECT id, title, learning_path_id FROM path_steps WHERE title LIKE ? ORDER BY id DESC LIMIT 5", "%"+q+"%").Scan(&psRes).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		return c.JSON(fiber.Map{"learningPaths": lpRes, "pathSteps": psRes})
	})

	// Búsqueda de roadmaps con filtros, orden y paginación (público)
	r.Get("/search/roadmaps", func(c *fiber.Ctx) error {
		q := strings.TrimSpace(c.Query("q"))
		authorID := strings.TrimSpace(c.Query("authorId"))
		hasResources := strings.TrimSpace(c.Query("hasResources")) == "true"
		resourceType := strings.TrimSpace(c.Query("resourceType"))
		minStepsStr := strings.TrimSpace(c.Query("minSteps"))
		maxStepsStr := strings.TrimSpace(c.Query("maxSteps"))
		sortBy := c.Query("sortBy")
		sortDir := strings.ToUpper(c.Query("sortDir"))
		if sortDir != "ASC" && sortDir != "DESC" {
			sortDir = "DESC"
		}
		if sortBy == "" {
			sortBy = "created_at"
		}
		// Validar sortBy permitido
		switch sortBy {
		case "created_at", "title", "steps_count":
		default:
			sortBy = "created_at"
		}
		page := 1
		pageSize := 12
		if p := c.Query("page"); p != "" {
			if v := atoiSafe(p); v > 0 {
				page = v
			}
		}
		if ps := c.Query("pageSize"); ps != "" {
			if v := atoiSafe(ps); v > 0 && v <= 100 {
				pageSize = v
			}
		}
		offset := (page - 1) * pageSize

		// Construir condiciones dinámicas sobre learning_paths
		// Usamos EXISTS para PathSteps y Resources
		conds := []string{"1=1"}
		args := []any{}
		if q != "" {
			like := "%" + q + "%"
			conds = append(conds, "(title LIKE ? OR description LIKE ? OR EXISTS (SELECT 1 FROM path_steps ps WHERE ps.learning_path_id = learning_paths.id AND (ps.title LIKE ? OR ps.description LIKE ?)))")
			args = append(args, like, like, like, like)
		}
		if authorID != "" {
			conds = append(conds, "created_by_id = ?")
			args = append(args, authorID)
		}
		if hasResources {
			conds = append(conds, "EXISTS (SELECT 1 FROM path_steps ps JOIN resources r ON r.path_step_id = ps.id WHERE ps.learning_path_id = learning_paths.id)")
		}
		if resourceType != "" {
			conds = append(conds, "EXISTS (SELECT 1 FROM path_steps ps JOIN resources r ON r.path_step_id = ps.id WHERE ps.learning_path_id = learning_paths.id AND r.type = ?)")
			args = append(args, resourceType)
		}
		if minStepsStr != "" {
			if v := atoiSafe(minStepsStr); v > 0 {
				conds = append(conds, "(SELECT COUNT(*) FROM path_steps ps WHERE ps.learning_path_id = learning_paths.id) >= ?")
				args = append(args, v)
			}
		}
		if maxStepsStr != "" {
			if v := atoiSafe(maxStepsStr); v > 0 {
				conds = append(conds, "(SELECT COUNT(*) FROM path_steps ps WHERE ps.learning_path_id = learning_paths.id) <= ?")
				args = append(args, v)
			}
		}
		where := strings.Join(conds, " AND ")

		// Total
		var total int64
		if err := d.Raw("SELECT COUNT(*) FROM learning_paths WHERE "+where, args...).Scan(&total).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		// Items
		type LP struct {
			ID             uint   `json:"id"`
			Title          string `json:"title"`
			Description    string `json:"description"`
			CreatedByID    uint   `json:"createdById"`
			CreatedAt      string `json:"createdAt"`
			StepsCount     int    `json:"stepsCount"`
			ResourcesCount int    `json:"resourcesCount"`
			Thumbnail      string `json:"thumbnail"`
			Provider       string `json:"provider"`
		}
		var items []LP
		orderExpr := sortBy
		if sortBy == "steps_count" {
			orderExpr = "(SELECT COUNT(*) FROM path_steps ps WHERE ps.learning_path_id = learning_paths.id)"
		}
		query := "SELECT id, title, description, created_by_id, created_at, (SELECT COUNT(*) FROM path_steps ps WHERE ps.learning_path_id = learning_paths.id) AS steps_count, (SELECT COUNT(*) FROM resources r JOIN path_steps ps ON r.path_step_id = ps.id WHERE ps.learning_path_id = learning_paths.id) AS resources_count FROM learning_paths WHERE " + where + " ORDER BY " + orderExpr + " " + sortDir + " LIMIT ? OFFSET ?"
		argsItems := append(args, pageSize, offset)
		if err := d.Raw(query, argsItems...).Scan(&items).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		for i := range items {
			var url string
			if err := d.Raw("SELECT r.url FROM resources r JOIN path_steps ps ON r.path_step_id = ps.id WHERE ps.learning_path_id = ? ORDER BY r.id ASC LIMIT 1", items[i].ID).Scan(&url).Error; err == nil {
				if url != "" {
					meta := fetchURLMetadata(url)
					if v, ok := meta["thumbnail"].(string); ok {
						items[i].Thumbnail = v
					}
					if p, ok := meta["provider"].(string); ok {
						items[i].Provider = p
					}
				}
			}
		}
		return c.JSON(fiber.Map{
			"items":    items,
			"page":     page,
			"pageSize": pageSize,
			"total":    total,
			"sortBy":   sortBy,
			"sortDir":  sortDir,
		})
	})
}

func atoiSafe(s string) int {
	n := 0
	for i := 0; i < len(s); i++ {
		ch := s[i]
		if ch < '0' || ch > '9' {
			break
		}
		n = n*10 + int(ch-'0')
	}
	return n
}
