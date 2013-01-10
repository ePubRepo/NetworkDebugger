
/**
 * @constructor
 */
NetworkInterfaceInformation = function() {};

/**
 * Function to log information to the console.
 * @type {function(string)}
 * @private
 */
NetworkInterfaceInformation.prototype.consoleFnc_ = null;

/**
 * Set the function used to log information to the console.
 * @param {function(string)} fnc Function to long information to the console.
 */
NetworkInterfaceInformation.prototype.setConsoleFunction = function(fnc) {
   this.consoleFnc_ = fnc;
};

/**
 * Print NIC information to an available console.
 */
NetworkInterfaceInformation.prototype.printNicInformation = function() {
  var receiveNicInfo = function(info) {
    var strNicInfo = 'There are ' + info.length +
       ' network interfaces on this machine.\r\n';
    for (var i = 0; i < info.length; i++) {
       strNicInfo += 'Interface ' + (i + 1) + ' has address ' +
          info[i].address + ' and name ' + info[i].name + '\r\n';
    }
    strNicInfo = strNicInfo.substring(0, strNicInfo.length - 2);
    if (typeof(this.consoleFnc_) == 'function') {
      this.consoleFnc_(strNicInfo);
    }
  };
  chrome.socket.getNetworkList(receiveNicInfo.bind(this));
};
