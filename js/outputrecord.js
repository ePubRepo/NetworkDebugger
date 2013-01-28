// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Encapsulate one output message from a test.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Store a log output from a test along with a timestamp and log level.
 *
 * @param {OutputRecord.DetailLevel} level Level of output record.
 * @param {string} message Message to be recorded.
 * @constructor
 */
OutputRecord = function(level, message) {
  this.timestamp_ = (new Date()).getTime();
  this.level_ = level;
  this.message_ = message;
};


/**
 * Enum for the level of output log information corresponding with a message.
 * @enum {number}
 */
OutputRecord.DetailLevel = {
  ERROR: 0,
  WARNING: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};


/**
 * Timestamp of message.
 * @type {integer}
 * @private
 */
OutputRecord.prototype.timestamp_ = null;


/**
 * Detail level of output message.
 * @type {OutputRecord.DetailLevel}
 * @private
 */
OutputRecord.prototype.level_ = null;


/**
 * Message to be recorded.
 * @type {string}
 * @private
 */
OutputRecord.prototype.message_ = null;


/**
 * Return the timestamp of the record.
 * @return {integer} Timestamp of record entry.
 */
OutputRecord.prototype.getTimestamp = function() {
  return this.timestamp_;
};


/**
 * Return the log level for this record entry.
 * @return {OutputRecord.DetailLevel} Level of log entry.
 */
OutputRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Return log message.
 * @return {string} Log message.
 */
OutputRecord.prototype.getMessage = function() {
  return this.message_;
};
