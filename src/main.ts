import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Subscription, SubscriptionProtocol, Topic} from '@aws-cdk/aws-sns';
import {App, Construct, Stack, StackProps} from '@aws-cdk/core';

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

    let ccTopic = Topic.fromTopicArn(this, 'cc-topic', 'arn:aws:sns:us-east-1:499430655523:construct-catalog-prod-RendererTopicD9CB70E6-TTOURYQEX9K1');

    new Subscription(this, 'cc-published-subscription', {
      topic: ccTopic,
      endpoint: handler.functionArn,
      protocol: SubscriptionProtocol.LAMBDA,
    });
  }
}


const app = new App();
new CdkPublishedListenerStack(app, 'cdk-published-listener', {});
app.synth();