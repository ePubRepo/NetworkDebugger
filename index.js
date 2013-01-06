document.addEventListener('DOMContentLoaded', function () {
  // add listeners for tcp telnet tests
  document.getElementById('gHttpBtn').addEventListener('click', gHttpBtnClick);

  // add listeners for udp dns tests
  document.getElementById('gDnsBtn').addEventListener('click', gDnsBtnClick);
});

function gDnsBtnClick() {
   var hostname = document.getElementById("dnsHostname").value;
   var recordType = document.getElementById("dnsRecordType").value;
   publicUdpDnsQuery3(hostname, DNSUtil.RecordNumber.A);
}
