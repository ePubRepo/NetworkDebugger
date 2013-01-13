document.addEventListener('DOMContentLoaded', function() {
  // add listeners for tcp telnet tests
  document.getElementById('gHttpBtn').addEventListener('click',
      gHttpBtnClick);
  document.getElementById('gHttpsBtn').addEventListener('click',
      gHttpsBtnClick);
  document.getElementById('mHttpBtn').addEventListener('click',
      mHttpBtnClick);
  document.getElementById('dHttpBtn').addEventListener('click',
      dHttpBtnClick);

  // add listeners for udp dns tests
  document.getElementById('gDnsBtn').addEventListener('click',
      gDnsBtnClick);
  document.getElementById('oDnsBtn').addEventListener('click',
      oDnsBtnClick);
  document.getElementById('l3DnsBtn').addEventListener('click',
      l3DnsBtnClick);

  // add listeners to more info
  document.getElementById('networkInterfaceInformationBtn')
      .addEventListener('click', networkInterfaceInformationBtnClick);

  // add listeners to console control
  document.getElementById('consoleClearBtn')
      .addEventListener('click', consoleClearBtnBtnClick);
  document.getElementById('consoleCopyBtn')
      .addEventListener('click', consoleCopyBtnBtnClick);
});

/**
 * @constructor
 */
DNSInputHelper = function() {
};

/**
 * DOM ID of the DNS hostname field.
 * @type {string}
 * @private
 */
DNSInputHelper.prototype.domIdDnsHostname_ = 'dnsHostname';

/**
 * DOM ID of the DNS record type field.
 * @type {string}
 * @private
 */
DNSInputHelper.prototype.domIdDnsRecordType_ = 'dnsRecordType';

/**
 * Determines whether the hostname is valid.
 * @return {boolean} True if the hostname is valid.
 */
//TODO: Substitute in a regular expression
DNSInputHelper.prototype.isValidHostnameEntered = function() {
   var hostname = document.getElementById(this.domIdDnsHostname_).value;
   return (hostname.length > 3);
};

/**
 * Obtain the hostname the user provided for lookup.
 * @return {string} Hostname user provided.
 */
DNSInputHelper.prototype.getHostnameEntered = function() {
   return document.getElementById(this.domIdDnsHostname_).value;
};

/**
 * Obtain the DNS record type number the user wishes to lookup.
 * @return {int} DNS record type number.
 */
DNSInputHelper.prototype.getRecordType = function() {
   var recordType = document.getElementById(this.domIdDnsRecordType_).value;
   switch (recordType) {
      case 'MX':
         return DNSUtil.RecordNumber.MX;
      case 'AAAA':
         return DNSUtil.RecordNumber.AAAA;
      case 'CNAME':
          return DNSUtil.RecordNumber.CNAME;
      case 'TXT':
          return DNSUtil.RecordNumber.TXT;
      default:
         return DNSUtil.RecordNumber.A;
   }
};

function ndbConsole(outStr) {
   var now = new Date();
   var strDate = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) + '-' +
      now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes() +
      ':' + now.getUTCSeconds() + '.' + now.getUTCMilliseconds() + ' UTC';
   var strToAppend = strDate + '\r\n' + outStr + '\r\n\r\n';
   document.getElementById('console').value += strToAppend;
}

function l3DnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '209.244.0.3');
     gDnsQuery.setConsoleFunction(ndbConsole);
     gDnsQuery.sendRequest();
   }
}

function oDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '208.67.222.222');
     gDnsQuery.setConsoleFunction(ndbConsole);
     gDnsQuery.sendRequest();
   }
}

function gDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '8.8.8.8');
     gDnsQuery.setConsoleFunction(ndbConsole);
     gDnsQuery.sendRequest();
   }
}

function gHttpBtnClick() {
   var objTelnet = new Telnet('www.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet._createSocket();
}

function gHttpsBtnClick() {
   var objTelnet = new Telnet('74.125.228.114', 443);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet._createSocket();
}

function mHttpBtnClick() {
   var objTelnet = new Telnet('mail.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: mail.google.com\r\n\r\n');
   objTelnet._createSocket();
}

function dHttpBtnClick() {
   var objTelnet = new Telnet('drive.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
     setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: drive.google.com\r\n\r\n');
   objTelnet._createSocket();
}

function consoleCopyBtnBtnClick() {
   document.getElementById('console').select();
   document.execCommand('Copy');
}

function consoleClearBtnBtnClick() {
   document.getElementById('console').value = '';
}

function networkInterfaceInformationBtnClick() {
   var nicInfo = new NetworkInterfaceInformation();
   nicInfo.setConsoleFunction(ndbConsole);
   nicInfo.printNicInformation();
}
