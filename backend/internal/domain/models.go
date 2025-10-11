package domain

import "time"

type Roadmap struct {
    ID          uint   `gorm:"primaryKey"`
    Name        string
    Description string
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type Node struct {
    ID        uint   `gorm:"primaryKey"`
    RoadmapID uint   `gorm:"index"`
    Label     string
    Type      string
    Payload   string // JSON
    CreatedAt time.Time
    UpdatedAt time.Time
}

type Edge struct {
    ID        uint   `gorm:"primaryKey"`
    RoadmapID uint   `gorm:"index"`
    SourceID  uint   `gorm:"index"`
    TargetID  uint   `gorm:"index"`
    Label     string
    Payload   string // JSON
    CreatedAt time.Time
    UpdatedAt time.Time
}