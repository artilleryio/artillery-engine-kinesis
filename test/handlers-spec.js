const handlerFactory = require('../lib/handlers');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('handlers', () => {

  let handlers,
    engineUtil,
    script,
    step,
    rs,
    ee;

  beforeEach(() => {
    engineUtil = {
      createLoopWithCount: sinon.spy(),
      template: sinon.spy(),
      createThink: sinon.spy()
    };

    ee = {
      emit: sinon.spy()
    };

    stepHandlers = handlerFactory.create({ engineUtil, script, step });
  });

  describe('createLoopHandler', () => {
    let handlers;

    beforeEach(() => {
      rs = {
        loop: []
      };
      script = {
        config: {}
      };
    });

    it('exists', () => {
      handlers = stepHandlers({rs, ee});
      expect(handlers.createLoopHandler).to.exist;
    });

    it('creates a handler with engineUtil.createLoopWithCount()', () => {
      handlers = stepHandlers({rs, ee});
      handlers.createLoopHandler();
      expect(engineUtil.createLoopWithCount.calledOnce).to.be.true;
    });

    it('creates a loop with rs.count when provided', () => {
      rs.count = 10;
      handlers = stepHandlers({rs, ee});
      handlers.createLoopHandler();
      expect(engineUtil.createLoopWithCount.calledWith(10)).to.be.true;
    });

    it('creates a loop with -1 when rs.count not provided', () => {
      handlers = stepHandlers({rs, ee});
      handlers.createLoopHandler();
      expect(engineUtil.createLoopWithCount.calledWith(-1)).to.be.true;
    });

    describe('loop parameters', () => {
      describe('when provided', () => {
        it('passes rs.loopValue as loopValue', () => {
          const loopValue = 'x';
          rs.loopValue = loopValue;
          handlers = stepHandlers({rs, ee});
          handlers.createLoopHandler();
          expect(engineUtil.createLoopWithCount.getCall(0).args[2].loopValue).to.equal(loopValue);
        });
        it('passes rs.loopElement as loopElement', () => {
          const loopElement = 'x';
          rs.loopElement = loopElement;
          handlers = stepHandlers({rs, ee});
          handlers.createLoopHandler();
          expect(engineUtil.createLoopWithCount.getCall(0).args[2].loopElement).to.equal(loopElement);
        });
        it('passes rs.over as overValues', () => {
          const overValues = ['x'];
          rs.over = overValues;
          handlers = stepHandlers({rs, ee});
          handlers.createLoopHandler();
          expect(engineUtil.createLoopWithCount.getCall(0).args[2].overValues).to.equal(overValues);
        });
      });
      describe('when not provided', () => {
        it('passes $loopCount as loopValue', () => {
          handlers = stepHandlers({rs, ee});
          handlers.createLoopHandler();
          expect(engineUtil.createLoopWithCount.getCall(0).args[2].loopValue).to.equal('$loopCount');
        });
        it('passes $loopElement as loopElement', () => {
          handlers = stepHandlers({rs, ee});
          handlers.createLoopHandler();
          expect(engineUtil.createLoopWithCount.getCall(0).args[2].loopElement).to.equal('$loopElement');
        });
      });
    });
  });
  describe('createLogHandler', () => {
    it('exists', () => {
      handlers = stepHandlers({rs, ee});
      expect(handlers.createLogHandler).to.exist;
    });

    describe('when called', () => {
      it('uses the engineUtil template function to string-substitute output', (done) => {
        handlers = stepHandlers({rs, ee});
        const logHandler = handlers.createLogHandler();
        logHandler({}, () => {
          done()
        });
        expect(engineUtil.template.calledOnce).to.be.true;
      });
    });
  });
  describe('createThinkHandler', () => {
    it('exists', () => {
      handlers = stepHandlers({rs, ee});
      expect(handlers.createThinkHandler).to.exist;
    });

    it('creates a handler with engineUtil.createThink()', () => {
      handlers = stepHandlers({rs, ee});
      handlers.createThinkHandler();
      expect(engineUtil.createThink.calledOnce).to.be.true;
    });

    it('passes the requestSpec to the engineUtil.createThink() function', () => {
      handlers = stepHandlers({rs, ee});
      handlers.createThinkHandler();
      expect(engineUtil.createThink.calledWith(rs)).to.be.true;
    });
  });
  describe('createSendMessageHandler', () => {
    let context;
    let sendMessage;

    beforeEach(() => {
      rs = {
        sendMessage: {
          messageBody: {}
        }
      };

      script = {
        config: {}
      };

      sendMessage = sinon.spy();
      context = {
        sqs: {
          sendMessage: sendMessage
        }
      };

    });

    it('exists', () => {
      handlers = stepHandlers({rs, ee});
      expect(handlers.createSendMessageHandler).to.exist;
    });

    it('calls the sendMessage API from the SQS client on the context', () => {
      handlers = stepHandlers({rs, ee});
      const sendMessageHandler = handlers.createSendMessageHandler();
      sendMessageHandler(context, () => {});
      expect(sendMessage.calledOnce).to.be.true;
    });

    describe('parameters object passed to SQS client sendMessage function', () => {
      it('includes a MessageBody', () => {
        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            }
          }
        };

        handlers = stepHandlers({rs, ee});
        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(Object.keys(sendMessage.getCall(0).args[0])).to.include('MessageBody');
        // expect(sendMessage.getCall(0).args[0].MessageBody).to.equal(JSON.stringify(rs.sendMessage.messageBody));
      });

      it('includes a QueueUrl', () => {
        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            }
          }
        };

        handlers = stepHandlers({rs, ee});
        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(Object.keys(sendMessage.getCall(0).args[0])).to.include('QueueUrl');
      });

      it('has a messageBody that is stringified if an object is provided', () => {
        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            }
          }
        };

        handlers = stepHandlers({rs, ee});
        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(sendMessage.getCall(0).args[0].MessageBody).to.equal(JSON.stringify(rs.sendMessage.messageBody));
      });

      it('grabs the queueUrl from rs.sendMessage if available', () => {
        const queueUrl = 'http://example.com';
        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            },
            queueUrl: queueUrl
          }
        };

        handlers = stepHandlers({rs, ee});
        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(sendMessage.getCall(0).args[0].QueueUrl).to.equal(queueUrl);
      });
      it('grabs the default queueUrl from script.config.target if not passed in the flow', () => {
        const queueUrl = 'http://example.com/default';

        script = {
          config: {
            target: queueUrl
          }
        };

        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            }
          }
        };

        const localStepHandlers = handlerFactory.create({ engineUtil, script, step });
        handlers = localStepHandlers({rs, ee});

        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(sendMessage.getCall(0).args[0].QueueUrl).to.equal(queueUrl);
      });
      it('emits a request event from the event emitter.', () => {
        const queueUrl = 'http://example.com';
        rs = {
          sendMessage: {
            messageBody: {
              hello: 'world'
            },
            queueUrl: queueUrl
          }
        };

        handlers = stepHandlers({rs, ee});
        const sendMessageHandler = handlers.createSendMessageHandler();
        sendMessageHandler(context, () => {});
        expect(ee.emit.getCall(0).args[0]).to.equal('request');
      });
    });
  });
});
