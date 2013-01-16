
/**
 * @param {int} id ID of Chrome socket.
 * @constructor
 */
SocketInfo = function(id) {
  this.socketId_ = id;
};

/**
 * ID of Chrome socket.
 * @type {int}
 * @private
 */
SocketInfo.prototype.socketId_ = null;

/**
 * Function that receives information for the console.
 * @type {function(string)}
 * @private
 */
SocketInfo.prototype.consoleFnc_ = null;

/**
 * Set the function to be used for console logging.
 * @param {function(string)} fnc Function to pass console messages to.
 */
SocketInfo.prototype.setConsoleFunction = function(fnc) {
   this.consoleFnc_ = fnc;
};

/**
 * Print information about this socket to an available console function.
 */
SocketInfo.prototype.printSocketInfo = function() {
   var parseSocketInfo = function(socketInfo) {
     var strSocketInfo = 'A ' + socketInfo.socketType + ' connection from ' +
        socketInfo.localAddress + ':' + socketInfo.localPort + ' to ' +
        socketInfo.peerAddress + ':' + socketInfo.peerPort + ' now exists';

     if (typeof(this.consoleFnc_) == 'function') {
         this.consoleFnc_(strSocketInfo);
     }
   };
   chrome.socket.getInfo(this.socketId_, parseSocketInfo.bind(this));
};
