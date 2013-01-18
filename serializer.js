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

