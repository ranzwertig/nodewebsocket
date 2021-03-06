// Github: http://github.com/ranzwertig/nodewebsocket
// Compatible with node v0.2.1
// Author: Christian Ranz http://github.com/ranzwertig
// License: MIT

var sys = require('sys');

var Module = this.Module = function() {};

var members = [];

Module.prototype.onConnect = function(connection) {
  members.push(connection);
};

Module.prototype.onData = function(connection) {
  for (var i in members) {
    var c = members[i];
    if (connection != c) {
      c.write(connection.data); 
    }
  }
};

Module.prototype.onClose = function(connection) {
  for (var i in members) {
    var c = members[i];
    if (connection == c) {
      members.splice(i, 1);
      break;
    }
  }
};

Module.prototype.onError = function(connection) {
  sys.debug(connection.exception);
};
