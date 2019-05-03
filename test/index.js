/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const test = require('tape');
const EventEmitter = require('events');

const SqsEngine = require('..');

const script = {
  config: {
    target: 'https://sqs.us-east-1.amazonaws.com/012345678901/my-queue',
    sqs: {
      region: 'us-east-1'
    }
  },
  scenarios: [{
    name: 'Send messages to queue',
    engine: 'sqs',
    flow: [
      {
        sendMessage: {
          messageBody: 'A very boring payload'
        }
      }
    ]
  }]
};

test('Engine interface', function (t) {
  const events = new EventEmitter();
  const engine = new SqsEngine(script, events, {});
  const scenario = engine.createScenario(script.scenarios[0], events);
  t.assert(engine, 'Can construct an engine');
  t.assert(typeof scenario === 'function', 'Can create a scenario');
  t.end();
});
