// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS TXT record.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * @param {string} name Name of the TXT record.
 * @param {integer} ttl Time to live of the record.
 * @constructor
 */
DNSRecordTXT = function(name, ttl) {
  this.name_ = name;
  this.type_ = DNSUtil.RecordNumber.TXT;
  this.cl_ = 1;
  this.ttl_ = ttl;
};

// DNSRecordTXT inherits from DNSRecord
// Replace with goog.inherits
DNSRecordTXT.prototype = new DNSRecord();
DNSRecordTXT.prototype.constructor = DNSRecordTXT;
DNSRecordTXT.prototype.parent = DNSRecordTXT.prototype;

/**
 * Text value.
 * @type {string}
 * @private
 */
DNSRecordTXT.prototype.txt_ = null;


/**
 * Set the text of the record.
 * @param {string} txt Text value.
 */
DNSRecordTXT.prototype.setText = function(txt) {
  this.txt_ = txt;
};


/**
 * Return the text value stored by this TXT record.
 * @return {string} Text value.
 */
DNSRecordTXT.prototype.getText = function() {
  return this.txt_;
};
