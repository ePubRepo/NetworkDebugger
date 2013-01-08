
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
  * @param {Function} callback The function to call when conversion is complete
  */
Telnet.prototype._arrayBufferToString = function(buf, callback) {
    var bb = new Blob([new Uint8Array(buf)]);
    var f = new FileReader();
    f.onload = function(e) {
      callback(e.target.result);
    };
    f.readAsText(bb);
};

/**
 * Converts a string to an array buffer
 *
 * @private
 * @param {String} str The string to convert
 * @param {Function} callback The function to call when conversion is complete
 */
Telnet.prototype._stringToArrayBuffer = function(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
};

Telnet.prototype._writePlainText = function(textToSend) {

};

Telnet.prototype._onReadCompletedCallback = function(readInfo) {
  var receiveString = function(str) {
    console.log(str);
  };
  this._arrayBufferToString(readInfo.data, receiveString.bind(this));
};

Telnet.prototype._read = function() {
  chrome.socket.read(this._socketId, 1024, this._onReadCompletedCallback.bind(this));
};

Telnet.prototype._onWriteCompleteCallback = function(writeInfo) {
  this._read();
};

Telnet.prototype._write = function() {
  chrome.socket.write(this._socketId, this._abDataToSend, this._onWriteCompleteCallback.bind(this));
};

Telnet.prototype._onConnectedCallback = function() {
   this._isConnected = true;
   var receiveArrayBuffer = function(ab) {
      this._abDataToSend = ab;
      this._write();
   };
   this._stringToArrayBuffer("GET / HTTP/1.1\r\nHost:www.google.com\r\n\r\n", receiveArrayBuffer.bind(this));
};

Telnet.prototype._createSocket = function() {
   chrome.socket.create('tcp', {}, function(createInfo) {
      this._socketId = createInfo.socketId;
      chrome.socket.connect(this._socketId, this._host, this._port, this._onConnectedCallback.bind(this));
   }.bind(this));
};

Telnet.prototype._closeSocket = function() {
   chrome.socket.disconnect(this._socketId);
};
