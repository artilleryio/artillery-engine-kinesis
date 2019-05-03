# Artillery.io AWS SQS Plugin

<p align="center">
    <em>Load test AWS SQS with <a href="https://artillery.io">Artillery.io</a></em>
</p>

## Why?

Load testing a SQS queue will help you answer question like _"have we configured appropriate DelaySeconds and VisibilityTimeout?"_ and _"are our consumers able to handle the amount of messages that will be enqueued in SQS?"_

Take guesswork out of configuring your SQS queues and make sure your consumers can scale to process incoming data.

## Usage

**Important:** The plugin requires Artillery `1.5.8-3` or higher.

### Install the plugin

```
# If Artillery is installed globally:
npm install -g artillery-engine-sqs
```

### Use the plugin

1. Set `config.target` to the URL of the SQS queue
2. Specify additional options in `config.sqs`:
    - `region` - AWS region (**default**: `us-east-1`)
3. Set the `engine` property of the scenario to `sqs`.
4. Use `sendMessage` in your scenario to send data to the queue.

#### Example Script

```yaml
config:
  target: "https://sqs.us-east-1.amazonaws.com/012345678901/my-queue"
  sqs:
    region: "us-east-1"
  # Emulate 10 publishers
  phases:
    arrivalCount: 10
    duration: 1
  engines:
    sqs: {}

scenarios:
  - name: "Push to stream"
    flow:
      - loop:
        - sendMessage:
           # data may be a string or an object. Objects
           # will be JSON.stringified.
           messageBody:
            eventType: "view"
            objectId: "ba0ec3de-26fe-4874-a74d-b72527160278"
            timestamp: 1492975372004
            location: "London, UK"
        - think: 1
        count: 100
```

(See [example.yml](example.yml) for a complete example.)

### Run Your Script

```
AWS_PROFILE=dev artillery run my_script.yml
```

### License

[MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
