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

