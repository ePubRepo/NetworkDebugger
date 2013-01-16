/**
 * DNSPacket holds the state of a DNS packet such as a question record and
 * associated responses.
 *
 * @param {integer} opt_flags Numerical flags to set in the DNS header.
 *                            For example, 0x100 sets the packet to a recursive
 *                            query. See Section 4.1.1 of RFC 1035.
 * @constructor
 */
var DNSPacket = function(opt_flags) {
    this.flags_ = opt_flags || 0;
    // TODO: Make this an enum
    this.data_ = {
            'qd': [], // 'qd'
            'an': [], // 'an'
            'ns': [], // 'ns'
            'ar': [] // 'ar'
    };
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
 * @param {DNSUtil.PacketSection} Section of the DNS record.
 * @param {DNSRecord} DNS record to add to this packet.
 */
DNSPacket.prototype.push = function(packetSection, dnsRecord) {
    this.data_[packetSection].push(dnsRecord);
};

/**
 * @param {DNSUtil.PacketSection} Section of the DNS record.
 */
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

/**
 * Parse a DNSPacket from an ArrayBuffer (or Uint8Array).
 * Read in raw binary data from the socket and create a new packet.
 */
DNSPacket.parse = function(buffer, lblPointManager) {
  var consumer = new DataConsumer(buffer);

  var firstTwoBytes = consumer.short();
  console.log("First Two Bytes of packet: " + firstTwoBytes);
  if (firstTwoBytes) {
    throw new Error('DNS packet must start with 00 00');
  }

  console.log(" * Parsed Beginning, Total Read Bytes: " + consumer.getBytesRead());

  // Most DNS servers will return a UDP packet such that 
  // the value of flags is something like "33152"
  // (flags will be an integer decimal)
  // when "33152" is converted to binary, the value is:
  // "1000000110000000" This is 16 bits or 2 bytes
  var flags = consumer.short();

  console.log(" * Parsed Flags, Total Read Bytes: " + consumer.getBytesRead());

  var count = {
    'qd': consumer.short(),
    'an': consumer.short(),
    'ns': consumer.short(),
    'ar': consumer.short(),
  };

  console.log("Query (QD) Record Count: " + count['qd']);
  console.log("Answer (AN) Record Count: " + count['an']);
  console.log("Authority (NS) Record Count: " + count['ns']);
  console.log("Additional (AR) Record Count: " + count['ar']);

  console.log(" * Parsed Header, Total Read Bytes: " + consumer.getBytesRead());

  var packet = new DNSPacket(flags);

  // Parse the QUESTION section.
  for (var i = 0; i < count['qd']; ++i) {
        console.log("About to Parse DNS Record Name... Total Read Bytes: " + consumer.getBytesRead());
    var part = new DNSRecord(
        consumer.name(lblPointManager),   // name
        consumer.short(),  // type
        consumer.short()); // class
    part.setLblPointManager(lblPointManager); // set label point manager so individual record has access to entire response packet to reassemble names
    packet.push('qd', part);
  }

  console.log(" * Parsed Question, Total Read Bytes: " + consumer.getBytesRead());

  // Parse the ANSWER, AUTHORITY and ADDITIONAL sections.
  ['an', 'ns', 'ar'].forEach(function(section) {
    for (var i = 0; i < count[section]; ++i) {
      console.log(" * Parsing Starting for new DNSRecord, Total Read Bytes: " + consumer.getBytesRead());
      var recName = consumer.name(lblPointManager);
      var recType = consumer.short(); // type
      var recClass = consumer.short(); // class
      var recTTL = consumer.long(); // TTL
      var dataLength = consumer.short(); // resource data length
      var part = new DNSRecord(
          recName,
          recType,
          recClass,
          recTTL,
          consumer.slice(dataLength));
      part.setLblPointManager(lblPointManager); // set label point manager so individual record has access to entire response packet to reassemble names
      packet.push(section, part);
      console.log("DNS Record Name: " + recName);
      console.log("DNS Record Type: " + recType);
      console.log("DNS Record Class: " + recClass);
      console.log("DNS Record TTL: " + recTTL);
      console.log("DNS Record Data Length: " + dataLength);
      console.log(" * Parsing Finished for new DNSRecord, Total Read Bytes: " + consumer.getBytesRead());
    }
  });

  console.log(" * Parsing Finished, Total Read Bytes: " + consumer.getBytesRead());

  consumer.isEOF() || console.warn('was not EOF on incoming packet');
  return packet;
};
 
