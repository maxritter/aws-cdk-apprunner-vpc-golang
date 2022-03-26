#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppRunnerStack } from "./app-runner-stack";

const app = new cdk.App();
const cdkEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "eu-west-1",
};

new AppRunnerStack(app, "AppRunnerStack", {
  env: cdkEnv,
  stackName: `app-runner-demo-stack`,
});

app.synth()