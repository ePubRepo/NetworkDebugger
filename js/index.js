// Copyright 2013. All Rights Reserved.

document.addEventListener('DOMContentLoaded', function() {
  // add listeners for running general diagnostics
  document.getElementById('runDiagnosticsBtn').addEventListener('click',
      AppGuiManager.runDiagnostics);
  document.getElementById('advancedOptionsToggleBtn').addEventListener('click',
      AppGuiManager.toggleAdvancedOptions);
  
  // add listeners for loading, quitting, or running test configurations
  document.getElementById('loadTestConfigBtn').addEventListener('click',
      AppGuiManager.showLoadTestConfigurationsGui);
  document.getElementById('quitConfigLoadScreenBtn').addEventListener('click',
      AppGuiManager.hideLoadTestConfigurationsGui);
  document.getElementById('runLoadedTests').addEventListener('click',
      AppGuiManager.processInputTestConfigurations);

  // add listeners to console control
  document.getElementById('consoleClearBtn')
      .addEventListener('click', AppGuiManager.consoleClearBtnClicked);
  document.getElementById('consoleCopyBtn')
      .addEventListener('click', AppGuiManager.consoleCopyBtnClicked);
});

// function for callback and display of DNS results
// TODO: Turn this into an object
function finishedDnsFnc(completedDnsQueryManager) {
  var analyzer = new DNSResponsePacketAnalyzer(completedDnsQueryManager);
  analyzer.defaultPrintResponse();
  var analyzedQueryManager = analyzer.getDnsQueryManager();
  var finishedOutputRecordManager =
    analyzer.getDnsQueryManager().getOutputRecordManager();
  var finishedOutputRecords = finishedOutputRecordManager.getOutputRecords();

  for (var n = 0; n < finishedOutputRecords.length; n++) {
    AppGuiManager.printOutputToScreenConsole(
               finishedOutputRecords[n].getMessage(),
               finishedOutputRecords[n].getLevel(),
               finishedOutputRecords[n].getTimestamp());
  }
}


function basicDiagnostics() {
  // hosts to query Google Public DNS

  for (var i = 0; i < Util.hostnamesToTest.length; i++) {
    var outputRecordManager = new OutputRecorderManager();
    var gDnsQuery = new DNSQueryManager(Util.hostnamesToTest[i],
        DNSUtil.RecordNumber.A,
        '8.8.8.8',
        finishedDnsFnc,
        outputRecordManager);
    gDnsQuery.sendRequest();
  }
}

function l3DnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new OutputRecorderManager();
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '209.244.0.3',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}


function oDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new OutputRecorderManager();
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '208.67.222.222',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}


function gDnsBtnClick() {
   var inputHelper = new DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new OutputRecorderManager();
     var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '8.8.8.8',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}


function whoAmIDnsBtnClick() {
  var outputRecordManager = new OutputRecorderManager();
    var gDnsQuery = new DNSQueryManager('o-o.myaddr.google.com',
            DNSUtil.RecordNumber.TXT,
            '8.8.8.8',
            finishedDnsFnc,
            outputRecordManager);
        gDnsQuery.sendRequest();
}


function customDnsBtnClick() {
    var inputHelper = new DNSInputHelper();
    if (inputHelper.isValidHostnameEntered() &&
            inputHelper.isValidCustomResolverIpEntered()) {
      var outputRecordManager = new OutputRecorderManager();
      var gDnsQuery = new DNSQueryManager(inputHelper.getHostnameEntered(),
          inputHelper.getRecordType(),
          inputHelper.getCustomResolverIp(),
          finishedDnsFnc,
          outputRecordManager);
      gDnsQuery.sendRequest();
    }
}


function printFinishedTelnetOutput(outputRecordManager) {
  var nicOutputRecords = outputRecordManager.getOutputRecords();
  for (var j = 0; j < nicOutputRecords.length; j++) {
    AppGuiManager.printOutputToScreenConsole(
               nicOutputRecords[j].getMessage(),
               nicOutputRecords[j].getLevel(),
               nicOutputRecords[j].getTimestamp());
  }
}

function gHttpBtnClick() {
  var outputRecordManager = new OutputRecorderManager();
  var objTelnet = new Telnet('www.google.com', 80, outputRecordManager);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket_();
}


function mHttpBtnClick() {
  var outputRecordManager = new OutputRecorderManager();
  var objTelnet = new Telnet('mail.google.com', 80, outputRecordManager);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: mail.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket_();
}


function dHttpBtnClick() {
  var outputRecordManager = new OutputRecorderManager();
  var objTelnet = new Telnet('drive.google.com', 80, outputRecordManager);
   objTelnet.
     setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: drive.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket_();
}

function networkInterfaceInformationBtnClick() {
  function printOutput(outputRecordManager) {
    var nicOutputRecords = outputRecordManager.getOutputRecords();
    for (var j = 0; j < nicOutputRecords.length; j++) {
      AppGuiManager.printOutputToScreenConsole(
                 nicOutputRecords[j].getMessage(),
                 nicOutputRecords[j].getLevel(),
                 nicOutputRecords[j].getTimestamp());
    }
  }

  var outputRecordManager = new OutputRecorderManager();
  var nicInfo = new NetworkInterfaceInformation(outputRecordManager,
                                                printOutput);
  nicInfo.getNicInformation();
}
