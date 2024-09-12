#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeleteStacksStack } from '../lib/lambdaFn';

const app = new cdk.App();
new DeleteStacksStack(app, 'DeleteStacksStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});