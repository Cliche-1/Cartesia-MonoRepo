package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// OpenSQLite abre una conexión SQLite y habilita claves foráneas
func OpenSQLite(path string) (*gorm.DB, error) {
	d, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	// Habilitar claves foráneas en SQLite
	d.Exec("PRAGMA foreign_keys = ON;")
	return d, nil
}