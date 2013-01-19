// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview A DNS packet that stores DNS records.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * DNSPacket holds the state of a DNS packet such as a question record and
 * associated responses along with other associated records.
 *
 * @param {integer} opt_flags Numerical flags to set in the DNS header.
 *                            For example, 0x100 sets the packet to a recursive
 *                            query. See Section 4.1.1 of RFC 1035.
 * @constructor
 */
DNSPacket = function(opt_flags) {
  this.flags_ = opt_flags || 0;

  this.data_ = {};
  this.data_[DNSUtil.PacketSection.QUESTION] = [];
  this.data_[DNSUtil.PacketSection.ANSWER] = [];
  this.data_[DNSUtil.PacketSection.AUTHORITY] = [];
  this.data_[DNSUtil.PacketSection.ADDITIONAL] = [];
};


/**
 * Return the number of answer records in the DNS packet.
 * @return {integer} Number of DNS records in the answer section of the
 *                   DNS packet.
 */
DNSPacket.prototype.getAnswerRecordCount = function() {
  return this.data_[DNSUtil.PacketSection.ANSWER].length;
};


/**
 * Add a DNS record to a particular section of this DNS packet.
 * @param {DNSUtil.PacketSection} packetSection Section of the DNS record.
 * @param {DNSRecord} dnsRecord DNS record to add to this packet.
 */
DNSPacket.prototype.push = function(packetSection, dnsRecord) {
  this.data_[packetSection].push(dnsRecord);
};


/**
 * @param {DNSUtil.PacketSection} packetSection Section of the DNS record.
 */
//TODO: Clean this up
DNSPacket.prototype.each = function(packetSection) {
  var filter = false;
  var callback;
  if (arguments.length == 2) {
    callback = arguments[1];
  } else {
    filter = arguments[1];
    callback = arguments[2];
  }

  this.data_[packetSection].forEach(function(rec) {
    if (!filter || rec.type == filter) {
        callback(rec);
    }
  });
};
