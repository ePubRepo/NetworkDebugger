// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Capture and store output from tests.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * 
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
 */
OutputRecord.prototype.timestamp_ = null;


/**
 * Detail level of output message.
 * @type {OutputRecord.DetailLevel}
 */
OutputRecord.prototype.level_ = null;


/**
 * Message to be recorded.
 * @type {string}
 */
OutputRecord.prototype.message_ = null;


OutputRecord.prototype.getTimestamp = function() {
  return this.timestamp_;
};


OutputRecord.prototype.getLevel = function() {
  return this.level_;
};


OutputRecord.prototype.getMessage = function() {
  return this.message_;
};

