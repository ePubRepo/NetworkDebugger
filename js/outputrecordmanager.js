// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Capture and store output from tests.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Receive output messages from one test and record it along with an associated
 * timestamp. Each test should have its own instance of an OutputRecordManager.
 *
 * @constructor
 */
OutputRecorderManager = function() {
  this.outputEntries_ = new Array();
};


/**
 * Store instances of OutputRecord.
 * @type Array.OutputRecord
 * @private
 */
OutputRecorderManager.prototype.outputEntries_ = null;


/**
 * Push a message to the record.
 * @param {OutputRecord.DetailLevel} level Level of log information.
 * @param {string} msg Message to be recorded.
 */
OutputRecorderManager.prototype.pushEntry = function(level, msg) {
  var record = new OutputRecord(level, msg);
  this.outputEntries_.push(record);
};

/**
 * Return set of output entries.
 * @return {Array.OutputRecord} Set of output entries with log records.
 */
OutputRecorderManager.prototype.getOutputRecords = function() {
  return this.outputEntries_;
};
