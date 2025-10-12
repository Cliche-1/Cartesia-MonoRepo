package domain

import "time"

// Usuarios
type User struct {
	ID           uint      `gorm:"primaryKey"`
	Username     string    `gorm:"uniqueIndex;not null"`
	Email        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"default:(datetime('now'))"`
}

// Rutas de aprendizaje
type LearningPath struct {
	ID          uint   `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Description string
	CreatedByID uint      `gorm:"index"`
	CreatedBy   *User     `gorm:"constraint:OnDelete:SET NULL"`
	CreatedAt   time.Time `gorm:"default:(datetime('now'))"`
}

// Pasos de la ruta
type PathStep struct {
	ID             uint          `gorm:"primaryKey"`
	LearningPathID uint          `gorm:"index;not null"`
	LearningPath   *LearningPath `gorm:"constraint:OnDelete:CASCADE"`
	Title          string        `gorm:"not null"`
	Description    string
	Order          int       `gorm:"not null"`
	CreatedAt      time.Time `gorm:"default:(datetime('now'))"`
}

// Recursos asociados a pasos
type Resource struct {
	ID         uint      `gorm:"primaryKey"`
	PathStepID uint      `gorm:"index;not null"`
	PathStep   *PathStep `gorm:"constraint:OnDelete:CASCADE"`
	Title      string    `gorm:"not null"`
	URL        string    `gorm:"not null"`
	Type       string
	CreatedAt  time.Time `gorm:"default:(datetime('now'))"`
}

// Comentarios
type Comment struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"index;not null"`
	User       *User     `gorm:"constraint:OnDelete:CASCADE"`
	PathStepID uint      `gorm:"index;not null"`
	PathStep   *PathStep `gorm:"constraint:OnDelete:CASCADE"`
	Content    string    `gorm:"not null"`
	CreatedAt  time.Time `gorm:"default:(datetime('now'))"`
}

// Progreso del usuario
type UserProgress struct {
	ID          uint      `gorm:"primaryKey"`
	UserID      uint      `gorm:"index;not null"`
	User        *User     `gorm:"constraint:OnDelete:CASCADE"`
	PathStepID  uint      `gorm:"index;not null"`
	PathStep    *PathStep `gorm:"constraint:OnDelete:CASCADE"`
	Completed   bool      `gorm:"default:false"`
	CompletedAt *time.Time
}

// Diagramas de roadmap (JSON almacenado como TEXT en SQLite)
type RoadmapDiagram struct {
	ID             uint          `gorm:"primaryKey"`
	LearningPathID uint          `gorm:"index;not null"`
	LearningPath   *LearningPath `gorm:"constraint:OnDelete:CASCADE"`
	CreatedByID    uint          `gorm:"index"`
	CreatedBy      *User         `gorm:"constraint:OnDelete:SET NULL"`
	DiagramJSON    string        `gorm:"type:TEXT;not null"`
	CreatedAt      time.Time     `gorm:"default:(datetime('now'))"`
	UpdatedAt      *time.Time
}