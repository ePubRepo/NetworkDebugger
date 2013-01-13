
  /**
   * Converts an array buffer to a string
   *
   * @private
   * @param {ArrayBuffer} buf The buffer to convert
   * @param {Function} callback The function to call when conversion is complete
   */
  function _arrayBufferToString(buf, callback) {
    var bb = new Blob([new Uint8Array(buf)]);
    var f = new FileReader();
    f.onload = function(e) {
      callback(e.target.result);
    };
    f.readAsText(bb);
  }

  /**
   * Converts a string to an array buffer
   *
   * @private
   * @param {String} str The string to convert
   * @param {Function} callback The function to call when conversion is complete
   */
  function _stringToArrayBuffer(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
  }

function publicUdpDnsQuery3(hostname, recordTypeNum, dnsServer) {
  // pass hex value 100 as flag since it corresponds to "00000000100000000",
  // which sets the proper bit for recursion
  var packet = new DNSPacket(0x100);
  packet.push('qd', new DNSRecord(hostname, recordTypeNum, 1));

  var raw = packet.serialize();

  chrome.socket.create('udp', null, function(createInfo){
       clientSocket = createInfo.socketId;

       chrome.socket.connect(clientSocket, dnsServer, 53, function(result){
           console.log('chrome.socket.connect: result = ' + result.toString());
       });

       chrome.socket.write(clientSocket, raw, function(writeInfo) {
          if (writeInfo.bytesWritten != raw.byteLength) {
            this.callback_('could not write DNS packet on: ' + address);
          }
          console.log('Wrote Bytes: ' + writeInfo.bytesWritten);
        });

       chrome.socket.read(clientSocket, 2048, function(readInfo){
           console.log('Read Result Code / Bytes Read: ' + readInfo.resultCode);
           var packet = DNSPacket.parse(readInfo.data);
           console.log('Reading Packet...');
           console.log(packet);
           packet.each('qd', function(rec) {
             console.log(rec);
           });
           packet.each('an', function(rec) {
             var ptr = rec.parseDataSection();
             console.log("dataSection(): " + ptr);
             console.log('Record: ');
             console.log(rec);
           });
           packet.each('ns', function(rec) {
             console.log(rec);
           });
       }); 
 });
}

