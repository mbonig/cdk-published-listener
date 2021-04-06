const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.97.0',
  name: 'cdk-published-listener',
  defaultReleaseBranch: 'master',
  cdkDependencies: [
    '@aws-cdk/aws-cloudwatch',
    '@aws-cdk/aws-cloudwatch-actions',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-sns-subscriptions',
  ],

  cdkVersionPinning: true,
  deps: [
    'aws-sdk',
  ],
});

project.synth();
