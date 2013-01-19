// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Obtain information about the computer's network interfaces.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * @constructor
 */
NetworkInterfaceInformation = function() {};


/**
 * Function to log information to the console.
 * @param {string} str Text to be written to the console.
 * @type {function(string)}
 * @private
 */
NetworkInterfaceInformation.prototype.consoleFnc_ = function(str) {
  console.log(str);
};


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

    this.consoleFnc_(strNicInfo);
  };
  chrome.socket.getNetworkList(receiveNicInfo.bind(this));
};
