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
    var dnsSerializer = new Serializer();
    var arrPacketSections = [DNSUtil.PacketSection.QUESTION,
             DNSUtil.PacketSection.ANSWER,
             DNSUtil.PacketSection.AUTHORITY,
             DNSUtil.PacketSection.ADDITIONAL];

    dnsSerializer.short(0).short(this.dnsPacket_.flags_);

    arrPacketSections.forEach(function(packetSection) {
        dnsSerializer.short(this.dnsPacket_.data_[packetSection].length);
    }.bind(this));

    arrPacketSections.forEach(function(packetSection) {
      this.dnsPacket_.data_[packetSection].forEach(function(dnsRecord) {
          dnsSerializer.name(dnsRecord.name_).
             short(dnsRecord.type_).short(dnsRecord.cl_);
      });
    }.bind(this));

    return dnsSerializer.getBuffer();
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
 * Writes a DNS name. If opt_ref is specified, will finish this name with a
 * suffix reference (i.e., 0xc0 <ref>). If not, then will terminate with a NULL
 * byte.
 * 
 * @param {string} dnsName A DNS name such as "mail.google.com"
 * @return {Serializer} This instance of a Serializer.
 */
Serializer.prototype.name = function(dnsName, opt_ref) {
    var parts = dnsName.split('.');
    parts.forEach(function(part) {
        this.byte(part.length);
        for (var i = 0; i < part.length; ++i) {
            this.byte(part.charCodeAt(i));
        }
    }.bind(this));
  
    if (opt_ref) {
        this.byte(0xc0).byte(opt_ref);
    } else {
        this.byte(0);
    }
    return this;
};

/**
 * Return serialized ArrayBuffer representation of an object.
 * @return {ArrayBuffer}
 */
Serializer.prototype.getBuffer = function() {
    return this.buffer_;
};
