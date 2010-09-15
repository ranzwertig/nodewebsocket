Nodewebsocket is a socketserver for node.js (http://nodejs.org).

## Create Module

<pre><code>var Module = this.Module = function() {};

Module.prototype.onConnect = function(connection) {
  // handle connect
};

Module.prototype.onData = function(connection) {
  // handle data
};

Module.prototype.onClose = function(connection) {
  // handle close
};

Module.prototype.onError = function(connection) {
  // handle an error
};</code></pre>


The connection Object looks like:

connection
* data //the data sent to the socket
* remoteAddress //the remoteAddress
* exception //if an exception is thrown 
* function write(dataToWrite) //function to write to the socket
* function end() //function to close the socket
* socket //the original socket object used inside the server


## Clientside

<pre><code>var webSocket = new WebSocket('ws://localhost:8080/module');

webSocket.onopen = function(event){
  // whatever should be done on socket open
};

webSocket.onmessage = function(event){
  // whatever should be done on socket message
};
    
webSocket.onclose = function(event){
  // whatever should be done on socket close
};</code></pre>

## Author

Christian Ranz - http://twitter.com/ranzwertig - http://wwwchristianranz.com