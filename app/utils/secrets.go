package utils

import (
	"encoding/json"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/maxritter/aws-cdk-apprunner-vpc-golang/types"
)

var (
	secretEnvName   string = "AWS_SECRET_NAME"
	regionEnvName   string = "AWS_REGION"
	databaseEnvName string = "DATABASE_NAME"
)

func GetDatabaseName() string {
	databaseName := "tasks"
	if dbn := os.Getenv(databaseEnvName); dbn != "" {
		databaseName = dbn
	}
	return databaseName
}

func GetSecret() types.RDSDatabaseSecret {
	secretName := os.Getenv(secretEnvName)
	region := os.Getenv(regionEnvName)

	if secretName == "" || region == "" {
		panic("Missing environment variables")
	}

	svc := secretsmanager.New(
		session.New(),
		aws.NewConfig().WithRegion(region),
	)

	input := &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretName),
	}

	result, err := svc.GetSecretValue(input)
	if err != nil {
		panic(err.Error())
	}

	var secretString string
	if result.SecretString != nil {
		secretString = *result.SecretString
	}

	var secretData types.RDSDatabaseSecret
	err = json.Unmarshal([]byte(secretString), &secretData)
	if err != nil {
		panic(err.Error())
	}

	return secretData
}
