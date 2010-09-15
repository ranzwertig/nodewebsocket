// Github: http://github.com/ranzwertig/nodewebsocket
// Compatible with node v0.2.1
// Author: Christian Ranz http://github.com/ranzwertig
// License: MIT
// Based on: http://github.com/ncr/node.ws.js

var crypto = require('crypto');

function getInt32Bit(num) {
  var result = '';
  result += String.fromCharCode(num >> 24 & 0xFF);
  result += String.fromCharCode(num >> 16 & 0xFF);
  result += String.fromCharCode(num >> 8 & 0xFF);
  result += String.fromCharCode(num & 0xFF);
  return result;
}

exports.generateHash = function(strKey1, strKey2, chunk) {
  
  var numbersKey1 = parseInt(strKey1.replace(/[^\d]/g, ""), 10),
      numbersKey2 = parseInt(strKey2.replace(/[^\d]/g, ""), 10),
      
      spaceKey1 = strKey1.replace(/[^\ ]/g, "").length,
      spaceKey2 = strKey2.replace(/[^\ ]/g, "").length;


  if (spaceKey1 == 0 || spaceKey2 == 0 || numbersKey1 % spaceKey1 != 0 || numbersKey2 % spaceKey2 != 0) {
    return false;
  }

  var hash = crypto.createHash("md5"),
      
      key1 = getInt32Bit(parseInt(numbersKey1/spaceKey1)),
      key2 = getInt32Bit(parseInt(numbersKey2/spaceKey2));
        
  hash.update(key1);
  hash.update(key2);
  hash.update(chunk);
  
  return hash.digest("binary");
};
