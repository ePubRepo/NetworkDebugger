/**
 * Open a TCP connection with a specific host on a specific port.
 * @param {string} host Hostname to open a connection with.
 * @param {integer} port Port number to connect on.
 * @constructor
 */
Telnet = function(host, port) {
   this.host_ = host;
   this.port_ = port;
};

/**
 * Hostname to connect to.
 * @type {string}
 * @private
 */
Telnet.prototype.host_ = null;

/**
 * Port to connect on.
 * @type {integer}
 * @private
 */
Telnet.prototype.port_ = null;

/**
 * ID of socket used to connect to host.
 * @type {integer}
 * @private
 */
Telnet.prototype.socketId_ = null;

/**
 * Whether the TCP connection is open with the destination host.
 * @type {boolean}
 * @private
 */
Telnet.prototype.isConnected_ = false;

/**
 * ArrayBuffer of binary data to send to destination host.
 * @type {ArrayBuffer}
 * @private
 */
Telnet.prototype.abDataToSend_ = null;

/**
 * ASCII text to send.
 * @type {string}
 * @private
 */
Telnet.prototype.strDataToSend_ = null;

/**
 * Function to print information to the app console.
 * Default function simply logs to the browser's console.
 * @type {function(string)}
 * @param {string} msg Message for the console.
 * @private
 */
Telnet.prototype.consoleFnc_ = function(msg) {
    console.log(msg);
};

/**
 * SocketInfo object for the socket used to connect to the destination host.
 * @type {SocketInfo}
 * @private
 */
Telnet.prototype.objSocketInfo_ = null;

/**
  * Converts an array buffer to a string.
  * @param {ArrayBuffer} buf The buffer to convert.
  * @param {Function} callback The function to call when conversion is complete.
  * @private
  */
Telnet.prototype.arrayBufferToString_ = function(buf, callback) {
    var bb = new Blob([new Uint8Array(buf)]);
    var f = new FileReader();
    f.onload = function(e) {
      callback(e.target.result);
    };
    f.readAsText(bb);
};

/**
 * Converts a string to an array buffer.
 * @param {String} str The string to convert.
 * @param {Function} callback The function to call when conversion is complete.
 * @private
 */
Telnet.prototype.stringToArrayBuffer_ = function(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
};

/**
 * Set the function to handle console logging for the app.
 * @param {function(string)} fnc Function to handle console information.
 * @type {Function(string)}
 */
Telnet.prototype.setConsoleFunction = function(fnc) {
   this.consoleFnc_ = fnc;
};

/**
 * Set the text to send to the host.
 * @param {string} textToSend Text to send to the host.
 */
Telnet.prototype.setPlainTextDataToSend = function(textToSend) {
   this.strDataToSend_ = textToSend;
};

/**
 * Process the data read over the socket.
 * @param {ReadInfo} readInfo Data read from the socket.
 * @see http://developer.chrome.com/apps/socket.html#type-ReadInfo
 * @private
 */
Telnet.prototype.onReadCompletedCallback_ = function(readInfo) {
    /**
     * Receive string response from host.
     * @param {string} str Text received from destination host.
     * @this {Telnet}
     */
    function receiveString_(str) {
      this.consoleFnc_(str);
      this.closeSocket_();
  }

  if (readInfo.resultCode > 0) {
      this.consoleFnc_('Successfully read ' + readInfo.resultCode +
              ' bytes of data');
      this.arrayBufferToString_(readInfo.data, receiveString_.bind(this));
  } else {
      this.consoleFnc_('Error reading data. Code ' + readInfo.resultCode);
  }
};

/**
 * Read data from the TCP socket.
 * @private
 */
Telnet.prototype.read_ = function() {
  chrome.socket.read(this.socketId_, this.onReadCompletedCallback_.bind(this));
};

/**
 * @param {WriteInfo} writeInfo Information about data written to host.
 * @see http://developer.chrome.com/apps/socket.html#type-WriteInfo
 * @private
 */
Telnet.prototype.onWriteCompleteCallback_ = function(writeInfo) {
    this.consoleFnc_('Successfully sent ' + writeInfo.bytesWritten +
            ' bytes of data');
    this.read_();
};

/**
 * Write binary data to destination host.
 * @private
 */
Telnet.prototype.write_ = function() {
    this.consoleFnc_('Prepared to send ' + this.abDataToSend_.byteLength +
            ' bytes of data');
    chrome.socket.write(this.socketId_,
            this.abDataToSend_,
            this.onWriteCompleteCallback_.bind(this));
};

/**
 * Process socket information upon successful TCP connection with host.
 * @private
 */
Telnet.prototype.onConnectedCallback_ = function() {
    this.isConnected_ = true;
    this.objSocketInfo_ = new SocketInfo(this.socketId_);
    this.consoleFnc_('TCP connection with ' + this.host_ +
            ' on port ' + this.port_ + ' established');
    this.objSocketInfo_.setConsoleFunction(this.consoleFnc_);
    this.objSocketInfo_.printSocketInfo();

    /**
     * Receive converted ArrayBuffer.
     * @param {ArrayBuffer} ab ArrayBuffer of information to send.
     * @this {Telnet}
     */
    function receiveArrBuffer(ab) {
        this.abDataToSend_ = ab;

        // socket open, data converted to binary, ready to send it
        this.write_();
    }

    this.stringToArrayBuffer_(this.strDataToSend_,
           receiveArrBuffer.bind(this));
};

/**
 * Create a TCP socket.
 * @private
 */
Telnet.prototype.createSocket_ = function() {
    /**
     * Process created socket information.
     * @param {CreatedInfo} createInfo Info on created socket.
     * @this {Telnet}
     * @see http://developer.chrome.com/apps/socket.html#type-CreateInfo
     * @private
     */
    function onCreated_(createInfo) {
        this.socketId_ = createInfo.socketId;
        chrome.socket.connect(this.socketId_,
                    this.host_,
                    this.port_,
                    this.onConnectedCallback_.bind(this));
    }
    chrome.socket.create('tcp', {}, onCreated_.bind(this));
};

/**
 * Close TCP socket.
 * @private
 */
Telnet.prototype.closeSocket_ = function() {
   chrome.socket.disconnect(this.socketId_);
   this.isConnected_ = false;
};
