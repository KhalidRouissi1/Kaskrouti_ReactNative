package handlers

import (
	"context"
	"encoding/json"
	"go-sandwich-api/models" // Import the models package where the User model is defined
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt" // For password hashing
)

// RegisterUserHandler handles the user registration process
func RegisterUserHandler(userCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Check if username already exists
		var existingUser models.User
		err = userCollection.FindOne(context.Background(), bson.M{"username": user.Username}).Decode(&existingUser)
		if err == nil {
			// Username exists, return an error
			http.Error(w, "Username already exists", http.StatusConflict)
			return
		} else if err != mongo.ErrNoDocuments {
			// Error finding user
			http.Error(w, "Error checking username availability", http.StatusInternalServerError)
			return
		}

		// Hash the password before saving it to the database
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}
		user.Password = string(hashedPassword)

		// Insert the user into the database and get the inserted ID
		result, err := userCollection.InsertOne(context.Background(), user)
		if err != nil {
			http.Error(w, "Error saving user to database", http.StatusInternalServerError)
			return
		}

		// Set the user ID (MongoDB generates it automatically)
		user.ID = result.InsertedID.(primitive.ObjectID)

		// Return a response with the success message and the user's ID
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "User registered successfully!", "id": user.ID})
	}
}

// LoginUserHandler handles user login by validating username and password
func LoginUserHandler(userCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var loginData struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		// Decode the request body into the loginData struct
		err := json.NewDecoder(r.Body).Decode(&loginData)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Find the user in the database by username
		var user models.User
		err = userCollection.FindOne(context.Background(), bson.M{"username": loginData.Username}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "User not found", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Error finding user", http.StatusInternalServerError)
			return
		}

		// Log for debugging (see what is being compared)
		log.Printf("Stored password hash: %s", user.Password)
		log.Printf("Entered password: %s", loginData.Password)

		// Compare the provided password with the hashed password stored in the database
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
		if err != nil {
			// Log the error for debugging
			log.Printf("Error comparing passwords: %v", err)
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// If credentials are valid, return a success response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Login successful", "id": user.ID})
	}
}

// GetUserHandler fetches a user by their ID from the database
func GetUserHandler(userCollection *mongo.Collection) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the user ID from the request (you may want to pass the ID via URL params)
		userID := r.URL.Query().Get("id")

		// Convert the string userID to an ObjectID
		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Find the user in the database by ID
		var user models.User
		err = userCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// Respond with the user data
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}
