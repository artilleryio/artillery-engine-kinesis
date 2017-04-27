# Artillery.io AWS Kinesis Plugin

<p style="font-style: italic">Load Test AWS Kinesis with <a href="https://artillery.io">Artillery.io</a></p>

This Artillery plugin allows you to load test AWS Kinesis streams.

## Why?

Load testing a Kinesis stream will help you answer question like **"have we provisioned enough shards to be able to handle expected volume?"** and **"are our consumers able to handle the amount of messages that will be streamed via Kinesis?"**

Take guesswork out of provisioning capacity for your Kinesis streams and make sure your consumers can scale to process incoming data.


## Usage

**Important:** The plugin requires Artillery `1.5.8-3` or higher.

### Install the plugin

```
# If Artillery is installed globally:
npm install -g artillery-engine-kinesis
```

### Use the plugin

1. Set `config.target` to the name of the Kinesis stream
2. Specify additional options in `config.kinesis`:
    - `region` - AWS region (**default**: `us-east-1`)
3. Set the `engine` property of the scenario to `kinesis`.
4. Use `putRecord` in your scenario to push data to the stream.

#### Example Script

```yaml
config:
  target: "analytics_events"
  kinesis:
    region: "us-east-1"
  # Emulate 10 publishers
  phases:
    arrivalCount: 10
    duration: 1
  engines:
    kinesis: {}

scenarios:
  - name: "Push to stream"
    flow:
      - loop:
        - putRecord:
           # data may be a string or an object. Objects
           # will be JSON.stringified.
           data:
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
