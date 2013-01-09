DNSUtil = {};
DNSUtil.RecordNumber = {};
DNSUtil.RecordNumber.A = 1;
DNSUtil.RecordNumber.AAAA = 28;
DNSUtil.RecordNumber.MX = 15;
DNSUtil.RecordNumber.CNAME = 5;

DNSQueryManager = function(hostname, recordTypeNum, dnsServer) {
   this._hostname = hostname;
   this._recordTypeNum = recordTypeNum;
   this._dnsServer = dnsServer;
};

DNSQueryManager.prototype._hostname = null;
DNSQueryManager.prototype._recordTypeNum = null;
DNSQueryManager.prototype._dnsServer = null;
