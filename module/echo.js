// Github: http://github.com/ranzwertig/nodewebsocket
// Compatible with node v0.2.1
// Author: Christian Ranz http://github.com/ranzwertig
// License: MIT
// Based on: http://github.com/ncr/node.ws.js

var Module = this.Module = function() {};

Module.prototype.onConnect = function(connection) {
  connection.write('HI DUDE');
};

Module.prototype.onData = function(connection) {
  connection.write(connection.data);
};

Module.prototype.onClose = function(connection) {
  connection.write('CU');
};

Module.prototype.onError = function(connection) {
  sys.debug(connection.exception);
};