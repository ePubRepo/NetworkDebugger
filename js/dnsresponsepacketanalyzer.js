// Copyright 2013. All Rights Reserved.

/**
 * Parse a completed DNS response.
 * @param {DNSQueryManager} queryManager DNS query manager with query and
 *                                       response.
 * @this
 */
DNSResponsePacketAnalyzer = function(queryManager) {
  this.dnsQueryManager_ = queryManager;
};


/**
 * @type {Array}
 * @private
 */
DNSResponsePacketAnalyzer.googleIp4Netblock_ = [
  '216.239.32.0/19', '64.233.160.0/19', '66.249.80.0/20', '72.14.192.0/18',
  '209.85.128.0/17', '66.102.0.0/20', '74.125.0.0/16', '64.18.0.0/20',
  '207.126.144.0/20', '173.194.0.0/16'
];


/**
 * @type {Array}
 * @private
 */
DNSResponsePacketAnalyzer.googleIp6Netblock_ = [
  '6:2607:f8b0:4000::/36', '2a00:1450:4000::/36'
];


/**
 * DNS query manager containing a query and response.
 *
 * @type {DNSQueryManager}
 * @private
 */
DNSResponsePacketAnalyzer.prototype.dnsQueryManager_ = null;

/**
 * Return DNS query manager containing the query and its response.
 *
 * @return {DNSQueryManager} DNS query manager containing the query and its
 *                           response.
 */
DNSResponsePacketAnalyzer.prototype.getDnsQueryManager = function() {
  return this.dnsQueryManager_;
};


/**
 * Print the default packet response.
 */
DNSResponsePacketAnalyzer.prototype.defaultPrintResponse = function() {
    // represent question section
    this.dnsQueryManager_.getResponsePacket().each(
                              DNSUtil.PacketSection.QUESTION,
                              function(dnsPacket) {}.bind(this));

    // represent answer section
    function analyzeAnswerResponsePackets(dnsPacket) {
      var str = '';
      str += DNSUtil.getRecordTypeNameByRecordTypeNum(
                                   dnsPacket.getType()) +
      ' record with name ' +
      dnsPacket.getName() + ' and TTL ' + dnsPacket.getTTL() +
      ' and data section of ' + dnsPacket.getDataText() + '\r\n';
      this.dnsQueryManager_.getOutputRecordManager().pushEntry(
          OutputRecord.DetailLevel.INFO,
          str);
    };


    this.dnsQueryManager_.getResponsePacket().each(
      DNSUtil.PacketSection.ANSWER, analyzeAnswerResponsePackets.bind(this));

    // represent authority section
    this.dnsQueryManager_.getResponsePacket().each(
                              DNSUtil.PacketSection.AUTHORITY,
                              function(dnsPacket) {});
};
