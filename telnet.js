
Telnet = function(host, port) {
   this._host = host;
   this._port = port;
};

Telnet.prototype._host = null;
Telnet.prototype._port = null;
Telnet.prototype._socketId = null;
Telnet.prototype._isConnected = false;
Telnet.prototype._abDataToSend = null;

/**
  * Converts an array buffer to a string
  *
  * @private
  * @param {ArrayBuffer} buf The buffer to convert
  */
Telnet.prototype._arrayBufferToString = function(buf) {
   return String.fromCharCode.apply(null, new Uint16Array(buf));
};

/**
 * Converts a string to an array buffer
 *
 * @private
 * @param {String} str The string to convert
 */
Telnet.prototype._stringToArrayBuffer = function(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

Telnet.prototype._writePlainText = function(textToSend) {

};

Telnet.prototype._onReadCompletedCallback = function(readInfo) {
  console.log("read completed - proto");
  console.log(readInfo);
  var stringS = this._arrayBufferToString(readInfo.data);
  console.log(stringS);
};

Telnet.prototype._read = function() {
  console.log(this);
  chrome.socket.read(this._socketId, 1024, function(readInfo) {
      console.log("read completed - internal");
      console.log(readInfo);
      _arrayBufferToString(readInfo.data, function(ab) { console.log(ab); });
   });
console.log("done w/ read");
};

Telnet.prototype._onWriteCompleteCallback = function(writeInfo) {
  console.log("write completed");
  chrome.socket.read(this._socketId, 1024, this._onReadCompletedCallback.bind(this));
  //this._read();
};

Telnet.prototype._write = function() {
  chrome.socket.write(this._socketId, this._abDataToSend, this._onWriteCompleteCallback.bind(this));
};

Telnet.prototype._onConnectedCallback = function() {
   this._isConnected = true;
   this._abDataToSend = this._stringToArrayBuffer("GET / HTTP/1.1\r\nHost:www.google.com\r\n\r\n");
   this._write();
};

Telnet.prototype._createSocket = function() {
   chrome.socket.create('tcp', {}, function(createInfo) {
      this._socketId = createInfo.socketId;
      chrome.socket.connect(this._socketId, this._host, this._port, this._onConnectedCallback.bind(this));
   }.bind(this));
};

function httpRequest(connectionDestination, path, host) {
   console.log("HTTP Connection Destination: " + connectionDestination);
   console.log("HTTP Path: " + path);
   console.log("HTTP Host: " + host);

   createdSocketId = 0;
   writeArrayBuffer = new ArrayBuffer;
   _stringToArrayBuffer("GET / HTTP/1.1\r\nHost:www.google.com\r\n\r\n", function(ab) { writeArrayBuffer = ab; });

   onReadCompletedCallback = function(readInfo) {
      console.log("read completed");
      console.log(readInfo);
      _arrayBufferToString(readInfo.data, function(ab) { console.log(ab); });
   }

   onWriteCompleteCallback = function(writeInfo) {
      console.log("write completed");
      console.log(writeInfo);
      chrome.socket.read(createdSocketId, 1024, onReadCompletedCallback);
   }

   onConnectedCallback = function(result) {
      console.log("connection established");
      chrome.socket.write(createdSocketId, writeArrayBuffer, onWriteCompleteCallback);
   }

   chrome.socket.create('tcp', {}, function(createInfo) {
      createdSocketId = createInfo.socketId;
      chrome.socket.connect(createInfo.socketId, connectionDestination, 80, onConnectedCallback);
   });
}
