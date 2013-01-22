// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Manage a DNS query and its response.
 *
 * @author ebeach@google.com (Eric Beach)
 */


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

  this.printResponseFnc_ = this.defaultPrintResponse;
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
 * Port to use in connecting to DNS server.
 * @type {int}
 * @private
 */
DNSQueryManager.prototype.dnsPort_ = 53;


/**
 * Whether to perform a recursive DNS query. Default is true.
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
 * Default function simply logs to the browser's console.
 * @type {function(string)}
 * @param {string} msg Message for the console.
 * @private
 */
DNSQueryManager.prototype.consoleFnc_ = function(msg) {
    console.log(msg);
};


/**
 * SocketInfo object storing information about the socket used
 *    to send and receive a DNS packet.
 * @type {SocketInfo}
 * @private
 */
DNSQueryManager.prototype.socketInfo_ = null;


/**
 * DNS Packet sent as a DNS query.
 * @type {DNSPacket}
 * @private
 */
DNSQueryManager.prototype.queryPacket_ = null;


/**
 * Serialized DNS packet data to send as a DNS query.
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
 * DNS packet received in response to the DNS query.
 * @type {DNSPacket}
 * @private
 */
DNSQueryManager.prototype.responsePacket_ = null;


/**
 * Print the default packet response.
 */
DNSQueryManager.prototype.defaultPrintResponse = function() {
    // represent question section
    this.responsePacket_.each(DNSUtil.PacketSection.QUESTION,
                              function(dnsPacket) {}.bind(this));

    // represent answer section
    var str = '';
    this.responsePacket_.each(DNSUtil.PacketSection.ANSWER,
        function(dnsPacket) {
          str += DNSUtil.getRecordTypeNameByRecordTypeNum(
                                     dnsPacket.getType()) +
          ' record with name ' +
          dnsPacket.getName() + ' and TTL ' + dnsPacket.getTTL() +
          ' and data section of ' + dnsPacket.getDataText() + '\r\n';
    }.bind(this));
    this.consoleFnc_(str);

    // represent authority section
    this.responsePacket_.each(DNSUtil.PacketSection.AUTHORITY,
                              function(dnsPacket) {});
};


/**
 * Function to print parsed DNS response packet.
 * @type {function}
 * @private
 */
DNSQueryManager.prototype.printResponseFnc_ = null;


/**
 * Set whether to perform a recursive DNS query.
 * @param {boolean} isDesired Whether the DNS query should be recursive.
 */
DNSQueryManager.prototype.setRecursionDesired = function(isDesired) {
   this.isRecursionDesired_ = (isDesired === true);
};


/**
 * Set the function used to log console information.
 * @param {function(string)} fnc Function to use for user-facing logging.
 */
DNSQueryManager.prototype.setConsoleFunction = function(fnc) {
   this.consoleFnc_ = fnc;
};


/**
 * Obtain the bits for the DNS packet header.
 * See Section 4.1.1 of RFC 1035 for the specifics.
 * @return {int} Integer corresponding to the 16 bits of a DNS packet header.
 * @private
 */
DNSQueryManager.prototype.getFormattedHeader_ = function() {
   if (this.isRecursionDesired_) {
      // header is hex 100 or binary "00000000100000000"
      return 0x100;
   } else {
      return 0;
   }
};


/**
 * Send the formatted DNS packet as a query to the desired DNS server.
 */
DNSQueryManager.prototype.sendRequest = function() {
    var udpTimeoutSec = 7;
    var udpTimeoutFunction = setInterval(timeout_.bind(this),
                                         udpTimeoutSec * 1000);
    var packetResponseSuccessful = false;

    /**
     * Clean up socket as no response is coming back.
     * @this {DNSQueryManager}
     * @private
     */
    function timeout_() {
      this.consoleFnc_('Received no response in ' + udpTimeoutSec +
          ' seconds, closing socket');
      clearTimeout(udpTimeoutFunction);
      cleanUp_.apply(this);
    };

    /**
     * Perform clean up operation on the socket, such as closing it.
     * @this {DNSQueryManager}
     * @private
     */
    function cleanUp_() {
      chrome.socket.destroy(this.socketId_);
      this.consoleFnc_('Socket closed');

      if (packetResponseSuccessful) {
        // TODO: Eliminate default print function
        // Pass DNSPacket and some type of status result
        this.printResponseFnc_();
      }
    };

    /**
     * @param {ReadInfo} readInfo Information about data read over the socket.
     * @this {DNSQueryManager}
     * @see http://developer.chrome.com/apps/socket.html
     * @private
     */
    function dataRead_(readInfo) {
      clearTimeout(udpTimeoutFunction);

      this.consoleFnc_('Received ' + readInfo.resultCode + ' byte query ' +
                'response');
      this.serializedResponsePacket_ = readInfo.data;

      var lblNameManager = new ResponseLabelPointerManager(readInfo.data);
      var packetDeserializer = new DNSPacketDeserializer(readInfo.data,
                                                       lblNameManager);
      packetDeserializer.deserializePacket();
      this.responsePacket_ = packetDeserializer.getDeserializedPacket();

      this.consoleFnc_('Query response contains ' +
                this.responsePacket_.getAnswerRecordCount() + ' answer ' +
                'records');

      packetResponseSuccessful = true;
      cleanUp_.apply(this);
    };

    /**
     * Read data over socket from DNS server.
     * @this {DNSQueryManager}
     * @private
     */
   function readData_() {
     chrome.socket.read(this.socketId_, dataRead_.bind(this));
   }

   /**
    * Receive and handle information about data written to DNS server.
    * @param {WriteInfo} writeInfo Information about data written over socket.
    * @this {DNSQueryManager}
    * @see http://developer.chrome.com/apps/socket.html
    * @private
    */
   function onDataWritten_(writeInfo) {
     if (writeInfo.bytesWritten != this.serializedQueryPacket_.byteLength) {
       this.consoleFnc_('Error writing DNS packet.');
       chrome.socket.destroy(this.socketId_);
     } else {
       this.consoleFnc_('Successfully sent ' + writeInfo.bytesWritten +
            ' bytes in a DNS packet');
       readData_.apply(this);
     }
   };

   /**
    * Send serialized UDP packet data composing a DNS request to DNS server.
    * @this {DNSQueryManager}
    * @private
    */
   function sendData_() {
     var packetHeader = this.getFormattedHeader_();
     this.queryPacket_ = new DNSPacket(packetHeader);
     this.queryPacket_.push(DNSUtil.PacketSection.QUESTION,
                            new DNSRecord(this.hostname_,
                                          this.recordTypeNum_,
                                          1));

     // take data and serialize it into binary as an ArrayBuffer to send
     var serializer = new DNSPacketSerializer(this.queryPacket_);
     this.serializedQueryPacket_ = serializer.serialize();

     this.consoleFnc_('Preparing to query server ' + this.dnsServer_ + ' ' +
              'for record type ' +
              DNSUtil.getRecordTypeNameByRecordTypeNum(this.recordTypeNum_) +
              ' with hostname ' + this.hostname_);

     chrome.socket.write(this.socketId_,
                          this.serializedQueryPacket_,
                          onDataWritten_.bind(this));
   };

   /**
    * Receive the result of a connection attempt.
    * @param {integer} result Information about connected socket.
    * @this {DNSQueryManager}
    * @private
    */
   function onConnectedCallback_(result) {
     this.socketInfo_ = new SocketInfo(this.socketId_);
     this.socketInfo_.setConsoleFunction(this.consoleFnc_);
     this.socketInfo_.printSocketInfo();
     sendData_.apply(this);
   };

   /**
    * Connect to the DNS server.
    * @this {DNSQueryManager}
    * @private
    */
   function connect_() {
     chrome.socket.connect(this.socketId_,
                              this.dnsServer_,
                              this.dnsPort_,
                              onConnectedCallback_.bind(this));
   };

   /**
    * Process information about a socket after creation.
    * @param {CreateInfo} createInfo CreateInfo about a socket.
    * @this {DNSQueryManager}
    * @see http://developer.chrome.com/apps/socket.html
    * @private
    */
   function onCreatedCallback_(createInfo) {
     this.socketId_ = createInfo.socketId;
     connect_.apply(this);
   };

   // create a UDP socket for sending and receiving a DNS packet
   chrome.socket.create('udp', null, onCreatedCallback_.bind(this));
};
