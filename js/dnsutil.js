// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Static utility class with enums and conversion functions.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Static helper class for DNS information.
 */
DNSUtil = function() {};


/**
 * Enum for DNS record type.
 * @enum {number}
 */
DNSUtil.RecordNumber = {
  A: 1,
  AAAA: 28,
  MX: 15,
  CNAME: 5,
  TXT: 16
};


/**
 * Enum for section of the DNS packet (i.e., type of resource record).
 * @enum {string}
 */
DNSUtil.PacketSection = {
  QUESTION: 'qd',
  ANSWER: 'an',
  AUTHORITY: 'ns',
  ADDITIONAL: 'ar'
};


/**
 * @param {string} name Name of DNS record type.
 * @return {DNSUtil.RecordNumber} RFC 1035 DNS record number type.
 */
DNSUtil.getRecordTypeNumByRecordTypeName = function(name) {
  switch (name.toUpperCase()) {
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


/**
 * Static function to return the DNS record type number.
 * @param {int} num DNS record type number.
 * @return {string} The DNS record type as a string.
 */
DNSUtil.getRecordTypeNameByRecordTypeNum = function(num) {
  switch (num) {
    case DNSUtil.RecordNumber.A:
      return 'A';

    case DNSUtil.RecordNumber.AAAA:
      return 'AAAA';

    case DNSUtil.RecordNumber.MX:
      return 'MX';

    case DNSUtil.RecordNumber.CNAME:
      return 'CNAME';

    case DNSUtil.RecordNumber.TXT:
      return 'TXT';
   }
};
