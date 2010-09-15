// Github: http://github.com/ranzwertig/nodewebsocket
// Compatible with node v0.2.1
// Author: Christian Ranz http://github.com/ranzwertig
// License: MIT
// Based on: http://github.com/ncr/node.ws.js

function nano(template, data) {
  return template.replace(/\{([\w\.]*)}/g, function (str, key) {
    var keys = key.split("."), value = data[keys.shift()];
    keys.forEach(function (key) { value = value[key] });
    return value;
  });
}

var sys  = require("sys"),
  net    = require("net"),
  crypto = require("crypto"),
  handshakeTool = require('./lib/handshake');
  
  
var requiredHeaders = {
  'get': /^GET (\/[^\s]*)/,
  'upgrade': /^WebSocket$/,
  'connection': /^Upgrade$/,
  'host': /^(.+)$/,
  'origin': /^(.+)$/,
};

var handshakeTemplate75 = [
  'HTTP/1.1 101 Web Socket Protocol Handshake', 
  'Upgrade: WebSocket', 
  'Connection: Upgrade',
  'WebSocket-Origin: {origin}',
  'WebSocket-Location: ws://{host}{resource}',
  '',
  ''
].join("\r\n");

var handshakeTemplate76 = [
    'HTTP/1.1 101 WebSocket Protocol Handshake',
    'Upgrade: WebSocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Origin: {origin}',
    'Sec-WebSocket-Location: ws://{host}{resource}',
    '',
    '{data}'
].join("\r\n");

function emmit(socket, data, exception) {
  return {
    'socket' : socket,
    'data' : data,
    'exception' : exception,
    'remoteAddress' : socket.remoteAddress,
    'write' : function(dataToWrite) { 
      try {
        socket.write('\u0000', 'binary');
        socket.write(dataToWrite, 'utf8');
        socket.write('\uffff', 'binary');
      } catch(e) { 
        socket.end();
      }
    },
    'end' : function() {
      socket.end();
    }
  };
}
  
var flashPolicy = '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>';
  
var server = net.createServer(function (socket) {
  socket.setTimeout(0);
  socket.setNoDelay(true);
  socket.setKeepAlive(true, 0);

  var module = {};

  var handshaked = false,
    buffer = "";
    
  function handle(data) {
    buffer += data;
    
    var chunks = buffer.split("\ufffd"),
      count = chunks.length - 1; // last is "" or a partial packet
      
    for(var i = 0; i < count; i++) {
      var chunk = chunks[i];
      if(chunk[0] == "\u0000") {
        module.onData(emmit(socket, chunk.slice(1)));
      } else {
        socket.end();
        return;
      }
    }
    
    buffer = chunks[count];
  }
  function handshake(data) {
    var _headers = data.split("\r\n");

    if ( /<policy-file-request.*>/.exec(_headers[0]) ) {
      socket.write( options.flashPolicy );
      socket.end();
      return;
    }

    // go to more convenient hash form
    var headers = {}, upgradeHead, len = _headers.length;
    if ( _headers[0].match(/^GET /) ) {
      headers["get"] = _headers[0];
    } else {
      socket.end();
      return;
    }
    if ( _headers[ _headers.length - 1 ] ) {
      upgradeHead = _headers[ _headers.length - 1 ];
      len--;
    }
    while (--len) { // _headers[0] will be skipped
      var header = _headers[len];
      if (!header) continue;

      var split = header.split(": ", 2); // second parameter actually seems to not work in node
      headers[ split[0].toLowerCase() ] = split[1];
    }

    // check if we have all needed headers and fetch data from them
    var data = {}, match;
    for (var header in requiredHeaders) {
      //           regexp                          actual header value
      if ( match = requiredHeaders[ header ].exec( headers[header] ) ) {
        data[header] = match;
      } else {
        socket.end();
        return;
      }
    }

    // draft auto-sensing
    if ( headers["sec-websocket-key1"] && headers["sec-websocket-key2"] && upgradeHead ) { // 76
      
      var hash = handshakeTool.generateHash(headers["sec-websocket-key1"], headers["sec-websocket-key2"], upgradeHead);

      socket.write(nano(handshakeTemplate76, {
        resource: data.get[1],
        host:     data.host[1],
        origin:   data.origin[1],
        data:     hash,
      }), "binary");

    } else { // 75
      socket.write(nano(handshakeTemplate75, {
        resource: data.get[1],
        host:     data.host[1],
        origin:   data.origin[1],
      }));

    }

    handshaked = true;
    
    //load Module based on connection ressource
    var loadedModule = require('./module/default'); //load default module
    try {
      loadedModule = require('./module' + data.get[1].toString().toLowerCase()); // load module by ressource
    } catch (exception) {
      loadedModule = require('./module/default'); // if module doesn't exist load default module
    }
    
    module = new loadedModule.Module(); // create module instance
    
    module.onConnect(emmit(socket));
  }

  socket.addListener("data", function (data) {
    if(handshaked) {
      handle(data.toString("utf8"));
    } else {
      handshake(data.toString("binary")); // because of draft76 handshakes
    }
  }).addListener("end", function () {
    socket.end();
  }).addListener("close", function () {
    if (handshaked) { // don't emit close from policy-requests
      module.onClose(emmit(socket));
    }
  }).addListener("error", function (exception) {
    if (typeof module.onError === 'function') {
      module.onError(emmit(socket, null , exception));
    } else {
      throw exception;
    }
  });
}).listen(8080);  