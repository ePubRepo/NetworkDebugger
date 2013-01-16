
/**
 * DataWriter writes data to an ArrayBuffer, presenting it as the instance
 * variable 'buffer'.
 *
 * @constructor
 */
var DataWriter = function(opt_size) {
  var loc = 0;
  var view = new Uint8Array(new ArrayBuffer(opt_size || 512));

  this.byte_ = function(v) {
    view[loc] = v;
    ++loc;
    this.buffer = view.buffer.slice(0, loc);
  }.bind(this);
};

DataWriter.prototype.byte = function(v) {
  this.byte_(v);
  return this;
};

DataWriter.prototype.short = function(v) {
  return this.byte((v >> 8) & 0xff).byte(v & 0xff);
};

DataWriter.prototype.long = function(v) {
  return this.short((v >> 16) & 0xffff).short(v & 0xffff);
};

/**
 * Writes a DNS name. If opt_ref is specified, will finish this name with a
 * suffix reference (i.e., 0xc0 <ref>). If not, then will terminate with a NULL
 * byte.
 */
DataWriter.prototype.name = function(v, opt_ref) {
  var parts = v.split('.');
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

var ResponseLabelPointerManager = function(arg) {
    if (arg instanceof Uint8Array) {
        this.view_ = arg;
    } else {
        this.view_ = new Uint8Array(arg);
    }
    console.log("Response Label Pointer Manager Initiated... Has " + this.view_.byteLength + " bytes");
};

ResponseLabelPointerManager.prototype.getNameFromReference = function(ref) {
    console.log("Request to Get Name Starting at Offset Byte: " + ref);
    
    // Array Buffer containing from the beginning offset to the end
    var subArrayBuffer = this.view_.subarray(ref);
    var subDataConsumer = new DataConsumer(subArrayBuffer);
    
    var subName = subDataConsumer.name(this);
    console.log("Name at Offset: " + subName);
    return subName;
};

ResponseLabelPointerManager.prototype.view_ = 0;

/**
 * DataConsumer consumes data from an ArrayBuffer.
 *
 * @constructor
 */
var DataConsumer = function(arg) {
  if (arg instanceof Uint8Array) {
    this.view_ = arg;
  } else {
    this.view_ = new Uint8Array(arg);
  }
  this.loc_ = 0;
};

/**
 * @return whether this DataConsumer has consumed all its data
 */
DataConsumer.prototype.isEOF = function() {
  // this indicates that loc_ is incremented in bytes
  return this.loc_ >= this.view_.byteLength;
};

/**
 * @param length {integer} number of bytes to return from the front of the view
 * @return a Uint8Array 
 */
DataConsumer.prototype.slice = function(length) {
  var view = this.view_.subarray(this.loc_, this.loc_ + length);
  this.loc_ += length;
  return view;
};

DataConsumer.prototype.byte = function() {
  // incrementing this by 1 seems to indicate that this
  // function returns one byte at a time (i.e., 8 bits)
  this.loc_ += 1;
  return this.view_[this.loc_ - 1];
};

DataConsumer.prototype.short = function() {
  // seems to return two bytes of data
  return (this.byte() << 8) + this.byte();
};

DataConsumer.prototype.long = function() {
  return (this.short() << 16) + this.short();
};

DataConsumer.prototype.getBytesRead = function() {
  return this.loc_;
};

DataConsumer.prototype.getTotalBytes = function() {
  return this.view_.byteLength;
};

Math.base = function base(n, to, from) {
    return parseInt(n, from || 10).toString(to);
}

DataConsumer.prototype.parseDataSection = function(recordTypeNum, lblPtManager) {
  var dataSectionTxt = "";
  console.log("DataConsumer.parseDataSection operating on " + this.getTotalBytes() + " total bytes for record of type " + recordTypeNum);
  console.log("DNS Record Type to Parse Data Section of: " + recordTypeNum);
  switch (recordTypeNum) {
     case DNSUtil.RecordNumber.A:
         var arrOctect = [];
         while (!this.isEOF()) {
             arrOctect.push(this.byte());
             }
         dataSectionTxt = arrOctect.join(".");
         break;
     case DNSUtil.RecordNumber.AAAA:
         // take 16 byte data and turn it into the 16 bytes of an IPv6 address
         var nibbleNum = 0;
         while (!this.isEOF()) {
             var nextByte = this.byte();
             var nibbleADec = (nextByte & 0xf0) >> 4;
             var nibbleAHex = Math.base(nibbleADec, 16);
             nibbleNum++;
             
             var nibbleBDec = nextByte & 0x0f;
             var nibbleBHex =  Math.base(nibbleBDec, 16);
             nibbleNum++;
             
             dataSectionTxt += nibbleAHex + nibbleBHex;
             if (nibbleNum % 4 == 0 && nibbleNum < 32) dataSectionTxt += ':'; 
         }
         break;
     case DNSUtil.RecordNumber.CNAME:
         while (!this.isEOF()) {
             var nextByte = this.byte();
             var nextChar = String.fromCharCode(nextByte);
             console.log("next byte: " + nextByte + " -- next char: " + nextChar);
             dataSectionTxt += nextChar;
             }
         break;
     case DNSUtil.RecordNumber.TXT:
         while (!this.isEOF()) {
             var nextByte = this.byte();
             var nextChar = String.fromCharCode(nextByte);
             console.log("next byte: " + nextByte + " -- next char: " + nextChar);
             dataSectionTxt += nextChar;
             }
         break;
     case DNSUtil.RecordNumber.MX:
         var preferenceNum = this.short();
         console.log("MX Preference Number " + preferenceNum);
         dataSectionTxt += "Preference #: " + preferenceNum;
         dataSectionTxt += " // MX: " + this.name(lblPtManager);
         break;
  }
  return dataSectionTxt;
};

/**
 * Consumes a DNS name, which will either finish with a NULL byte or a suffix
 * reference (i.e., 0xc0 <ref>).
 */
DataConsumer.prototype.name = function(lblPtManager) {
  console.log(this);
  var parts = [];
  for (;;) {
    console.log("DataConsumer.name() - Begin - Bytes Read: " + this.getBytesRead() + " of total " + this.getTotalBytes());
    var len = this.byte();
 
    console.log("Length/Label Read - Total Bytes Read: " + this.getBytesRead());
    if (!len) {
      console.log("Quitting Read Part of DataConsumer.name() Function");
      break;
    } else if (len == 0xc0) {
      // TODO: It is technically only the high order two bits of the 16 bit
      // section that need to be ones... a label could be very large, so
      // checking against 0xc0 isn't 100% safe
        
      // TODO: This indicates a pointer to another valid name inside the
      // DNSPacket, and is always a suffix: we're at the end of the name.
      // We should probably hold onto this value instead of discarding it.
      var ref = this.byte();
      console.log("Pointer to Valid Name: " + ref);
      var nameSubstitution = lblPtManager.getNameFromReference(ref);
      parts.push(nameSubstitution);
      break;
    }
    
    console.log("Expected Length of Name: " + len);

    // Otherwise, consume a string!
    var v = '';
    console.log("Consuming String... " + len + " bytes left");
    console.log("Bytes Read: " + this.getBytesRead());
    while (len-- > 0) {
      var nextByte = this.byte();
      console.log(len + " bytes left in string; read byte: " + nextByte);
      var nextChar = String.fromCharCode(nextByte);
      console.log(len + " bytes left in string; read char: " + nextChar);
      v += nextChar;
      console.log("Bytes Read: " + this.getBytesRead());
    }
    console.log("String Name: " + v);
    parts.push(v);
  }
  console.log("DataConsumer.name() - End - Bytes Read: " + this.getBytesRead() + " of total " + this.getTotalBytes());

  return parts.join('.');
};
