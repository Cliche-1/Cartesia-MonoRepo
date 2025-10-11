package db

import (
    "cartesia/internal/domain"
    "gorm.io/gorm"
)

// AutoMigrate ejecuta migraciones de todos los modelos
func AutoMigrate(d *gorm.DB) error {
    return d.AutoMigrate(
        &domain.User{},
        &domain.LearningPath{},
        &domain.PathStep{},
        &domain.Resource{},
        &domain.Comment{},
        &domain.UserProgress{},
        &domain.RoadmapDiagram{},
    )
}