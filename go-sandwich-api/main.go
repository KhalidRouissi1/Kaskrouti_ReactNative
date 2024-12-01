package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"go-sandwich-api/handlers" // Import the handlers package

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var userCollection *mongo.Collection
var sandwichCollection *mongo.Collection

func main() {
	// MongoDB URI (Adjust username, password, and db name accordingly)
	mongoURI := "mongodb://root:password@localhost:27017/sandwich-api?authSource=admin"
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	// Check MongoDB connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	fmt.Println("Connected to MongoDB")

	// Initialize collections
	userCollection = client.Database("sandwich-api").Collection("users")
	sandwichCollection = client.Database("sandwich-api").Collection("sandwiches")

	// Setup router
	r := mux.NewRouter()

	// Register routes with closures that pass the collection to handlers
	r.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		handlers.RegisterUserHandler(userCollection)(w, r)
	}).Methods("POST")

	r.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		handlers.LoginUserHandler(userCollection)(w, r)
	}).Methods("POST")

	r.HandleFunc("/api/user", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetUserHandler(userCollection)(w, r)
	}).Methods("GET")

	r.HandleFunc("/api/sandwich", func(w http.ResponseWriter, r *http.Request) {
		handlers.CreateSandwichHandler(sandwichCollection)(w, r)
	}).Methods("POST")

	r.HandleFunc("/api/sandwiches", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetAllSandwichesHandler(sandwichCollection)(w, r)
	}).Methods("GET")

		r.HandleFunc("/api/sandwiches", func(w http.ResponseWriter, r *http.Request) {
		handlers.DeleteAllSandwichesHandler(sandwichCollection)(w, r)
	}).Methods("DELETE")

	// Start the server
	http.ListenAndServe(":5000", r)
}
