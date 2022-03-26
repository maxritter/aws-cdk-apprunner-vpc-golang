package db

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	_ "github.com/lib/pq"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/models"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/types"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/utils"
)

var db *gorm.DB
var err error

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func Init(secret types.RDSDatabaseSecret) {
	dbinfo := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		secret.Username,
		secret.Password,
		secret.Host,
		strconv.Itoa(secret.Port),
		utils.GetDatabaseName(),
	)

	db, err = gorm.Open("postgres", dbinfo)
	if err != nil {
		log.Println("Failed to connect to database")
		panic(err)
	}
	log.Println("Database connected")

	if !db.HasTable(&models.Task{}) {
		err := db.CreateTable(&models.Task{})
		if err != nil {
			log.Println("Table already exists")
		}
	}

	db.AutoMigrate(&models.Task{})
}

func GetDB() *gorm.DB {
	return db
}

func CloseDB() {
	db.Close()
}
