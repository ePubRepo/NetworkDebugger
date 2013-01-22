// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS AAAA record.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * @param {string} name Name of the AAAA record.
 * @param {integer} ttl Time to live.
 * @constructor
 */
DNSRecordAAAA = function(name, ttl) {
  this.name_ = name;
  this.type_ = DNSUtil.RecordNumber.AAAA;
  this.cl_ = 1;
  this.ttl_ = ttl;
};

// DNSRecordAAAA inherits from DNSRecord
// Replace with goog.inherits
DNSRecordAAAA.prototype = new DNSRecord();
DNSRecordAAAA.prototype.constructor = DNSRecordAAAA;
DNSRecordAAAA.prototype.parent = DNSRecordAAAA.prototype;

/**
 * IPv6 address.
 * @type {string}
 * @private
 */
DNSRecordAAAA.prototype.ip_ = null;


/**
 * Set the IPv6 address of the record.
 * @param {string} ip IPv6 address.
 */
DNSRecordAAAA.prototype.setIp = function(ip) {
  this.ip_ = ip;
};


/**
 * Return the IPv6 address pointed to by this AAAA record.
 * @return {string} IPv6 address.
 */
DNSRecordAAAA.prototype.getIp = function() {
  return this.ip_;
};
