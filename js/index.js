// Copyright 2013. All Rights Reserved.

document.addEventListener('DOMContentLoaded', function() {
  // add listener for running general diagnostics
  document.getElementById('runDiagnosticsBtn').addEventListener('click',
      basicDiagnostics);

  // add listeners for tcp telnet tests
  document.getElementById('gHttpBtn').addEventListener('click',
      gHttpBtnClick);
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
  document.getElementById('whoAmIDnsBtn').addEventListener('click',
      whoAmIDnsBtnClick);
  document.getElementById('customDnsBtn').addEventListener('click',
      customDnsBtnClick);

  // add listeners to more info
  document.getElementById('networkInterfaceInformationBtn')
      .addEventListener('click', networkInterfaceInformationBtnClick);

  // add listeners to console control
  document.getElementById('consoleClearBtn')
      .addEventListener('click', consoleClearBtnBtnClick);
  document.getElementById('consoleCopyBtn')
      .addEventListener('click', consoleCopyBtnBtnClick);
});


function ndbConsole(outStr) {
   var now = new Date();
   var strDate = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) + '-' +
      now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes() +
      ':' + now.getUTCSeconds() + '.' + now.getUTCMilliseconds() + ' UTC';
   var strToAppend = strDate + '\r\n' + outStr + '\r\n\r\n';
   document.getElementById('console').value += strToAppend;
}


function basicDiagnostics() {
  ndbConsole('Preparing to run network diagnostics.');

  // make queries to Google Public DNS
  var arrHostsToQuery = ['google.com', 'mail.google.com', 'docs.google.com',
                         'accounts.google.com', 'apis.google.com'];

  for (var i = 0; i < arrHostsToQuery.length; i++) {
    // TODO: create each test in new thread
    var gDnsQuery = new DNSQueryManager(arrHostsToQuery[i],
        DNSUtil.RecordNumber.A,
        '8.8.8.8');
    gDnsQuery.setConsoleFunction(ndbConsole);
    gDnsQuery.sendRequest();
  }
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


function whoAmIDnsBtnClick() {
    var gDnsQuery = new DNSQueryManager('o-o.myaddr.google.com',
            DNSUtil.RecordNumber.TXT,
            '8.8.8.8');
        gDnsQuery.setConsoleFunction(ndbConsole);
        gDnsQuery.sendRequest();
}


function customDnsBtnClick() {
    var inputHelper = new DNSInputHelper();
    if (inputHelper.isValidHostnameEntered() &&
            inputHelper.isValidCustomResolverIpEntered()) {
      var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
          inputHelper.getRecordType(),
          inputHelper.getCustomResolverIp());
      gDnsQuery.setConsoleFunction(ndbConsole);
      gDnsQuery.sendRequest();
    }
}


function gHttpBtnClick() {
   var objTelnet = new Telnet('www.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet.createSocket_();
}


function gHttpsBtnClick() {
   var objTelnet = new Telnet('74.125.228.114', 443);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet.createSocket_();
}


function mHttpBtnClick() {
   var objTelnet = new Telnet('mail.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: mail.google.com\r\n\r\n');
   objTelnet.createSocket_();
}


function dHttpBtnClick() {
   var objTelnet = new Telnet('drive.google.com', 80);
   objTelnet.setConsoleFunction(ndbConsole);
   objTelnet.
     setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: drive.google.com\r\n\r\n');
   objTelnet.createSocket_();
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
