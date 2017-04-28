/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const test = require('tape');
const EventEmitter = require('events');

const KinesisEngine = require('..');

const script = {
  config: {
    target: 'my_awesome_stream',
    kinesis: {
      region: 'us-east-1'
    }
  },
  scenarios: [{
    name: 'Push data to stream',
    engine: 'kinesis',
    flow: [
      {
        putRecord: {
          data: 'A very boring payload'
        }
      }
    ]
  }]
};

test('Engine interface', function (t) {
  const events = new EventEmitter();
  const engine = new KinesisEngine(script, events, {});
  const scenario = engine.createScenario(script.scenarios[0], events);
  t.assert(engine, 'Can construct an engine');
  t.assert(typeof scenario === 'function', 'Can create a scenario');
  t.end();
});
