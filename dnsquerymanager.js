DNSUtil = {};
DNSUtil.RecordNumber = {};
DNSUtil.RecordNumber.A = 1;
DNSUtil.RecordNumber.AAAA = 28;
DNSUtil.RecordNumber.MX = 15;
DNSUtil.RecordNumber.CNAME = 5;

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

DNSQueryManager.prototype.setRecursionDesired = function(isDesired) {
   this._isRecursionDesired = (isDesired === true);
};

DNSQueryManager.prototype.setConsoleFunction = function(fnc) {
   this._consoleFnc = fnc;
};

DNSQueryManager.prototype._getFormattedHeader = function() {
   if (this._isRecursionDesired) {
      // pass hex value 100 as flag since it corresponds to "00000000100000000",
      // which sets the proper bit for recursion
      return 0x100;
   } else {
      return 0;
   }
};

DNSQueryManager.prototype.sendRequest = function() {
   var _sendData = function() {
      if (typeof(this._consoleFnc) == "function") {
         this._socketInfo = new SocketInfo(this._socketId);
         this._socketInfo.setConsoleFunction(this._consoleFnc);
         this._socketInfo.printSocketInfo();
      }

      var packetHeader = this._getFormattedHeader();
      var packet = new DNSPacket(packetHeader);
      packet.push('qd', new DNSRecord(this._hostname, this._recordTypeNum, 1));
      var raw = packet.serialize();

      chrome.socket.write(this._socketId, raw, function(writeInfo) {
         if (writeInfo.bytesWritten != raw.byteLength) {
            this._consoleFnc("Error writing DNS packet.");
         } else {
            this._consoleFnc("Successfully sent " + writeInfo.bytesWritten + " bytes in a DNS packet");
         }
      }.bind(this));

   }.bind(this);

   var _onConnectedCallback = function(result) {
     _sendData();
   };

   var _onCreatedCallback = function(createInfo) {
      this._socketId = createInfo.socketId;
      chrome.socket.connect(this._socketId, this._dnsServer, 53, _onConnectedCallback.bind(this)); 
   };

   chrome.socket.create('udp', null, _onCreatedCallback.bind(this));
};
