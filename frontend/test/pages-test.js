/**
 * pages-test.js 
 *
 * Test suite for the page requests and routing
 *
 */
vows = require('vows');
assert = require('assert');

/**
 * Helper functions for the tests
 */
var router = {
  get: 
    function(path) {
      return function() {
        //client.get(path, this.callback);
        // dummy code, implement
      };
    }
};

function assertStatus(code) {
  return function(e, res) {
    assert.equal(res.status, code);
  };
}

/**
 * The DEMO test
 */
var suite = vows.describe('pages-test');

suite.addBatch({
  'A request for the page': {
    '/': {
      topic: router.get('/'),
      'should respond with a 200 OK': assertStatus(200)
    },
  }
}).export(module);
