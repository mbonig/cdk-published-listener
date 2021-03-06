import AWS from 'aws-sdk';

const sns = new AWS.SNS();
const strip = ({ name, version, url}) => ({ name, version, url });

export const handler = async (event: any) => {
  for (const record of event.Records) {
    let parsedMessage = JSON.parse(record.Sns.Message);
    if (!parsedMessage.dynamodb) {
      console.warn('Weird, no dynamodb record...', record);
    }
    const dbRecord = AWS.DynamoDB.Converter.unmarshall(parsedMessage.dynamodb.NewImage);

    if (/aws-cdk\/core/.test(dbRecord.name) || !/aws-cdk\//.test(dbRecord.name)) {
      console.log('Notifying...');
      await sns.publish({ TopicArn: process.env.TOPIC_ARN, Message: JSON.stringify(strip(dbRecord)) }).promise();
    } else {
      console.log(JSON.stringify(event));
    }
  }
};