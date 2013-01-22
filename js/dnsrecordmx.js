// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS MX record.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * @param {string} name Name of the MX record.
 * @param {integer} ttl Time to live of the record.
 * @constructor
 */
DNSRecordMX = function(name, ttl) {
  this.name_ = name;
  this.type_ = DNSUtil.RecordNumber.MX;
  this.cl_ = 1;
  this.ttl_ = ttl;
};

// DNSRecordMX inherits from DNSRecord
// Replace with goog.inherits
DNSRecordMX.prototype = new DNSRecord();
DNSRecordMX.prototype.constructor = DNSRecordMX;
DNSRecordMX.prototype.parent = DNSRecordMX.prototype;

/**
 * Mail exchange host.
 * @type {string}
 * @private
 */
DNSRecordMX.prototype.mailExchanger_ = null;


/**
 * Preference number of the record.
 * @type {integer}
 * @private
 */
DNSRecordMX.prototype.preferenceNumber_ = null;

/**
 * Set the mail exchange of the record.
 * @param {string} mx Mail exchange address.
 */
DNSRecordMX.prototype.setMailExchanger = function(mx) {
  this.mailExchanger_ = mx;
};


/**
 * Return the mail exchange pointed to by this MX record.
 * @return {string} Mail exchange address.
 */
DNSRecordMX.prototype.getMailExchanger = function() {
  return this.mailExchanger_;
};


/**
 * Set the preference number of the record.
 * @param {integer} n Preference number.
 */
DNSRecordMX.prototype.setPreferenceNumber = function(n) {
  this.preferenceNumber_ = n;
};


/**
 * Return the preference number of this MX record.
 * @return {integer} MX record preference number.
 */
DNSRecordMX.prototype.getPreferenceNumber = function() {
  return this.preferenceNumber_;
};
