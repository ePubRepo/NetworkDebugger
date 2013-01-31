// Copyright 2013. All Rights Reserved.

/**
 * Assist with handeling DNS input from the App.
 * @constructor
 */
DNSInputHelper = function() {};


/**
 * DOM ID of the DNS hostname field.
 * @type {string}
 * @private
 */
DNSInputHelper.prototype.domIdDnsHostname_ = 'dnsHostname';


/**
 * DOM ID of the DNS record type field.
 * @type {string}
 * @private
 */
DNSInputHelper.prototype.domIdDnsRecordType_ = 'dnsRecordType';


/**
 * DOM ID of the custom DNS resolver field.
 * @type {string}
 * @private
 */
DNSInputHelper.prototype.domIdDnsCustomResolverIp_ = 'dnsResolver';


/**
 * Determines whether the hostname is valid.
 * @return {boolean} True if the hostname is valid.
 */
//TODO: Substitute in a regular expression
DNSInputHelper.prototype.isValidHostnameEntered = function() {
   var hostname = document.getElementById(this.domIdDnsHostname_).value;
   return (hostname.length > 3);
};


/**
 * Obtain the hostname the user provided for lookup.
 * @return {string} Hostname user provided.
 */
DNSInputHelper.prototype.getHostnameEntered = function() {
   return document.getElementById(this.domIdDnsHostname_).value;
};


/**
 * Obtain the DNS resolver IP the user wishes to use for lookups.
 * @return {boolean} True if the ip is valid.
 */
DNSInputHelper.prototype.isValidCustomResolverIpEntered = function() {
    var ip = document.getElementById(this.domIdDnsCustomResolverIp_).value;
    return true;
};


/**
 * Obtain the hostname the user provided for lookup.
 * @return {string} User provided resolver IP.
 */
DNSInputHelper.prototype.getCustomResolverIp = function() {
   return document.getElementById(this.domIdDnsCustomResolverIp_).value;
};


/**
 * Obtain the DNS record type number the user wishes to lookup.
 * @return {int} DNS record type number.
 */
DNSInputHelper.prototype.getRecordType = function() {
  var recordType = document.getElementById(this.domIdDnsRecordType_).value;
  switch (recordType) {
    case 'MX':
       return DNSUtil.RecordNumber.MX;
    case 'AAAA':
       return DNSUtil.RecordNumber.AAAA;
    case 'CNAME':
       return DNSUtil.RecordNumber.CNAME;
    case 'TXT':
       return DNSUtil.RecordNumber.TXT;
    default:
      return DNSUtil.RecordNumber.A;
  }
};
