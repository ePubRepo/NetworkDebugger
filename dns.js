
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

/**
 * Consumes a DNS name, which will either finish with a NULL byte or a suffix
 * reference (i.e., 0xc0 <ref>).
 */
DataConsumer.prototype.name = function() {
  var parts = [];
  for (;;) {
    console.log("Bytes Read: " + this.getBytesRead());
    var len = this.byte();
    console.log("Expected Length of Name: " + len);
    console.log("Bytes Read: " + this.getBytesRead());
    if (!len) {
      break;
    } else if (len == 0xc0) {
      // TODO: This indicates a pointer to another valid name inside the
      // DNSPacket, and is always a suffix: we're at the end of the name.
      // We should probably hold onto this value instead of discarding it.
      var ref = this.byte();
      console.log("Pointer to Valid Name: " + ref);
      break;
    }

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
  return parts.join('.');
};

/**
 * DNSPacket holds the state of a DNS packet. It can be modified or serialized
 * in-place.
 *
 * @constructor
 */
var DNSPacket = function(opt_flags) {
  this.flags_ = opt_flags || 0; /* uint16 */
  this.data_ = {'qd': [], 'an': [], 'ns': [], 'ar': []};
};

/**
 * Parse a DNSPacket from an ArrayBuffer (or Uint8Array).
 */
DNSPacket.parse = function(buffer) {
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
  // when "33152" is converted to a decimal, the value is:
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
    var part = new DNSRecord(
        consumer.name(),   // name
        consumer.short(),  // type
        consumer.short()); // class
    packet.push('qd', part);
  }

  console.log(" * Parsed Question, Total Read Bytes: " + consumer.getBytesRead());

  // Parse the ANSWER, AUTHORITY and ADDITIONAL sections.
  ['an', 'ns', 'ar'].forEach(function(section) {
    for (var i = 0; i < count[section]; ++i) {
      console.log(" * Parsing Starting for new DNSRecord, Total Read Bytes: " + consumer.getBytesRead());
      var part = new DNSRecord(
          consumer.name(),
          consumer.short(), // type
          consumer.short(), // class
          consumer.long(),  // ttl
          consumer.slice(consumer.short()));
      packet.push(section, part);
      console.log(" * Parsing Finished for new DNSRecord, Total Read Bytes: " + consumer.getBytesRead());
    }
  });

  console.log(" * Parsing Finished, Total Read Bytes: " + consumer.getBytesRead());

  consumer.isEOF() || console.warn('was not EOF on incoming packet');
  return packet;
};

DNSPacket.prototype.push = function(section, record) {
  this.data_[section].push(record);
};

DNSPacket.prototype.each = function(section) {
  var filter = false;
  var call;
  if (arguments.length == 2) {
    call = arguments[1];
  } else {
    filter = arguments[1];
    call = arguments[2];
  }
  this.data_[section].forEach(function(rec) {
    if (!filter || rec.type == filter) {
      call(rec);
    }
  });
};

/**
 * Serialize this DNSPacket into an ArrayBuffer for sending over UDP.
 */
DNSPacket.prototype.serialize = function() {
  var out = new DataWriter();
  var s = ['qd', 'an', 'ns', 'ar'];

  out.short(0).short(this.flags_);

  s.forEach(function(section) {
    out.short(this.data_[section].length);
  }.bind(this));

  s.forEach(function(section) {
    this.data_[section].forEach(function(rec) {
      out.name(rec.name).short(rec.type).short(rec.cl);

      if (section != 'qd') {
        // TODO: implement .bytes()
        throw new Error('can\'t yet serialize non-QD records');
//        out.long(rec.ttl).bytes(rec.data_);
      }
    });
  }.bind(this));

  return out.buffer;
};

/**
 * DNSRecord is a record inside a DNS packet; e.g. a QUESTION, or an ANSWER,
 * AUTHORITY, or ADDITIONAL record. Note that QUESTION records are special,
 * and do not have ttl or data.
 *
 * @param opt_data optional Uint8Array containing extra data
 */
var DNSRecord = function(name, type, cl, opt_ttl, opt_data) {
  this.name = name;
  this.type = type;
  this.cl = cl;

  this.isQD = (arguments.length == 3);
  if (!this.isQD) {
    this.ttl = opt_ttl;
    this.data_ = opt_data;
    console.log("Extra Data Supplied to DNSRecord");
    console.log("asName() for Record Returns :" + this.asName());
  }
};

DNSRecord.prototype.asName = function() {
  return new DataConsumer(this.data_).name();
};
