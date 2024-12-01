package handlers

import (
	"context"
	"encoding/json"
	"go-sandwich-api/models" // Import models here
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateSandwichHandler handles sandwich creation
func CreateSandwichHandler(sandwichCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var sandwich struct {
			Items  []string `json:"items"`
			Total  float64  `json:"total"`
			Status string   `json:"status"`
		}

		// Decode request body
		err := json.NewDecoder(r.Body).Decode(&sandwich)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Create a new sandwich with current date and auto-incremented ID
		newSandwich := &models.Sandwich{
			ID:        1, // You can generate a unique ID, e.g., by using a counter or MongoDB's ObjectId
			Date:      time.Now().Format("2006-01-02"),
			Total:     sandwich.Total,
			Items:     sandwich.Items,
			Status:    sandwich.Status,
		}

		// Insert the new sandwich into the database
		_, err = sandwichCollection.InsertOne(context.Background(), newSandwich)
		if err != nil {
			http.Error(w, "Error saving sandwich to database", http.StatusInternalServerError)
			return
		}

		// Respond with the created sandwich details
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newSandwich)
	}
}

// GetAllSandwichesHandler fetches all sandwiches from the database
func GetAllSandwichesHandler(sandwichCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cursor, err := sandwichCollection.Find(context.Background(), bson.M{})
		if err != nil {
			http.Error(w, "Error fetching sandwiches", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		var sandwiches []models.Sandwich
		for cursor.Next(context.Background()) {
			var sandwich models.Sandwich
			err := cursor.Decode(&sandwich)
			if err != nil {
				http.Error(w, "Error decoding sandwich data", http.StatusInternalServerError)
				return
			}
			sandwiches = append(sandwiches, sandwich)
		}

		// Respond with the sandwiches data
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sandwiches)
	}
}

func DeleteAllSandwichesHandler(sandwichCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Perform the delete operation without any filter
		result, err := sandwichCollection.DeleteMany(context.Background(), bson.M{})
		if err != nil {
			http.Error(w, "Error deleting sandwiches", http.StatusInternalServerError)
			return
		}

		// Respond with the number of deleted sandwiches
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("All sandwiches deleted successfully! Count: " + string(result.DeletedCount)))
	}
}