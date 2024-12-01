package models

// Sandwich struct represents a sandwich
type Sandwich struct {
	ID        int       `json:"id" bson:"id"`
	Date      string    `json:"date" bson:"date"`
	Total     float64   `json:"total" bson:"total"`
	Items     []string  `json:"items" bson:"items"` // Ingredients list as items
	Status    string    `json:"status" bson:"status"`
}
