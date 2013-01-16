DNSPacketSerializerir = function(dnsPacket) {

};

/**
 * Serialize this DNSPacket into an ArrayBuffer for sending over UDP.
 */
DNSPacket.prototype.serialize = function() {
  var out = new DataWriter();
  var arrPacketSections = [DNSUtil.PacketSection.QUESTION,
           DNSUtil.PacketSection.ANSWER,
           DNSUtil.PacketSection.AUTHORITY,
           DNSUtil.PacketSection.ADDITIONAL];

  out.short(0).short(this.flags_);

  arrPacketSections.forEach(function(packetSection) {
    out.short(this.data_[packetSection].length);
  }.bind(this));

  arrPacketSections.forEach(function(packetSection) {
    this.data_[packetSection].forEach(function(dnsRecord) {
      out.name(dnsRecord.name_).short(dnsRecord.type_).short(dnsRecord.cl_);

      if (packetSection != 'qd') {
        // TODO: implement .bytes()
        throw new Error('can\'t yet serialize non-QD records');
//        out.long(rec.ttl).bytes(rec.data_);
      }
    });
  }.bind(this));

  return out.buffer;
};
