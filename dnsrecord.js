/**
 * DNSRecord is a record inside a DNS packet; e.g. a QUESTION, or an ANSWER,
 * AUTHORITY, or ADDITIONAL record. Note that QUESTION records are special,
 * and do not have ttl or data.
 *
 * @param {string} name Name part of the DNS record.
 * @param {integer} type DNS record type.
 * @param {integer} cl Class of record.
 * @param {integer} opt_ttl TTL for the record.
 * @param {ArrayBuffer} opt_data optional Uint8Array containing extra data.
 * @constructor
 */
var DNSRecord = function(name, type, cl, opt_ttl, opt_data) {
    this.name_ = name;
    this.type_ = type;
    this.cl_ = cl;

    this.isQD = (arguments.length == 3);
    if (!this.isQD) {
        this.ttl_ = opt_ttl;
        this.data_ = opt_data;
    }
};

/**
 * Name component of DNS packet.
 * @type {string}
 * @private
 */
DNSRecord.prototype.name_ = null;

/**
 * Type of DNS record as a number.
 * @type {integer}
 * @see Section 3.2.2. of RFC 1035.
 * @private
 */
DNSRecord.prototype.type_ = null;

/**
 * Class of DNS record as a number.
 * @type {integer}
 * @see Section 3.2.2. of RFC 1035.
 * @private
 */
DNSRecord.prototype.cl_ = null;

/**
 * Label pointer manager that keeps track of entire DNS packet, so labels
 * and names can be reassembled from DNS compression.
 * @type {ResponseLabelPointerManager}
 * @see Section 4.1.4 of RFC 1035.
 * @private
 */
DNSRecord.prototype.lblPointManager_ = null;

/**
 * Binary information from the data section of a DNS record.
 * @type {ArrayBuffer}
 * @private
 */
DNSRecord.prototype.data_ = null;

/**
 * Information stored in data section of packet.
 * @type {string}
 * @private
 */
DNSRecord.prototype.dataTxt_ = null;

/**
 * Set the label pointer manager for the DNS packet to which the record belongs.
 * @param {ResponseLabelPointerManager} obj Label manager to help reassemble
 *                                          DNS packet data.
 */
DNSRecord.prototype.setLblPointManager = function(obj) {
    this.lblPointManager_ = obj;
};

/**
 * Obtain the DNS name of the DNS record.
 * @return {string} DNS name.
 */
DNSRecord.prototype.getName = function() {
    return this.name_;
};

/**
 * Obtain the DNS record type number.
 * @return {integer} DNS record type number.
 */
DNSRecord.prototype.getType = function() {
    return this.type_;
};

/**
 * Obtain a text processed versino of the data section.
 * @return {string} Text representation of the data section of the DNS record.
 */
DNSRecord.prototype.getDataText = function() {
    return this.dataTxt_;
};

/**
 * Return the TTL of the DNS record.
 * @return {int} TTL of DNS record.
 */
DNSRecord.prototype.getTTL = function() {
    return this.ttl_;
};

/**
 * Set a text representation of the DNS packet's data section.
 * @param {string} dataStr Text representation of data section.
 */
DNSRecord.prototype.setData = function(dataStr) {
   this.dataTxt_ = dataStr;
};

/**
 * Parse the data section of the DNS record.
 * @return {string} Text representation of the data section of the record.
 */
// TODO: move to deseralizer
DNSRecord.prototype.parseDataSection = function() {
  this.dataTxt_ = new Deserializer(this.data_)
     .parseDataSection(this.type_, this.lblPointManager_);
  return this.dataTxt_;
};
