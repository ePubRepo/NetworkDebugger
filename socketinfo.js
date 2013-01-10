SocketInfo = function(id) {
  this._socketId = id;
};

SocketInfo.prototype._socketId = null;
SocketInfo.prototype._consoleFnc = null;

SocketInfo.prototype.setConsoleFunction = function(fnc) {
   this._consoleFnc = fnc;
};

SocketInfo.prototype.printSocketInfo = function() {
   var strSocketInfo = this._getSocketInfo();
};

SocketInfo.prototype._getSocketInfo = function() {
   var parseSocketInfo = function(socketInfo) {
     var strSocketInfo = "A " + socketInfo.socketType + " connection from " + socketInfo.localAddress + ":" + socketInfo.localPort  + " to " + socketInfo.peerAddress + ":" + socketInfo.peerPort + " exists";
     if (typeof(this._consoleFnc) == "function") {
       this._consoleFnc(strSocketInfo);
     }
   };
   chrome.socket.getInfo(this._socketId, parseSocketInfo.bind(this));
};
