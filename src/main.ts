import {TreatMissingData} from '@aws-cdk/aws-cloudwatch';
import {SnsAction} from '@aws-cdk/aws-cloudwatch-actions';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Subscription, SubscriptionProtocol, Topic} from '@aws-cdk/aws-sns';
import {EmailSubscription} from '@aws-cdk/aws-sns-subscriptions';
import {App, CfnOutput, Construct, Stack, StackProps} from '@aws-cdk/core';

export class CdkPublishedListenerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);


    const cdkPublishedTopic = new Topic(this, 'cdk-published-topic', {});

    const handler = new NodejsFunction(this, 'is-cdk-function', {
      environment: {
        TOPIC_ARN: cdkPublishedTopic.topicArn,
      },
    });
    cdkPublishedTopic.grantPublish(handler);
    const metricError = handler.metricErrors({});
    const alarm = metricError.createAlarm(this, 'error-alarm', {
      alarmName: 'cdk listener errors',
      evaluationPeriods: 1,
      threshold: 1,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    let alarmTopic = new Topic(this, 'alarm-topic', {});
    alarmTopic.addSubscription(new EmailSubscription('matthew.bonig@gmail.com', {}));
    alarm.addAlarmAction(new SnsAction(alarmTopic));

    let ccTopic = Topic.fromTopicArn(this, 'cc-topic', 'arn:aws:sns:us-east-1:499430655523:construct-catalog-prod-RendererTopicD9CB70E6-TTOURYQEX9K1');

    new Subscription(this, 'cc-published-subscription', {
      topic: ccTopic,
      endpoint: handler.functionArn,
      protocol: SubscriptionProtocol.LAMBDA,
    });

    new CfnOutput(this, 'ConstructPublishedTopic', {
      value: cdkPublishedTopic.topicArn,
      description: 'SNS Topic Arn that gets messages from the publishing of CDK Constructs'
    });
  }
}


const app = new App();
new CdkPublishedListenerStack(app, 'cdk-published-listener', {});
app.synth();