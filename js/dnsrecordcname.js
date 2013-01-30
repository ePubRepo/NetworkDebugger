// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS TXT record.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * @param {string} name Name of the CNAME record.
 * @param {integer} ttl Time to live of the record.
 * @constructor
 */
DNSRecordCNAME = function(name, ttl) {
  this.name_ = name;
  this.type_ = DNSUtil.RecordNumber.CNAME;
  this.cl_ = 1;
  this.ttl_ = ttl;
};

// DNSRecordTXT inherits from DNSRecord
// Replace with goog.inherits
DNSRecordCNAME.prototype = new DNSRecord();
DNSRecordCNAME.prototype.constructor = DNSRecordCNAME;
DNSRecordCNAME.prototype.parent = DNSRecordCNAME.prototype;

/**
 * Text value.
 * @type {string}
 * @private
 */
DNSRecordCNAME.prototype.cname_ = null;


/**
 * Set the cname of the record.
 * @param {string} cname Text value.
 */
DNSRecordCNAME.prototype.setCname = function(cname) {
  this.cname_ = cname;
};


/**
 * Return the cname stored by this record.
 * @return {string} CNAME value.
 */
DNSRecordCNAME.prototype.getCname = function() {
  return this.cname_;
};
