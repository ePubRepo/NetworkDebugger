
/**
 * Deserializer consumes data from an ArrayBuffer.
 *
 * @param {ArrayBuffer|Unit8Array} arg ArrayBuffer of binary data.
 * @constructor
 */
Deserializer = function(arg) {
    if (arg instanceof Uint8Array) {
        this.view_ = arg;
    } else {
        this.view_ = new Uint8Array(arg);
    }
    this.loc_ = 0;
};

/**
 * Byte number of the internal pointer used to read through the ArrayBuffer.
 * @type {integer}
 * @private
 */
Deserializer.prototype.loc_ = 0;

/**
 * Determine whether Deserializer has read through all input data.
 * @return {boolean} Whether this DataConsumer has consumed all its data.
 * @private
 */
Deserializer.prototype.isEOF_ = function() {
    // check if current location, in bytes, is greater than length of data
    return (this.loc_ >= this.view_.byteLength);
};

/**
 * Return a sub array starting from the current location of a specified length.
 * @param {integer} length Number of bytes to return from front of the view.
 * @return {Uint8Array} A subsection of the larger ArrayBuffer.
 */
Deserializer.prototype.slice = function(length) {
  var view = this.view_.subarray(this.loc_, this.loc_ + length);
  this.loc_ += length;
  return view;
};

/**
 * Return the next byte of data as a decimal.
 * @return {integer} Integer representing data stored in a single byte.
 * @private
 */
Deserializer.prototype.byte_ = function() {
  this.loc_ += 1;
  return this.view_[this.loc_ - 1];
};

/**
 * Return the next two bytes of data as a base 10 integer.
 * @return {integer} Two bytes of data as a base 10 integer.
 */
Deserializer.prototype.short = function() {
    return (this.byte_() << 8) + this.byte_();
};

/**
 * Return the next four bytes of data as a base 10 integer.
 * @return {integer} Four bytes of data as a base 10 integer.
 */
Deserializer.prototype.long = function() {
  return (this.short() << 16) + this.short();
};

/**
 * Return the number of bytes read this far in the process of deserializer.
 * @return {integer} Number of bytes read.
 */
Deserializer.prototype.getBytesRead = function() {
  return this.loc_;
};

/**
 * Return the total number of bytes received to parse.
 * @return {integer} Total number of bytes received in the input ArrayBuffer.
 */
Deserializer.prototype.getTotalBytes = function() {
  return this.view_.byteLength;
};

/**
 * Parse the data section of a DNS packet, reassembling DNS names based upon
 * DNS compression and parsing based upon various record types.
 * @param {DNSUtil.RecordNumber} recordTypeNum DNS record type number.
 * @param {ResponseLabelPointerManager} lblPtManager Label manager to help
 *                                                   reassemble DNS names.
 * @return {string} Text representation of a data section of a DNS record.
 */
// TODO: move into DNSPackerDeseralizer
Deserializer.prototype.parseDataSection = function(recordTypeNum,
                                                   lblPtManager) {
  var dataSectionTxt = '';
  switch (recordTypeNum) {
     case DNSUtil.RecordNumber.A:
         var arrOctect = [];
         while (!this.isEOF_()) {
             arrOctect.push(this.byte_());
         }
         dataSectionTxt = arrOctect.join('.');
         break;

     case DNSUtil.RecordNumber.AAAA:
         // take 16 byte data and parse into the 16 bytes of an IPv6 address
         var nibbleNum = 0;
         while (!this.isEOF_()) {
             var nextByte = this.byte_();
             var nibbleADec = (nextByte & 0xf0) >> 4;
             var nibbleAHex = DNSUtil.baseConversion(nibbleADec, 16);
             nibbleNum++;

             var nibbleBDec = nextByte & 0x0f;
             var nibbleBHex = DNSUtil.baseConversion(nibbleBDec, 16);
             nibbleNum++;

             dataSectionTxt += nibbleAHex + nibbleBHex;
             if (nibbleNum % 4 == 0 && nibbleNum < 32) dataSectionTxt += ':';
         }
         break;

     case DNSUtil.RecordNumber.CNAME:
         while (!this.isEOF_()) {
             var nextByte = this.byte_();
             var nextChar = String.fromCharCode(nextByte);
             dataSectionTxt += nextChar;
         }
         break;

     case DNSUtil.RecordNumber.TXT:
         while (!this.isEOF_()) {
             var nextByte = this.byte_();
             var nextChar = String.fromCharCode(nextByte);
             dataSectionTxt += nextChar;
         }
         break;

     case DNSUtil.RecordNumber.MX:
         var preferenceNum = this.short();
         dataSectionTxt += 'Preference #: ' + preferenceNum;
         dataSectionTxt += ' // MX: ' + this.name(lblPtManager);
         break;
  }
  return dataSectionTxt;
};

/**
 * Consumes a DNS name, which will either finish with a NULL byte or a suffix
 * reference (i.e., 0xc0 <ref>).
 * @param {ResponseLabelPointerManager} lblPtManager Reassemble compressed
 *                                                   DNS names.
 * @return {string} Text representation of a name section of a DNS record.
 */
//TODO: move into DNSPackerDeseralizer
Deserializer.prototype.name = function(lblPtManager) {
  var parts = [];
  for (;;) {
    var len = this.byte_();

    // Examine the length bit to determine whether what is coming is
    // a label reference or a length of a name.
    if (!len) {
      // TODO: quitting
      break;
    } else if (len == 0xc0) {
      // TODO: It is technically only the high order two bits of the 16 bit
      // section that need to be ones... a label could be very large, so
      // checking against 0xc0 isn't 100% safe

      var ref = this.byte_();
      var nameSubstitution = lblPtManager.getNameFromReference(ref);
      parts.push(nameSubstitution);
      break;
    }

    // consume a DNS name
    var v = '';
    while (len-- > 0) {
      var nextByte = this.byte_();
      var nextChar = String.fromCharCode(nextByte);
      v += nextChar;
    }
    parts.push(v);
  }
  return parts.join('.');
};
