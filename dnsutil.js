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
 * Convert a number from one base to another, often used to convert from
 * decimal to hex (such as for parsing out an IPv6 from binary).
 * @param {int} n Number to be converted from one base to another.
 * @param {int} to Terminal base (usually 16).
 * @param {int} opt_from Optional source base.
 * @return {int} Number after conversion from the source base to
 *               the destination base.
 */
DNSUtil.baseConversion = function(n, to, opt_from) {
    return parseInt(n, from || 10).toString(to);
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
         break;

      case DNSUtil.RecordNumber.AAAA:
         return 'AAAA';
         break;

      case DNSUtil.RecordNumber.MX:
         return 'MX';
         break;

      case DNSUtil.RecordNumber.CNAME:
         return 'CNAME';
         break;

      case DNSUtil.RecordNumber.TXT:
          return 'TXT';
          break;
   }
};
