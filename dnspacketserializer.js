/**
 * Serialize a DNS packet to be sent over the socket.
 * @param {DNSPacket} dnsPacket The DNS packet to be serialized.
 * @constructor
 */
DNSPacketSerializer = function(dnsPacket) {
    this.dnsPacket_ = dnsPacket;
};

/**
 * DNS packet to be serialized.
 * @type {DNSPacker}
 * @private
 */
DNSPacketSerializer.prototype.dnsPacket_ = null;

/**
 * Serialize the DNS packet.
 * @return {ArrayBuffer} Serialized DNS packet.
 */
DNSPacketSerializer.prototype.serialize = function() {
    var out = new DataWriter();
    var arrPacketSections = [DNSUtil.PacketSection.QUESTION,
             DNSUtil.PacketSection.ANSWER,
             DNSUtil.PacketSection.AUTHORITY,
             DNSUtil.PacketSection.ADDITIONAL];

    out.short(0).short(this.dnsPacket_.flags_);

    arrPacketSections.forEach(function(packetSection) {
      out.short(this.dnsPacket_.data_[packetSection].length);
    }.bind(this));

    arrPacketSections.forEach(function(packetSection) {
      this.dnsPacket_.data_[packetSection].forEach(function(dnsRecord) {
        out.name(dnsRecord.name_).short(dnsRecord.type_).short(dnsRecord.cl_);

        if (packetSection != 'qd') {
          // TODO: implement .bytes()
          throw new Error('can\'t yet serialize non-QD records');
//          out.long(rec.ttl).bytes(rec.data_);
        }
      });
    }.bind(this));

    return out.buffer;
};

/**
 * Serialize this DNSPacket into an ArrayBuffer for sending over UDP.
 */
DNSPacket.prototype.serialize = function() {
    var serializer = new DNSPacketSerializer(this);
    return serializer.serialize();
};
