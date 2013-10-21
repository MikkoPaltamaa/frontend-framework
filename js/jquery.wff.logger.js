/*!

Logger jQuery plugin
Version: 0.9 (2012-08-16 15:39)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description: 

Adds a "log" method to all jQuery objects. The log method can be used 
to print information about the jQuery objects to the JavaScript console 
(press F12 to display the console). An optional parameter "message" can 
be used to define a custom identifier and values, which are then 
displayed before the jQuery objects.

Usage: 

$.log([string context, [string message, [mixed values]]]);
$(...).log([string context, [string message, [mixed values]]]);

Returns: object jQuery

Examples: 

// You can use the log method on the jQuery
$.log('Logger', 'testing on jQuery');

// You also can use the log method on any jQuery object
$('body').log('Logger', 'testing on the body jQuery object');

*/

// TODO: Tallenna ja tulosta counter jokaiselle riville?

// Add a protective wrapper
;(function ($, window, document, undefined) {

	// Create the plugin
	var log = function (context, message, values) {
		// If the console exists
		if (typeof console !== 'undefined' && console.log) {
			// If there are more than one values
			if (arguments.length > 3) {
				// Set the values to an array that contains the rest of the arguments
				values = Array.prototype.slice.call(arguments, 2, arguments.length);
			}
			// If called on the jQuery, $.log()
			if (this === $) {
				// If the is a third argument
				if (values !== undefined) {
					// Print the context, message and values to the console
					console.log(context + ': ' + message + ($.browser.msie ? ' ' : ''), values);
				}
				// Else if the is a second argument
				else if (message !== undefined) {
					// Print the context and message to the console
					console.log(context + ': ' + message);
				}
				// If the is a first argument
				else if (context !== undefined) {
					// Print the context to the console
					console.log(context);
				}
				// Else
				else {
					// Print an empty line to the console
					console.log('');
				}
			}
			// Else called on a jQuery object, $(...).log()
			else {
				// Get elements
				var elements = this.get();
				// If the is a third argument
				if (values !== undefined) {
					// Print the context, message, values and jQuery object to the console
					console.log(context + ': ' + message + ($.browser.msie ? ' ' : ''), values, elements);
				}
				// Else if the is a second argument
				else if (message !== undefined) {
					// Print the context, message and jQuery object to the console
					console.log(context + ': ' + message + ($.browser.msie ? ' ' : ''), elements);
				}
				
				// If the is a first argument
				else if (context !== undefined) {
					// Print the context and jQuery object to the console
					console.log(context + ':' + ($.browser.msie ? ' ' : ''), elements);
				}
				// Else
				else {
					// Print the jQuery object to the console
					console.log(elements);
				}
			}
		}
		// Return the jQuery object
		return this;
	};
	
	// Create the plugin methods: $.log() and $(...).log()
	$.log = $.fn.log = log;
	
})(jQuery, window, document);
