import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DeleteStacksStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'deleteStacksFunction', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      timeout: cdk.Duration.minutes(15),
      bundling:{
        externalModules: ['aws-sdk'],
      },
      description: 'List all stacks in the account with a RESOURCE_PREFIX of D or T and delete them',
      entry: `${process.cwd()}/src/lambda.ts`,
    })

    const triggerA = new cdk.aws_events.Rule(this, 'deleteStacksRule1', {
      schedule: cdk.aws_events.Schedule.cron({ minute: '0', hour: '23' }),
      targets: [new cdk.aws_events_targets.LambdaFunction(fn)]
    })

    const triggerB = new cdk.aws_events.Rule(this, 'deleteStacksRule2', {
      schedule: cdk.aws_events.Schedule.cron({ minute: '0', hour: '12' }),
      targets: [new cdk.aws_events_targets.LambdaFunction(fn)]
    })

  }
}
