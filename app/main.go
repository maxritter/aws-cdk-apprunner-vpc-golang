package main

import (
	"log"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/controllers"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/db"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/utils"
)

func main() {
	log.Println("Getting secrets..")
	rdsSecret := utils.GetSecret()

	log.Println("Init DB connection..")
	db.Init(rdsSecret)

	log.Println("Starting server..")
	r := gin.Default()

	//HTTP Health Check
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	//REST API
	v1 := r.Group("/api/v1")
	{
		tasks := v1.Group("/tasks")
		{
			tasks.GET("/", controllers.GetTasks)
			tasks.POST("/", controllers.CreateTask)
			tasks.PUT("/:id", controllers.UpdateTask)
			tasks.DELETE("/:id", controllers.DeleteTask)
		}
	}

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
