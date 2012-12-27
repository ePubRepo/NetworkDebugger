console.log("hi");

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('gPubDnsBtn').addEventListener('click', gPubDnsBtnClick);
  document.getElementById('gHttpBtn').addEventListener('click', gHttpBtnClick);
});

function gHttpBtnClick() {
   console.log("http query button clicked");
   httpRequest("www.google.com", "/", "www.google.com");
}

function gPubDnsBtnClick() {
   console.log("=====GOOGLE PUBLIC DNS BUTTON CLICKED=====");
   publicUdpDnsQuery3('google.com', DNSUtil.RecordNumber.A);
}


// From https://developer.chrome.com/trunk/apps/app_hardware.html
var str2ab=function(str) {
  var buf=new ArrayBuffer(str.length);
  var bufView=new Uint8Array(buf);
  for (var i=0; i<str.length; i++) {
    bufView[i]=str.charCodeAt(i);
  }
  return buf;
}

// From https://developer.chrome.com/trunk/apps/app_hardware.html
var ab2str=function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};

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

function httpRequest(connectionDestination, path, host) {
   console.log("HTTP Connection Destination: " + connectionDestination);
   console.log("HTTP Path: " + path);
   console.log("HTTP Host: " + host);

   createdSocketId = 0;
   writeArrayBuffer = new ArrayBuffer;
   _stringToArrayBuffer("GET / HTTP/1.1\r\nHost:www.google.com\r\n\r\n", function(ab) { writeArrayBuffer = ab; });

   onReadCompletedCallback = function(readInfo) {
      console.log("read completed");
      console.log(readInfo);
      _arrayBufferToString(readInfo.data, function(ab) { console.log(ab); });
   }

   onWriteCompleteCallback = function(writeInfo) {
      console.log("write completed");
      console.log(writeInfo);
      chrome.socket.read(createdSocketId, 1024, onReadCompletedCallback);
   }

   onConnectedCallback = function(result) {
      console.log("connection established");
      chrome.socket.write(createdSocketId, writeArrayBuffer, onWriteCompleteCallback);
   }

   chrome.socket.create('tcp', {}, function(createInfo) {
      createdSocketId = createInfo.socketId;
      chrome.socket.connect(createInfo.socketId, connectionDestination, 80, onConnectedCallback);
   });
}

function publicTcpDnsQuery(hostname, recordType) {
   console.log("Beginning TCP Query Function");
   console.log("DNS Hostname: " + hostname);
   console.log("DNS RecordType: " + recordType);

   createdSocketId = 0;
   writeArrayBuffer = new ArrayBuffer;
   _stringToArrayBuffer("GET / HTTP/1.1\r\nHost:www.google.com\r\n\r\n", function(ab) { writeArrayBuffer = ab; });

   onReadCompletedCallback = function(readInfo) {
      console.log("TCP read completed");
      console.log(readInfo);
      _arrayBufferToString(readInfo.data, function(ab) { console.log(ab); });
   }

   onWriteCompleteCallback = function(writeInfo) {
      console.log("TCP write completed");
      console.log(writeInfo);
      chrome.socket.read(createdSocketId, 1024, onReadCompletedCallback);
   }

   onConnectedCallback = function(result) {
      console.log("TCP connection established");
      chrome.socket.write(createdSocketId, writeArrayBuffer, onWriteCompleteCallback);
   }

   chrome.socket.create('tcp', {}, function(createInfo) {
      createdSocketId = createInfo.socketId;
      chrome.socket.connect(createInfo.socketId, '74.125.227.3', 80, onConnectedCallback);
   });
}

function publicUdpDnsQuery3(hostname, recordTypeNum) {
  // pass hex value 100 as flag since it corresponds to "00000000100000000",
  // which sets the proper bit for recursion
  var packet = new DNSPacket(0x100);
  packet.push('qd', new DNSRecord('cnn.com', recordTypeNum, 1));

  var raw = packet.serialize();

  chrome.socket.create('udp', null, function(createInfo){
       clientSocket = createInfo.socketId;

       chrome.socket.connect(clientSocket, '8.8.8.8', 53, function(result){
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
           packet.each('qd', recordTypeNum, function(rec) {
             console.log(rec);
           });
           packet.each('an', recordTypeNum, function(rec) {
             var ptr = rec.asName();
             console.log("asName(): " + ptr);
             console.log('Record: ');
             console.log(rec);
           });
           packet.each('ns', recordTypeNum, function(rec) {
             console.log(rec);
           });
       }); 
 });
}

