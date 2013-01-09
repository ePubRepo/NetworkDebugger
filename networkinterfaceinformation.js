
NetworkInterfaceInformation = function() {

};

NetworkInterfaceInformation.prototype._consoleFnc = null;

NetworkInterfaceInformation.prototype.setConsoleFunction = function(fnc) {
   this._consoleFnc = fnc;
};

NetworkInterfaceInformation.prototype.getNicInformation = function() {
  var receiveNicInfo = function(info) {
    var strNicInfo = "There are " + info.length + " network interfaces on this machine.\r\n";
    for (var i = 0; i < info.length; i++) {
       strNicInfo += "Interface " + (i+1) + " has address " + info[i].address + " and name " + info[i].name + "\r\n"; 
    }
    strNicInfo = strNicInfo.substring(0, strNicInfo.length - 2);
    if (typeof(this._consoleFnc) == "function") {
      this._consoleFnc(strNicInfo);
    }
  };
  chrome.socket.getNetworkList(receiveNicInfo.bind(this));
};
