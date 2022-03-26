## Serverless on AWS with CDK #1: App Runner with VPC Integration

This is part one of a four part series on deploying serverless application on AWS with the Cloud Development Kit (CDK) and will cover App Runner with VPC integration. Each post goes into detail about one particular AWS service to run the application, as well as one sample application that uses a particular architectural pattern or framework.

The next posts of this series will be about:

#2: AWS Lambda with Hexagonal Service Architecture using Golang and DynamoDB
#3: AWS ECS on Fargate with Blue/Green Deployments
#4: AWS EKS on Fargate with cdk8s

Used Technologies
- [AWS CDK 2.x](https://docs.aws.amazon.com/cdk/v2/guide/home.html) (For infrastructure and application deployment)
- [AWS App Runner](https://aws.amazon.com/apprunner/?nc1=h_ls) (Executing our container stored in ECR with ECS on Fargate)
- [AWS Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/?nc1=h_ls) (PostgreSQL Database)
- [AWS ECR](https://aws.amazon.com/ecr/?nc1=h_ls) (Container storage)
- [Golang](https://go.dev/) (Perfect for backend services)
- [Gin Web Framework](https://github.com/gin-gonic/gin) (Awesome web framework for Go with focus on performance and productivity)
- [Projen](https://projen.io/) (Setup our CDK project)

Checkout [my blog article](https://maxritter.bloggi.co/serverless-on-aws-with-cdk-1-app-runner-with-vpc-integration) for more details about the application, infrastructure and how to deploy it.

Credits go out to the one and only Adam Keller from Containers on the Couch, who inspired me to do this blog post 😊
