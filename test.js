console.log("hi");

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('gPubBtn').addEventListener('click', gPubBtnClick);
});

function gPubBtnClick() {
   console.log("button clicked");
   publicDnsQuery('google.com', 'a');
}


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

function publicDnsQuery(hostname, recordType) {
   console.log("DNS Hostname: " + hostname);
   console.log("DNS RecordType: " + recordType);

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
      chrome.socket.connect(createInfo.socketId, '74.125.227.3', 80, onConnectedCallback);
   });
}
