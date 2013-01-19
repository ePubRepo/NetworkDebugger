/**
 * ResponseLabelPointerManager handles DNS's name compression and labeling,
 * helping re-assemble a name with references.
 *
 * @param {ArrayBuffer} arg ArrayBuffer of data received from the socket.
 * @see http://developer.chrome.com/apps/socket.html#type-ReadInfo
 * @see  RFC 1035 section 4.1.4.
 * @constructor
 */
ResponseLabelPointerManager = function(arg) {
    if (arg instanceof Uint8Array) {
        this.view_ = arg;
    } else {
        this.view_ = new Uint8Array(arg);
    }
};

/**
 * ArrayBuffer containing the full binary data received from the socket.
 * @type {Uint8Array}
 * @private
 */
ResponseLabelPointerManager.prototype.view_ = null;

/**
 * Obtain a reference byte offset and reassemble the DNS name living at that
 * specified byte offset.
 *
 * @param {integer} ref Offset number of byte containing full name.
 * @return {string} Reassembled DNS name.
 */
ResponseLabelPointerManager.prototype.getNameFromReference = function(ref) {
    // Array Buffer containing data from the beginning offset to the end
    var subArrayBuffer = this.view_.subarray(ref);

    // Reassemble name from reference in DNS packet
    var subsectionDeserializer = new Deserializer(subArrayBuffer);
    var subName = subsectionDeserializer.name(this, subsectionDeserializer);
    return subName;
};

