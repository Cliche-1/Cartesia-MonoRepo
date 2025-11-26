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
	Visibility  string `gorm:"default:private"`
	CreatedByID uint   `gorm:"index"`
	CreatedBy   *User  `gorm:"constraint:OnDelete:SET NULL"`
	LockedByID  *uint  `gorm:"index"`
	LockedBy    *User  `gorm:"constraint:OnDelete:SET NULL"`
	LockedAt    *time.Time
	CreatedAt   time.Time `gorm:"default:(datetime('now'))"`
}

type LearningPathCollaborator struct {
	ID             uint          `gorm:"primaryKey"`
	LearningPathID uint          `gorm:"index;not null"`
	LearningPath   *LearningPath `gorm:"constraint:OnDelete:CASCADE"`
	UserID         uint          `gorm:"index;not null"`
	User           *User         `gorm:"constraint:OnDelete:CASCADE"`
	Role           string        `gorm:"not null"` // owner|editor|collaborator|reader
	CreatedAt      time.Time     `gorm:"default:(datetime('now'))"`
}

type LearningPathInvite struct {
	ID             uint      `gorm:"primaryKey"`
	LearningPathID uint      `gorm:"index;not null"`
	Email          string    `gorm:"index;not null"`
	Role           string    `gorm:"not null"`
	Token          string    `gorm:"uniqueIndex;not null"`
	ExpiresAt      time.Time `gorm:"not null"`
	Accepted       bool      `gorm:"default:false"`
	CreatedAt      time.Time `gorm:"default:(datetime('now'))"`
}

type RoadmapVersion struct {
	ID             uint      `gorm:"primaryKey"`
	LearningPathID uint      `gorm:"index;not null"`
	AuthorID       uint      `gorm:"index;not null"`
	DiagramJSON    string    `gorm:"type:text;not null"`
	CreatedAt      time.Time `gorm:"default:(datetime('now'))"`
}

type AuditLog struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"index;not null"`
	Action    string    `gorm:"not null"` // lp_lock, lp_unlock, lp_update_diagram, lp_invite, lp_invite_accept
	TargetID  uint      `gorm:"index"`
	Data      string    `gorm:"type:text"`
	CreatedAt time.Time `gorm:"default:(datetime('now'))"`
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

// Comentarios sobre Roadmaps (no asociados a un paso específico)
type RoadmapComment struct {
	ID             uint          `gorm:"primaryKey"`
	UserID         uint          `gorm:"index;not null"`
	User           *User         `gorm:"constraint:OnDelete:CASCADE"`
	LearningPathID uint          `gorm:"index;not null"`
	LearningPath   *LearningPath `gorm:"constraint:OnDelete:CASCADE"`
	Content        string        `gorm:"not null"`
	CreatedAt      time.Time     `gorm:"default:(datetime('now'))"`
}

// Calificaciones genéricas para distintos objetivos
type Rating struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"index;not null"`
	User       *User     `gorm:"constraint:OnDelete:CASCADE"`
	TargetType string    `gorm:"index;not null"` // "learning_path" | "resource"
	TargetID   uint      `gorm:"index;not null"`
	Score      int       `gorm:"not null"` // 1..5
	CreatedAt  time.Time `gorm:"default:(datetime('now'))"`
}

// Solicitud de profesor
type TeacherApplication struct {
	ID          uint   `gorm:"primaryKey"`
	UserID      uint   `gorm:"uniqueIndex;not null"`
	User        *User  `gorm:"constraint:OnDelete:CASCADE"`
	PublicName  string `gorm:"index"`
	LegalName   string
	Email       string `gorm:"index"`
	Phone       string
	Location    string
	Referral    string
	Topics      string
	Ages        string
	Expertise   string
	Years       string
	Bio         string `gorm:"type:text"`
	VideoURL    string
	CVURL       string
	Status      string `gorm:"index;default:draft"` // draft|submitted|approved|rejected
	SubmittedAt *time.Time
	CreatedAt   time.Time `gorm:"default:(datetime('now'))"`
	UpdatedAt   *time.Time
}
