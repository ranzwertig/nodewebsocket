// Github: http://github.com/ranzwertig/nodewebsocket
// Compatible with node v0.2.1
// Author: Christian Ranz http://github.com/ranzwertig
// License: MIT

var sys = require('sys');

var Module = this.Module = function() {};

Module.prototype.onConnect = function(connection) {
  sys.log('NEW CONNECTION: ' + connection.remoteAddress);
};

Module.prototype.onData = function(connection) {
  sys.log('DATA: ' + connection.data + ' FROM: ' + connection.remoteAddress);
};

Module.prototype.onClose = function(connection) {
  sys.log('CLOSED: ' + connection.remoteAddress);
};

Module.prototype.onError = function(connection) {
  sys.debug(connection.exception);
};