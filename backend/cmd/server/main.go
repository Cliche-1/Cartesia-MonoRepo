package main

import (
    "log"
    "os"

    "github.com/joho/godotenv"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"

    "cartesia/internal/api"
    "cartesia/internal/db"
)

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
    // Cargar .env si existe
    _ = godotenv.Load()
    // Config
    port := getenv("PORT", "8080")
    dbPath := getenv("DB_PATH", "./data/app.db")
    jwtSecret := getenv("JWT_SECRET", "devsecret")

    // DB
    // asegurar directorio
    _ = os.MkdirAll("./data", 0755)
    d, err := db.OpenSQLite(dbPath)
    if err != nil {
        log.Fatalf("failed to connect database: %v", err)
    }
	if err := db.AutoMigrate(d); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
	if err := db.SeedDevData(d); err != nil {
		log.Fatalf("failed to seed: %v", err)
	}

	// App
	app := fiber.New()
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{AllowOrigins: getenv("ALLOWED_ORIGINS", "http://localhost:4200")}))

    // Rutas
    api.RegisterRoutes(app, d, jwtSecret)

	// Start
	log.Printf("server listening on :%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
