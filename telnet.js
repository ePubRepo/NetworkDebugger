
Telnet = function(host, port) {
   this._host = host;
   this._port = port;
};

Telnet.prototype._host = null;
Telnet.prototype._port = null;
Telnet.prototype._socketId = null;
Telnet.prototype._isConnected = false;
Telnet.prototype._abDataToSend = null;
Telnet.prototype._strDataToSend = null;
Telnet.prototype._consoleFnc = null;
Telnet.prototype._objSocketInfo = null;

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

Telnet.prototype.setConsoleFunction = function(fnc) {
   this._consoleFnc = fnc;
};

Telnet.prototype.setPlainTextDataToSend = function(textToSend) {
   this._strDataToSend = textToSend;
};

Telnet.prototype._writePlainText = function(textToSend) {

};

Telnet.prototype._onReadCompletedCallback = function(readInfo) {
  if (typeof(this._consoleFnc) == "function") {
    this._consoleFnc("Successfully read " + readInfo.resultCode + " bytes of data");
  }

  var receiveString = function(str) {
    if (typeof(this._consoleFnc) == "function") {
      this._consoleFnc(str);
    }
  };

  if (readInfo.resultCode > 0) {
     this._arrayBufferToString(readInfo.data, receiveString.bind(this));
  }
};

Telnet.prototype._read = function() {
  chrome.socket.read(this._socketId, this._onReadCompletedCallback.bind(this));
};

Telnet.prototype._onWriteCompleteCallback = function(writeInfo) {
   if (typeof(this._consoleFnc) == "function") {
     this._consoleFnc("Successfully sent " + writeInfo.bytesWritten + " bytes of data");
   }
   this._read();
};

Telnet.prototype._write = function() {
   if (typeof(this._consoleFnc) == "function") {
     this._consoleFnc("Prepared to send " + this._abDataToSend.byteLength + " bytes of data");
   }
  chrome.socket.write(this._socketId, this._abDataToSend, this._onWriteCompleteCallback.bind(this));
};

Telnet.prototype._onConnectedCallback = function() {
   this._isConnected = true;
   this._objSocketInfo = new SocketInfo(this._socketId);
   if (typeof(this._consoleFnc) == "function") {
     this._consoleFnc("TCP connection with " + this._host + " on port " + this._port + " established");
     this._objSocketInfo.setConsoleFunction(this._consoleFnc);
     this._objSocketInfo.printSocketInfo();
   }
   var receiveArrayBuffer = function(ab) {
      this._abDataToSend = ab;
      this._write();
   };
   this._stringToArrayBuffer(this._strDataToSend, receiveArrayBuffer.bind(this));
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
