const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'us-east-1',
    endpoint: 'http://localhost:4566'
});

const sns = new AWS.SNS();
const sqs = new AWS.SQS();

async function setupSNSAndSQS() {
    const snsTopic = await sns.createTopic({Name: 'MySNSTopic'}).promise();
    const topicArn = snsTopic.TopicArn;
    console.log('SNS topic ARN: ', topicArn);

    const emailQueue = await sqs.createQueue({QueueName: 'EmailQueue'}).promise();
    const smsQueue = await sqs.createQueue({QueueName: 'SMSQueue'}).promise();
    const entityQueue = await sqs.createQueue({QueueName: 'EntityQueue'}).promise();

    const emailQueueUrl = emailQueue.QueueUrl;
    const smsQueueUrl = smsQueue.QueueUrl;
    const entityQueueUrl = entityQueue.QueueUrl;

    console.log('Email Queue URL: ', emailQueueUrl);
    console.log('SMS Queue URL: ', smsQueueUrl);
    console.log('Entity Queue URL: ', entityQueueUrl);

    const smsQueueArn = (await sqs.getQueueAttributes({
        QueueUrl: smsQueueUrl,
        AttributeNames: ['QueueArn']
    }).promise()).Attributes.QueueArn;

    const entityQueueArn = (await sqs.getQueueAttributes({
        QueueUrl: entityQueueUrl,
        AttributeNames: ['QueueArn']
    }).promise()).Attributes.QueueArn;

    const emailQueueArn = (await sqs.getQueueAttributes({
        QueueUrl: emailQueueUrl,
        AttributeNames: ['QueueArn']
    }).promise()).Attributes.QueueArn;

    const emailSubscription = await sns.subscribe({
        Protocol: 'sqs',
        TopicArn: topicArn,
        Endpoint: emailQueueArn
    }).promise();
    const smsSubscription = await sns.subscribe({
        Protocol: 'sqs',
        TopicArn: topicArn,
        Endpoint: smsQueueArn
    }).promise();
    const entitySubscription = await sns.subscribe({
        Protocol: 'sqs',
        TopicArn: topicArn,
        Endpoint: entityQueueArn
    }).promise();

    console.log('Queues are subscribed to SNS topic: ', emailSubscription, smsSubscription, entitySubscription);

    const filterPolicyCommunication = JSON.stringify({eventType: ["communication", "broadcast"]});
    await sns.setSubscriptionAttributes({
        SubscriptionArn: emailSubscription.SubscriptionArn,
        AttributeName: 'FilterPolicy',
        AttributeValue: filterPolicyCommunication
    }).promise();

    await sns.setSubscriptionAttributes({
        SubscriptionArn: smsSubscription.SubscriptionArn,
        AttributeName: 'FilterPolicy',
        AttributeValue: filterPolicyCommunication
    }).promise();

    const filterPolicyEntity = JSON.stringify({eventType: ["entity", "broadcast"]});
    await sns.setSubscriptionAttributes({
        SubscriptionArn: entitySubscription.SubscriptionArn,
        AttributeName: 'FilterPolicy',
        AttributeValue: filterPolicyEntity
    }).promise();

    return {
        topicArn,
        emailQueueUrl,
        smsQueueUrl,
        entityQueueUrl
    }
}

module.exports = setupSNSAndSQS;