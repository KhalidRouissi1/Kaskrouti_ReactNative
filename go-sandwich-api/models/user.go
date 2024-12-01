package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// User struct to handle user data
type User struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Username string             `json:"username"`
	Password string             `json:"password"`
	Role     string             `json:"role"`
}
