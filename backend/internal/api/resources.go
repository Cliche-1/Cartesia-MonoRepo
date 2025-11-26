package api

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"cartesia/internal/domain"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterResourceRoutes define rutas para subida de archivos y extracción de metadatos de enlaces
func RegisterResourceRoutes(r fiber.Router, db *gorm.DB, jwtSecret string) {
	// Subir archivo (multipart), requiere auth
	r.Post("/resources/upload", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		// Campo esperado: file, y opcional: title
		form, err := c.MultipartForm()
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Formulario multipart inválido")
		}
		files := form.File["file"]
		if len(files) == 0 {
			return fiber.NewError(fiber.StatusBadRequest, "Archivo requerido")
		}
		f := files[0]
		// Crear directorio de uploads
		uploadDir := filepath.Join("uploads", time.Now().Format("2006/01/02"))
		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "No se pudo crear directorio")
		}
		// Normalizar nombre
		name := sanitizeFilename(f.Filename)
		// Ruta destino
		destPath := filepath.Join(uploadDir, name)
		if err := c.SaveFile(f, destPath); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error guardando archivo")
		}
		// Calcular metadatos
		fi, _ := os.Stat(destPath)
		mime := f.Header.Get("Content-Type")
		size := int64(0)
		if fi != nil {
			size = fi.Size()
		}
		// Construir URL pública básica (sirviendo estático fuera de scope; de momento devolvemos ruta relativa)
		// En un entorno real, serviríamos "uploads" como estático: /static/uploads/...
		rel := filepath.ToSlash(strings.TrimPrefix(destPath, "uploads"+string(os.PathSeparator)))
		url := "/static/" + rel

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"type":        "file",
			"title":       c.FormValue("title"),
			"url":         url,
			"mimeType":    mime,
			"size":        size,
			"storagePath": destPath,
		})
	})

	// Extraer metadatos de un enlace, requiere auth
	r.Post("/resources/metadata", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		var body struct {
			URL string `json:"url"`
		}
		if err := c.BodyParser(&body); err != nil || body.URL == "" {
			return fiber.NewError(fiber.StatusBadRequest, "URL requerida")
		}
		meta := fetchURLMetadata(body.URL)
		return c.JSON(meta)
	})

	// Calificar un recurso (upsert)
	r.Post("/resources/:id/rate", jwtMiddleware(jwtSecret), func(c *fiber.Ctx) error {
		uid, _ := c.Locals("userID").(uint)
		idStr := c.Params("id")
		id, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "ID inválido")
		}
		var body struct {
			Score int `json:"score"`
		}
		if err := c.BodyParser(&body); err != nil || body.Score < 1 || body.Score > 5 {
			return fiber.NewError(fiber.StatusBadRequest, "Score 1..5")
		}
		var rrow domain.Rating
		if err := db.Where("user_id = ? AND target_type = ? AND target_id = ?", uid, "resource", uint(id)).First(&rrow).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				rrow = domain.Rating{UserID: uid, TargetType: "resource", TargetID: uint(id), Score: body.Score}
				if err := db.Create(&rrow).Error; err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
				}
			} else {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		} else {
			rrow.Score = body.Score
			if err := db.Save(&rrow).Error; err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
			}
		}
		return c.JSON(fiber.Map{"ok": true})
	})

	// Estadísticas de rating del recurso
	r.Get("/resources/:id/ratings", func(c *fiber.Ctx) error {
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
		if err := db.Raw("SELECT score, COUNT(*) as count FROM ratings WHERE target_type = ? AND target_id = ? GROUP BY score ORDER BY score DESC", "resource", uint(id)).Scan(&stats).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Error BD")
		}
		var avg float64
		_ = db.Raw("SELECT AVG(score) FROM ratings WHERE target_type = ? AND target_id = ?", "resource", uint(id)).Scan(&avg).Error
		return c.JSON(fiber.Map{"avg": avg, "breakdown": stats})
	})
}

// sanitizeFilename quita caracteres potencialmente inseguros
func sanitizeFilename(name string) string {
	name = strings.TrimSpace(name)
	name = strings.ReplaceAll(name, "..", "")
	name = strings.ReplaceAll(name, "\\", "-")
	name = strings.ReplaceAll(name, "/", "-")
	if name == "" {
		name = "archivo"
	}
	return name
}

// fetchURLMetadata intenta oEmbed para proveedores conocidos y si falla, usa OpenGraph básico
func fetchURLMetadata(url string) map[string]any {
	// Proveedores conocidos: YouTube y Vimeo oEmbed
	if strings.Contains(url, "youtube.com") || strings.Contains(url, "youtu.be") {
		if m := tryOEmbed("https://www.youtube.com/oembed?url=" + url + "&format=json"); m != nil {
			m["provider"] = "youtube"
			m["type"] = "video"
			return m
		}
	}
	if strings.Contains(url, "vimeo.com") {
		if m := tryOEmbed("https://vimeo.com/api/oembed.json?url=" + url); m != nil {
			m["provider"] = "vimeo"
			m["type"] = "video"
			return m
		}
	}
	// Fallback: OpenGraph básico
	og := tryFetchOpenGraph(url)
	og["provider"] = guessProvider(url)
	if _, ok := og["type"]; !ok {
		og["type"] = "link"
	}
	return og
}

func tryOEmbed(endpoint string) map[string]any {
	req, _ := http.NewRequest("GET", endpoint, nil)
	req.Header.Set("User-Agent", "CartesiaBot/1.0")
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil
	}
	var data map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil
	}
	// Normalizar claves comunes
	res := map[string]any{
		"title":     data["title"],
		"author":    data["author_name"],
		"thumbnail": data["thumbnail_url"],
		"embedHtml": data["html"],
	}
	return res
}

func tryFetchOpenGraph(url string) map[string]any {
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "CartesiaBot/1.0")
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return map[string]any{"url": url}
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return map[string]any{"url": url}
	}
	body, _ := io.ReadAll(resp.Body)
	html := string(body)
	// Extraer OG tags muy básicas sin parser pesado
	get := func(prop string) string {
		// Buscar content="..."
		idx := strings.Index(html, "property=\""+prop+"\"")
		if idx == -1 {
			idx = strings.Index(html, "name=\""+prop+"\"")
		}
		if idx == -1 {
			return ""
		}
		sub := html[idx:]
		cIdx := strings.Index(sub, "content=\"")
		if cIdx == -1 {
			return ""
		}
		sub2 := sub[cIdx+9:]
		eIdx := strings.Index(sub2, "\"")
		if eIdx == -1 {
			return ""
		}
		return strings.TrimSpace(sub2[:eIdx])
	}
	title := get("og:title")
	if title == "" {
		title = get("title")
	}
	desc := get("og:description")
	image := get("og:image")
	t := get("og:type")
	return map[string]any{
		"title":       title,
		"description": desc,
		"thumbnail":   image,
		"type":        t,
		"url":         url,
	}
}

func guessProvider(url string) string {
	u := strings.ToLower(url)
	switch {
	case strings.Contains(u, "youtube") || strings.Contains(u, "youtu.be"):
		return "youtube"
	case strings.Contains(u, "vimeo"):
		return "vimeo"
	case strings.Contains(u, "coursera"):
		return "coursera"
	case strings.Contains(u, "udemy"):
		return "udemy"
	case strings.Contains(u, "medium.com"):
		return "medium"
	default:
		// dominio
		parts := strings.Split(u, "/")
		if len(parts) >= 3 {
			return parts[2]
		}
		return "web"
	}
}
