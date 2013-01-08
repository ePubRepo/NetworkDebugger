document.addEventListener('DOMContentLoaded', function () {
  // add listeners for tcp telnet tests
  document.getElementById('gHttpBtn').addEventListener('click', gHttpBtnClick);
  document.getElementById('gHttpsBtn').addEventListener('click', gHttpsBtnClick);
  document.getElementById('mHttpBtn').addEventListener('click', mHttpBtnClick);

  // add listeners for udp dns tests
  document.getElementById('gDnsBtn').addEventListener('click', gDnsBtnClick);
  document.getElementById('oDnsBtn').addEventListener('click', oDnsBtnClick);
  document.getElementById('l3DnsBtn').addEventListener('click', l3DnsBtnClick);
});

DNSInputHelper = function() {
};
DNSInputHelper.prototype._domIdDnsHostname = "dnsHostname";
DNSInputHelper.prototype._domIdDnsRecordType = "dnsRecordType";
DNSInputHelper.prototype.isValidHostnameEntered = function() {
   var hostname = document.getElementById(this._domIdDnsHostname).value;
   return (hostname.length > 3);
};

DNSInputHelper.prototype.getHostnameEntered = function() {
   return document.getElementById(this._domIdDnsHostname).value;
};

DNSInputHelper.prototype.getRecordType = function() {
   var recordType = document.getElementById(this._domIdDnsRecordType).value;
   switch(recordType) {
      case 'MX':
         return DNSUtil.RecordNumber.MX;
      case 'AAAA':
         return DNSUtil.RecordNumber.AAAA;
      default:
         return DNSUtil.RecordNumber.A;
   }
};

function ndbConsole(outStr) {
   document.getElementById("console").value = outStr;
}

function l3DnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
      publicUdpDnsQuery3(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '209.244.0.3');
   }
}

function oDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
      publicUdpDnsQuery3(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '208.67.222.222');
   }
}

function gDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
      publicUdpDnsQuery3(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '8.8.8.8');
   }
}

function gHttpBtnClick() {
   var objTelnet = new Telnet('www.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.setPlainTextDataToSend("GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n");
   objTelnet._createSocket();
}

function gHttpsBtnClick() {
   var objTelnet = new Telnet('74.125.228.114', 443);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.setPlainTextDataToSend("GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n");
   objTelnet._createSocket();
}

function mHttpBtnClick() {
   var objTelnet = new Telnet('mail.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.setPlainTextDataToSend("GET / HTTP/1.1\r\nHost: mail.google.com\r\n\r\n");
   objTelnet._createSocket();
}
