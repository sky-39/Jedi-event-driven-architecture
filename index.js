const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const setupSNSAndSQS = require('./setup');

AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'us-east-1',
    endpoint: 'http://localhost:4566'
});

const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const app = express();
app.use(bodyParser.json());

app.get('/receive/:queueType', async (req, res) => {
    const { emailQueueUrl, smsQueueUrl, entityQueueUrl } = await setupSNSAndSQS();
    const queueType = req.params.queueType;
    const QUEUE_URLS = {
        email: emailQueueUrl,
        sms: smsQueueUrl,
        entity: entityQueueUrl
    };
    console.log(QUEUE_URLS);
    if(!QUEUE_URLS[queueType]){
        return res.status(400).send('Invalid queue type');
    }

    const params = {
        QueueUrl: QUEUE_URLS[queueType],
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20
    };

    try {
        const data = await sqs.receiveMessage(params).promise();
        if(!data.Messages){
            return res.status(200).send('No messages available');
        }

        const messages = data.Messages.map(mess => {
            const parsedBody = JSON.parse(mess.Body);
            const parsedMessage = JSON.parse(parsedBody.Message);
            return {
                MessageId: mess.MessageId,
                EventType: parsedMessage.eventType,
                Message: parsedMessage.message,
                ReceiptHandle: mess.ReceiptHandle
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error in receiving messages from SQS');
    }
});

app.post('/publish', async (req, res) => {
    const { topicArn }= await setupSNSAndSQS();
    const {message, eventType} = req.body;
    if(!message){
        return res.status(400).send("Message is required");
    }

    try {
        const params = {
            Message: JSON.stringify({message, eventType}),
            TopicArn: topicArn,
            MessageAttributes: {
                'eventType': {
                    DataType: 'String',
                    StringValue: eventType,
                }
            }
        }

        await sns.publish(params).promise();
        res.status(200).send("Message is published");
    } catch (error) {
        console.log(error);
        res.status(500).send('Error in publishing message');
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});