To run this project ->
- configure start localstack and configure aws
- aws configurations are:
    - access_id = 'test'
    - secret_access_key = 'test'
    - region = 'us-east-1'
    - endpoint = 'http://localhost:4566'
 
      
This project contains 2 APIs

1-> '/publish' which takes "eventType" and "message" from body and send message to sqs depending on eventType.
  "eventType":"broadcast" -> this will send the message to all 3 queues (emailQueue, smsQueue, entityQueue)
  "eventType":"communication" -> this will send the message to only 2 queues (emailQueue, smsQueue)
  "eventType":"entity" -> this will send message to only 1 queue (entityQueue)

2-> '/receive/:eventType' which retreives messages from queue depending on value of eventType.
