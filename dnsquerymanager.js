/**
 * Static helper class for DNS information.
 */
DNSUtil = function() {};

/**
 * Enum for DNS record type.
 * @enum {number}
 */
DNSUtil.RecordNumber = {
   A: 1,
   AAAA: 28,
   MX: 15,
   CNAME: 5,
   TXT: 16
};

/**
 * Static function to return the DNS record type number.
 * @param {int} num DNS record type number.
 * @return {string} The DNS record type as a string.
 */
DNSUtil.getRecordTypeNameByRecordTypeNum = function(num) {
   switch (num) {
      case DNSUtil.RecordNumber.A:
         return 'A';
         break;

      case DNSUtil.RecordNumber.AAAA:
         return 'AAAA';
         break;

      case DNSUtil.RecordNumber.MX:
         return 'MX';
         break;

      case DNSUtil.RecordNumber.CNAME:
         return 'CNAME';
         break;
   }
};

/**
 * Manage a DNS query.
 * @param {string} hostname Hostname to lookup a record for.
 * @param {int} recordTypeNum Type of record to lookup.
 * @param {string} dnsServer Server to query against records.
 * @constructor
 */
DNSQueryManager = function(hostname, recordTypeNum, dnsServer) {
   this.hostname_ = hostname;
   this.recordTypeNum_ = recordTypeNum;
   this.dnsServer_ = dnsServer;
};

/**
 * The hostname being looked up.
 * @type {string}
 * @private
 */
DNSQueryManager.prototype.hostname_ = null;

/**
 * DNS record type number.
 * @type {integer}
 * @private
 */
DNSQueryManager.prototype.recordTypeNum_ = null;

/**
 * Server to use for resolving DNS queries.
 * @type {string}
 * @private
 */
DNSQueryManager.prototype.dnsServer_ = null;

/**
 * Whether to perform recursive DNS query.
 * @type {boolean}
 * @private
 */
DNSQueryManager.prototype.isRecursionDesired_ = true;

/**
 * ID of the socket used to make a DNS query.
 * @type {integer}
 * @private
 */
DNSQueryManager.prototype.socketId_ = null;

/**
 * Function to print information to the app console.
 * @type {function(string)}
 * @param {string} msg Message for the console.
 * @private
 */
DNSQueryManager.prototype.consoleFnc_ = function(msg) {};

/**
 * Information about the socket used to send and receive a DNS packet.
 * @type {SocketInfo}
 * @private
 */
DNSQueryManager.prototype.socketInfo_ = null;

/**
 * DNS Packet sent as a DNS query.
 * @type {DNSPacket}
 * @private
 */
DNSQueryManager.prototype.objQueryPacket_ = null;

/**
 * Serialized DNS packet data to send as a query.
 * @type {ArrayBuffer}
 * @private
 */
DNSQueryManager.prototype.serializedQueryPacket_ = null;

/**
 * Serialized DNS packet data received as a response to a query.
 * @type {ArrayBuffer}
 * @private
 */
DNSQueryManager.prototype.serializedResponsePacket_ = null;

/**
 * Set whether to perform a recursive DNS query.
 * @param {boolean} isDesired Whether the DNS query should be recursive.
 */
DNSQueryManager.prototype.setRecursionDesired = function(isDesired) {
   this.isRecursionDesired_ = (isDesired === true);
};

/**
 * @param {function(string)} fnc Function to use for user-facing logging.
 */
DNSQueryManager.prototype.setConsoleFunction = function(fnc) {
   this.consoleFnc_ = fnc;
};

/**
 * Obtain the bits for the DNS packet header.
 * @return {int} Integer corresponding to the 16 bits of a DNS packet header.
 * @private
 */
DNSQueryManager.prototype.getFormattedHeader_ = function() {
   if (this.isRecursionDesired_) {
      // pass hex value 100 as flag since
      // it corresponds to "00000000100000000"
      // which sets the proper bit for a recursive DNS query
      return 0x100;
   } else {
      return 0;
   }
};

/**
 * Send the formatted DNS packet as a query to the desired DNS server.
 */
DNSQueryManager.prototype.sendRequest = function() {
    var _dataRead = function(readInfo) {
        this.consoleFnc_('Received ' + readInfo.resultCode + ' byte query ' +
                'response');
        this.serializedResponsePacket_ = readInfo.data;
        var lblNameManager = new ResponseLabelPointerManager(readInfo.data);
        var packet = DNSPacket.parse(readInfo.data, lblNameManager);
        console.log('Reading Packet...');
        console.log(packet);
        packet.each('qd', function(rec) {
          console.log(rec);
        });
        packet.each('an', function(rec) {
          var ptr = rec.parseDataSection();
          console.log('parseDataSection(): ' + ptr);
          console.log('Record: ');
          console.log(rec);
        });
        packet.each('ns', function(rec) {
          console.log(rec);
        });
    };

   var _readData = function() {
       chrome.socket.read(this.socketId_, 2048, _dataRead.bind(this));
   }.bind(this);

   var _onDataWritten = function(writeInfo) {
      if (writeInfo.bytesWritten != this.serializedQueryPacket_.byteLength) {
            this.consoleFnc_('Error writing DNS packet.');
      } else {
         this.consoleFnc_('Successfully sent ' + writeInfo.bytesWritten +
            ' bytes in a DNS packet');
      }
      _readData();
   };

   var _sendData = function() {
      this.socketInfo_ = new SocketInfo(this.socketId_);
      this.socketInfo_.setConsoleFunction(this.consoleFnc_);
      this.socketInfo_.printSocketInfo();

      var packetHeader = this.getFormattedHeader_();
      this.objQueryPacket_ = new DNSPacket(packetHeader);
      this.objQueryPacket_.push('qd', new DNSRecord(this.hostname_,
              this.recordTypeNum_,
              1));
      this.serializedQueryPacket_ = this.objQueryPacket_.serialize();

      this.consoleFnc_('Preparing to query server ' + this.dnsServer_ + ' ' +
              'for record type ' + this.recordTypeNum_ + ' with hostname ' +
              this.hostname_);

      chrome.socket.write(this.socketId_,
              this.serializedQueryPacket_,
              _onDataWritten.bind(this));

   }.bind(this);

   var _onConnectedCallback = function(result) {
     _sendData();
   };

   var _connect = function() {
       chrome.socket.connect(this.socketId_,
               this.dnsServer_,
               53,
               _onConnectedCallback.bind(this));
   }.bind(this);

   var _onCreatedCallback = function(createInfo) {
      this.socketId_ = createInfo.socketId;
      _connect();
   };

   chrome.socket.create('udp', null, _onCreatedCallback.bind(this));
};
