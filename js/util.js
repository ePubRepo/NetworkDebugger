// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Provide utilities used by various parts of the app.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Abstract class to provide various utilities to the app.
 */
Util = function() {};

/**
 * Array of hostnames to perform defaut tests on.
 */
Util.hostnamesToTest = ['google.com', 'mail.google.com', 'docs.google.com',
                        'accounts.google.com', 'apis.google.com',
                        'drive.google.com'];

/**
 * Convert a number from one base to another, often used to convert from
 * decimal to hex (such as for parsing out an IPv6 from binary).
 * @param {int} n Number to be converted from one base to another.
 * @param {int} to Terminal base (usually 16).
 * @param {int} opt_from Optional source base.
 * @return {int} Number after conversion from the source base to
 *               the destination base.
 */
Util.baseConversion = function(n, to, opt_from) {
  return parseInt(n, opt_from || 10).toString(to);
};
