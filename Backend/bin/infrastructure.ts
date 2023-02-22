#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import * as yaml from 'yaml'
import * as fs from 'fs'

const app = new cdk.App();
const config = yaml.parse(fs.readFileSync('configuration.yaml', 'utf8'))

new InfrastructureStack(app, config.ID, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    env: { region: config.Region }

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});