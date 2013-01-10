/**
 * Static helper class for DNS information.
 */
DNSUtil = function() {};
//TODO: Remake this into more of a true enum
DNSUtil.RecordNumber = {};
DNSUtil.RecordNumber.A = 1;
DNSUtil.RecordNumber.AAAA = 28;
DNSUtil.RecordNumber.MX = 15;
DNSUtil.RecordNumber.CNAME = 5;
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
   this._hostname = hostname;
   this._recordTypeNum = recordTypeNum;
   this._dnsServer = dnsServer;
};

DNSQueryManager.prototype._hostname = null;
DNSQueryManager.prototype._recordTypeNum = null;
DNSQueryManager.prototype._dnsServer = null;
DNSQueryManager.prototype._isRecursionDesired = true;
DNSQueryManager.prototype._socketId = null;
DNSQueryManager.prototype._consoleFnc = null;
DNSQueryManager.prototype._socketInfo = null;
DNSQueryManager.prototype._objQueryPacket = null;
DNSQueryManager.prototype._serializedPacket = null;

DNSQueryManager.prototype.setRecursionDesired = function(isDesired) {
   this._isRecursionDesired = (isDesired === true);
};

DNSQueryManager.prototype.setConsoleFunction = function(fnc) {
   this._consoleFnc = fnc;
};

DNSQueryManager.prototype._getFormattedHeader = function() {
   if (this._isRecursionDesired) {
      // pass hex value 100 as flag since
	  // it corresponds to "00000000100000000"
      // which sets the proper bit for a recursive DNS query
      return 0x100;
   } else {
      return 0;
   }
};

DNSQueryManager.prototype.sendRequest = function() {
   
	var _dataRead = function(readInfo) {
        console.log("NEW!");
		console.log('Read Result Code / Bytes Read: ' + readInfo.resultCode);
        var packet = DNSPacket.parse(readInfo.data);
        console.log('Reading Packet...');
        console.log(packet);
        packet.each('qd', function(rec) {
          console.log(rec);
        });
        packet.each('an', function(rec) {
          var ptr = rec.asName();
          console.log('asName(): ' + ptr);
          console.log('Record: ');
          console.log(rec);
        });
        packet.each('ns', function(rec) {
          console.log(rec);
        });
    };
	
	var _readData = function() {
	   chrome.socket.read(this._socketId, 2048, _dataRead.bind(this));
   }.bind(this);

   var _onDataWritten = function(writeInfo) {
      if (writeInfo.bytesWritten != this._serializedPacket.byteLength) {
            this._consoleFnc('Error writing DNS packet.');
      } else {
         this._consoleFnc('Successfully sent ' + writeInfo.bytesWritten +
            ' bytes in a DNS packet');
      }
      _readData();
   };

   var _sendData = function() {
      if (typeof(this._consoleFnc) == 'function') {
         this._socketInfo = new SocketInfo(this._socketId);
         this._socketInfo.setConsoleFunction(this._consoleFnc);
         this._socketInfo.printSocketInfo();
      }

      var packetHeader = this._getFormattedHeader();
      this._objQueryPacket = new DNSPacket(packetHeader);
      this._objQueryPacket.push('qd', new DNSRecord(this._hostname,
    		  this._recordTypeNum,
    		  1));
      this._serializedPacket = this._objQueryPacket.serialize();

      chrome.socket.write(this._socketId,
    		  this._serializedPacket,
    		  _onDataWritten.bind(this));

   }.bind(this);

   var _onConnectedCallback = function(result) {
     _sendData();
   };

   var _onCreatedCallback = function(createInfo) {
      this._socketId = createInfo.socketId;
      chrome.socket.connect(this._socketId,
    		  this._dnsServer,
    		  53,
    		  _onConnectedCallback.bind(this)); 
   };

   chrome.socket.create('udp', null, _onCreatedCallback.bind(this));
};
