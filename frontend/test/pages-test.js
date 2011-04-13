/**
 * pages-test.js 
 *
 * Test suite for the page requests and routing
 *
 */

/**
 * Init
 */
var testosterone = require('testosterone')({
  port: 8124,
  title: 'Testing the routes'});
var assert = testosterone.assert;



/**
 * The DEMO test
 */

testosterone
  .add(
      'GIVEN a GET request \n' +
      'WHEN it\'s \'/\'\n' +
      'THEN return home',

      function (cb) {
        testosterone.get('/', cb(function(res) {
          assert.equal(res.statusCode, 200);
        }));
      })
  .add(
      'GIVEN a GET request \n' + 
      'WHEN it\'s \'/bla/bla/bla\'\n' +
      'THEN return 401',

      function (cb) {
        testosterone.get('/bla/bla/bla', cb(function(res) {
          assert.equal(res.statusCode, 404);
        }));
      })
  .run(function() {
    require('sys').print('done!');
  });
