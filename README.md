## Project Setup

To run this project, follow these steps:

1. Start LocalStack.
2. Configure AWS with the following settings:

```plaintext
// aws configurations:
access_id = 'test'
secret_access_key = 'test'
region = 'us-east-1'
endpoint = 'http://localhost:4566'
```


## APIs
This project contains 2 APIs:

1. `/publish`
- Method: POST
- Description: Takes `eventType` and `message` from the body and sends the message to SQS depending on `eventType`
- Request Body:
```plaintext
{
 "eventType": "broadcast",
 "message": "test message"
}
```

- Event Types
   - `"broadcast"`: Sends the message to all 3 queues (emailQueue, smsQueue and entityQueue).
   - `"communication"`: Sends the message to only 2 queues (emailQueue and smsQueue).
   - `"entity"`: Sends the message to only entityQueue.

2. `/receive/:eventType`
- Method: GET
- Description: Retrieves messages from the queue depending on the values of `eventType`.
- Path Parameters:
   - `eventType`: Values can be `broadcast`, `communication` and `entity`.
