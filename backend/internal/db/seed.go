package db

import (
    "time"

    "cartesia/internal/domain"
    "gorm.io/gorm"
)

// SeedDevData inserta datos de ejemplo para pruebas locales
func SeedDevData(d *gorm.DB) error {
    // Si ya hay usuarios, asumimos que ya está sembrada
    var count int64
    if err := d.Model(&domain.User{}).Count(&count).Error; err != nil {
        return err
    }
    if count > 0 {
        return nil
    }

    user := domain.User{Username: "alice", Email: "alice@example.com", PasswordHash: "hash"}
    if err := d.Create(&user).Error; err != nil {
        return err
    }

    lp := domain.LearningPath{Title: "Go Backend Basics", Description: "Fiber + GORM + SQLite", CreatedByID: user.ID}
    if err := d.Create(&lp).Error; err != nil {
        return err
    }

    step1 := domain.PathStep{LearningPathID: lp.ID, Title: "Instalar Go", Description: "setup", Order: 1}
    if err := d.Create(&step1).Error; err != nil {
        return err
    }
    step2 := domain.PathStep{LearningPathID: lp.ID, Title: "Fiber Hello World", Description: "server", Order: 2}
    if err := d.Create(&step2).Error; err != nil {
        return err
    }
    step3 := domain.PathStep{LearningPathID: lp.ID, Title: "GORM + SQLite", Description: "DB", Order: 3}
    if err := d.Create(&step3).Error; err != nil {
        return err
    }

    res := domain.Resource{PathStepID: step2.ID, Title: "Fiber Docs", URL: "https://docs.gofiber.io/", Type: "doc"}
    if err := d.Create(&res).Error; err != nil {
        return err
    }

    comment := domain.Comment{UserID: user.ID, PathStepID: step2.ID, Content: "Muy claro!"}
    if err := d.Create(&comment).Error; err != nil {
        return err
    }

    // Progreso: step1 completado
    now := time.Now()
    progress := domain.UserProgress{UserID: user.ID, PathStepID: step1.ID, Completed: true, CompletedAt: &now}
    if err := d.Create(&progress).Error; err != nil {
        return err
    }

    // Diagrama
    diagram := domain.RoadmapDiagram{LearningPathID: lp.ID, CreatedByID: user.ID, DiagramJSON: `{"nodes":[],"edges":[]}`}
    if err := d.Create(&diagram).Error; err != nil {
        return err
    }

    return nil
}