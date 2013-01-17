/**
 * Take an ArrayBuffer of binary data from a socket and parse a DNSPacket.
 * @param {ArrayBuffer} arBuffer ArrayBuffer of binary data representing a
 *                               DNS packet.
 * @param {ResponseLabelPointerManager} lblPointManager Reassemble compressed
 *                                                      DNS names.
 * @constructor
 */
DNSPacketDeserializer = function(arBuffer, lblPointManager) {
    this.consumer_ = new DataConsumer(arBuffer);
    this.lblPointManager_ = lblPointManager;
    this.deserializePacket();
};

/**
 * Parsed and deserialized DNS packet.
 * @type {DNSPacket}
 * @private
 */
DNSPacketDeserializer.prototype.deserializedPacket_ = null;

/**
 * Parse binary data from an ArrayBuffer and store it as a DNSPacket.
 */
DNSPacketDeserializer.prototype.deserializePacket = function() {
    // check the initial two bytes of the packet, which must start with 0s
    var firstTwoBytes = this.consumer_.short();
    if (firstTwoBytes) {
        //TODO: Implement more sanity checks and process errors
        console.log('DNS packet must start with 00 00');
    }

    // Most DNS servers will return a UDP packet such that
    // the value of flags is something like "33152"
    // (flags will be an integer decimal)
    // when "33152" is converted to binary, the value is:
    // "1000000110000000" This is 16 bits or 2 bytes
    var flags = this.consumer_.short();

    var sectionCount = {
            'qd': this.consumer_.short(),
            'an': this.consumer_.short(),
            'ns': this.consumer_.short(),
            'ar': this.consumer_.short()
    };

    var packet = new DNSPacket(flags);

    // Parse the QUESTION section.
    for (var i = 0; i < sectionCount['qd']; ++i) {
      var part = new DNSRecord(
          // dns record name
          this.consumer_.name(this.lblPointManager_),

          // dns record type
          this.consumer_.short(),

          // dns record class
          this.consumer_.short());

      // set label point manager so individual record has access to entire
      // response packet to reassemble compressed DNS names
      part.setLblPointManager(this.lblPointManager_);

      // add DNS record to broader DNS packet
      packet.push('qd', part);
    }

    // Parse the ANSWER, AUTHORITY and ADDITIONAL sections.
    var parseSections = ['an', 'ns', 'ar'];
    parseSections.forEach(function(section) {
      for (var i = 0; i < sectionCount[section]; ++i) {

        // See Section 3.2.1 in RFC 1035.
        var recName = this.consumer_.name(this.lblPointManager_);
        var recType = this.consumer_.short();
        var recClass = this.consumer_.short();
        var recTTL = this.consumer_.long();

        // obtain the length of the resource record data section
        // See RDLENGTH of Section 3.2.1 in RFC 1035.
        var dataLength = this.consumer_.short();
        var part = new DNSRecord(
            recName,
            recType,
            recClass,
            recTTL,
            this.consumer_.slice(dataLength));

        // set label point manager so individual record has access to entire
        // response packet to reassemble compressed DNS names
        part.setLblPointManager(this.lblPointManager_);
        packet.push(section, part);
      }
    }.bind(this));

    this.consumer_.isEOF() || console.warn('was not EOF on incoming packet');
    this.deserializedPacket_ = packet;
};

/**
 * Return the parsed DNS packet.
 * @return {DNSPacket} Parsed DNS packet with associated DNS records.
 */
DNSPacketDeserializer.prototype.getDeserializedPacket = function() {
    return this.deserializedPacket_;
};
