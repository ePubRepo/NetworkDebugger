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
    var dataSerializer = new Serializer();
    var arrPacketSections = [DNSUtil.PacketSection.QUESTION,
             DNSUtil.PacketSection.ANSWER,
             DNSUtil.PacketSection.AUTHORITY,
             DNSUtil.PacketSection.ADDITIONAL];

    dataSerializer.short(0).short(this.dnsPacket_.flags_);

    arrPacketSections.forEach(function(packetSection) {
        dataSerializer.short(this.dnsPacket_.data_[packetSection].length);
    }.bind(this));

    arrPacketSections.forEach(function(packetSection) {
      this.dnsPacket_.data_[packetSection].forEach(function(dnsRecord) {
          this.serializeName(dnsRecord.name_, dataSerializer).
             short(dnsRecord.type_).short(dnsRecord.cl_);
      }.bind(this));
    }.bind(this));

    return dataSerializer.getBuffer();
};

/**
 * Writes a DNS name to a specified data serializer.
 * If opt_ref is specified, will finish this name with a
 * suffix reference (i.e., 0xc0 <ref>). If not, then will terminate with a NULL
 * byte.
 *
 * @param {string} dnsName A DNS name such as "mail.google.com".
 * @param {Serializer} dnsSerializer Data serializer being used to serialize
 *                                   a DNS packet.
 * @param {integer} opt_ref Packet location of DNS name being referenced.
 *                            See Section 4.1.4 of RFC 1035.
 * @return {Serializer} This instance of a Serializer.
 */
DNSPacketSerializer.prototype.serializeName = function(dnsName,
                                                       dnsSerializer,
                                                       opt_ref) {
    var parts = dnsName.split('.');
    parts.forEach(function(part) {
        dnsSerializer.byte(part.length);
        for (var i = 0; i < part.length; ++i) {
            dnsSerializer.byte(part.charCodeAt(i));
        }
    }.bind(this));

    if (opt_ref) {
        dnsSerializer.byte(0xc0).byte(opt_ref);
    } else {
        dnsSerializer.byte(0);
    }
    return dnsSerializer;
};


/**
 * Serializer writes an object data to an ArrayBuffer.
 * @constructor
 */
Serializer = function() {
    this.loc_ = 0;
    this.view_ = new Uint8Array(new ArrayBuffer(512));
};

/**
 * Unit8Array to store bytes of serialized data.
 * @type {Unit8Array}
 * @private
 */
Serializer.prototype.view_ = null;

/**
 * Current working location in the ArrayBuffer.
 * @type {integer}
 * @private
 */
Serializer.prototype.loc_ = null;

/**
 * Add a byte of data to the ArrayBuffer.
 * @param {integer} b Byte of binary data to add to the ArrayBuffer.
 * @return {Serializer} This instance of a Serializer.
 */
Serializer.prototype.byte = function(b) {
    this.view_[this.loc_] = b;
    ++this.loc_;
    this.buffer_ = this.view_.buffer.slice(0, this.loc_);
    return this;
};

/**
 * Add two bytes of data to an ArrayBuffer.
 * @param {integer} b Two bytes of binary data to add to the ArrayBuffer.
 * @return {Serializer} This instance of a Serializer.
 */
Serializer.prototype.short = function(b) {
    return this.byte((b >> 8) & 0xff).byte(b & 0xff);
};

/**
 * Return serialized ArrayBuffer representation of an object.
 * @return {ArrayBuffer} ArrayBuffer representation of an object.
 */
Serializer.prototype.getBuffer = function() {
    return this.buffer_;
};
