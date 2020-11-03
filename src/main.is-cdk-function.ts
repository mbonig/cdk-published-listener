import AWS from 'aws-sdk';

const sns = new AWS.SNS();
const unmarshall = AWS.DynamoDB.Converter.unmarshall;

const strip = ({ name, version }) => ({ name, version });

export const handler = async (event: any) => {
  const { dynamodb: { NewImage } } = event;

  console.log(NewImage);
  let record = unmarshall(NewImage);
  console.log(record);

  if (/aws-cdk\/core/.test(record.name) || !/aws-cdk\//.test(record.name)) {
    await sns.publish({ TopicArn: process.env.TOPIC_ARN, Message: JSON.stringify(strip(record)) }).promise();
  }
};