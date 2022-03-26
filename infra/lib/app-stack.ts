import {
  aws_apprunner,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as cr from "aws-cdk-lib/custom-resources";
import * as secretsmgr from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class AppRunnerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "AppRunnerVPC");

    const dbCluster = new rds.ServerlessCluster(this, "AppRunnerDatabase", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_10_14,
      }),
      vpc: vpc,
      enableDataApi: true,
      removalPolicy: RemovalPolicy.DESTROY,
      scaling: {
        autoPause: Duration.seconds(0),
      },
    });

    const databaseName = "tasks"
    const createDatabase = new cr.AwsCustomResource(this, "RDSCreateDatabase", {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      logRetention: RetentionDays.ONE_WEEK,
      onCreate: {
        service: "RDSDataService",
        action: "executeStatement",
        physicalResourceId: cr.PhysicalResourceId.of(
          dbCluster.clusterIdentifier
        ),
        parameters: {
          resourceArn: dbCluster.clusterArn,
          secretArn: dbCluster.secret?.secretArn,
          sql: `CREATE DATABASE ${databaseName} OWNER postgres;`,
        },
      },
    });

    createDatabase.node.addDependency(dbCluster);
    dbCluster.secret?.grantRead(createDatabase);

    dbCluster.connections.allowFrom(
      dbCluster,
      ec2.Port.tcp(5432),
      "Allow traffic on 5432 for any resource with this sec grp attached"
    );

    const dbSecrets =
      dbCluster.secret ?? new secretsmgr.Secret(this, "RDSSecret");

    // Create an App Runner Service with a VPC Connector
    const appRunnerVpcConnector = new aws_apprunner.CfnVpcConnector(
      this,
      "AppRunnerVPCCon",
      {
        subnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }).subnetIds,
        securityGroups: [
          dbCluster.connections.securityGroups[0].securityGroupId,
        ],
        vpcConnectorName: "AppRunnerVPCConnector",
      }
    );

    const appRunnerServiceRole = new iam.Role(this, "AppRunnerServiceRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });

    appRunnerServiceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSAppRunnerServicePolicyForECRAccess"
      )
    );

    const appRunnerInstanceRole = new iam.Role(this, "AppRunnerInstanceRole", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
      inlinePolicies: {
        secretsManager: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["secretsmanager:GetSecretValue"],
              resources: [dbSecrets.secretArn],
            }),
          ],
        }),
      },
    });

    // Build a container image and push to ECR
    const appRunnerContainerImage = new ecrAssets.DockerImageAsset(
      this,
      "ECRImage",
      {
        directory: "../app",
      }
    );

    const appRunnerService = new aws_apprunner.CfnService(
      this,
      "AppRunnerService",
      {
        sourceConfiguration: {
          autoDeploymentsEnabled: false,
          imageRepository: {
            imageRepositoryType: "ECR",
            imageIdentifier: appRunnerContainerImage.imageUri,
            imageConfiguration: {
              port: "8080",
              runtimeEnvironmentVariables: [
                {
                  name: "AWS_SECRET_NAME",
                  value: dbSecrets.secretArn,
                },
                {
                  name: "AWS_REGION",
                  value: process.env.CDK_DEFAULT_REGION,
                },
                {
                  name: "DATABASE_NAME",
                  value: databaseName,
                },
              ],
            },
          },
          authenticationConfiguration: {
            accessRoleArn: appRunnerServiceRole.roleArn,
          },
        },
        healthCheckConfiguration: {
          protocol: "HTTP",
          interval: 5,
          healthyThreshold: 1,
          path: "/",
          timeout: 5,
          unhealthyThreshold: 3,
        },
        networkConfiguration: {
          egressConfiguration: {
            egressType: "VPC",
            vpcConnectorArn: appRunnerVpcConnector.attrVpcConnectorArn,
          },
        },
        serviceName: Stack.of(this).stackName,
        instanceConfiguration: {
          instanceRoleArn: appRunnerInstanceRole.roleArn,
        },
      }
    );
    appRunnerService.node.addDependency(dbCluster);

    // App Runner URL output
    new CfnOutput(this, "AppRunnerServiceUrl", {
      value: `https://${appRunnerService.attrServiceUrl}`,
    });
  }
}
