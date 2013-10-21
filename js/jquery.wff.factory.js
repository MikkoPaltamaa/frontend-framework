/*!

Factory for Konsepto jQuery plugins
Version: 0.8 (2013-02-05 13:30)
Author: Mikko Paltamaa / Konsepto: http://konsepto.fi
License: All rights reserved

Description:

You can use this factory function to register your jQuery plugins. See 
the plugin skeleton below.


Example: 

// This is the plugin code

// Define the plugin
var Plugin = {
	...
};

// Define the plugin prototype
var PluginPrototype = {

	// Creates the plugin (called by factory)
	create: function (settings, effects, debug) {
		...
	}, 

	...
};

// Define the plugin's constructor
var PluginConstructor = function (targetElement) {
	// Set target element
	this._targetElement = targetElement;
	// Merge this and plugin object
	$.extend(true, this, Plugin);
};

// Set the plugin's prototype
PluginConstructor.prototype = PluginPrototype;

// Register plugin
$.wffRegisterPlugin(PluginConstructor);

...

// This is the code that uses the plugin

// Replace "functionName" in the example code with the plugin's real function name

// Create an instance of a normal plugin
$(...).wffCreatePlugin('functionName', settings, effects, debug);

// Create an instance of a standalone plugin
$.wffCreatePlugin('...', settings, effects, debug);

// Access the instances of a normal plugin (retuns an array)
var plugins = $(...).functionName();

// Access the instances of a standalone plugin (retuns an array)
var plugins = $.functionName();

// Do things with the returned plugin array
for (var i = 0; i < plugins.length; i++) {
	...
}


*/

// TODO: Lisää mahdollisuus peruuttaa kaikki toiminnot niiden start-triggereistä (jos tarpeen)
// TODO: Korjaa unbind-koodi muutosten jäljiltä
// TODO: Kommentoi kaikki uusi koodi ja tarkista vanhat kommentit
// TODO: Kannattaako käyttää taulukoita silloin, jos singleton? Luultavasti ei, jolloin käyttö on helpompaa. Toisaalta, tämä koodi monimutkaistuu hiukan.

// Add a protective wrapper
;(function ($, window, document, undefined) {

	// Standalone plugin constructors
	$.wffPluginConstructors = {};
	
	// Normal plugin constructors
	$.fn.wffPluginConstructors = {};
	
	// Inserts a plugin object into an element's data
	function insertPlugin(plugin, element, dataName) {
		// Set the plugin array
		var plugins = [];
		// Merge the plugin array and the element's data
		$.data(element, dataName) && $.merge(plugins, $.data(element, dataName));
		// Insert the new plugin into the array
		plugins.push(plugin);
		// Save the plugin array as the element's data
		$.data(element, dataName, plugins);
	}
	
	// Removes a plugin object from an element's data
	function removePlugin(element, dataName, index) {
		// Set the plugin array
		var plugins = [];
		// Merge the plugin array and the element's data
		$.data(element, dataName) && $.merge(plugins, $.data(element, dataName));
		// If the given index is inside plugin array
		if (plugins.length >= index - 1) {
			// Remove the given index from the array
			var plugin = plugins.splice(index, 1);
			// Save the modified array as the element's data
			$.data(element, dataName, plugins);
			// Return the removed plugin object
			return plugin[0];
		}
	}
	
	// Retrieves plugin objects from an element's data
	function retrievePlugins(element, dataName) {
		// Set the plugin array
		var plugins = [];
		// Merge the plugin array and the element's data
		$.data(element, dataName) && $.merge(plugins, $.data(element, dataName));
		// Return the plugin array
		return plugins;
	}
	
	// Set the plugin registering function
	$.wffRegisterPlugin = function (PluginConstructor) {
		// Set shortcuts
		var functionName = PluginConstructor.prototype.functionName;
		var standalone = PluginConstructor.prototype.standalone;
		// Set the plugin's data name
		var dataName = 'plugin_' + functionName;
		// If a standalone plugin (instances are not tied to a certain element)
		if (standalone) {
			// Save the plugin constructor for later use
			$.wffPluginConstructors[functionName] = PluginConstructor;
		}
		// Else not a standalone plugin
		else {
			// Save the plugin constructor for later use
			$.fn.wffPluginConstructors[functionName] = PluginConstructor;
		}
		// Register the retrieval function for jQuery
		$[functionName] = function () {
			// Return the plugin array
			return retrievePlugins(document, dataName);
		};
		// If a standalone plugin
		if (!standalone) {
			// Register the retrieval function for jQuery objects
			$.fn[functionName] = function () {
				// Set the plugin array
				var plugins = [];
				// Go through the elements
				this.each(function () {
					// Merge the plugin array and the element's plugin array
					$.merge(plugins, retrievePlugins(this, dataName));
				});
				// Return the plugin array
				return plugins;
			};
		}
	};
	
	// Set the plugin creation function for jQuery
	$.wffCreatePlugin = function (functionName, settings, effects, debug) {
		// Set shortcuts
		var PluginConstructor = $.wffPluginConstructors[functionName];
		var PluginPrototype = PluginConstructor.prototype;
		// Set the plugin's data name
		var dataName = 'plugin_' + functionName;
		// Set shortcuts
		var singleton = PluginPrototype.singleton;
		// If not singleton or if there are no other instances
		if (!singleton || !retrievePlugins(document, dataName).length) {
			// Create a new plugin object instance
			var plugin = new PluginConstructor();
			// Create the plugin
			plugin._create(settings, effects, debug);
			// Insert the plugin into the documents's data
			insertPlugin(plugin, document, dataName);
		}
	};
	
	// Set the plugin creation function for jQuery objects
	$.fn.wffCreatePlugin = function (functionName, settings, effects, debug) {
		// Set shortcuts
		var PluginConstructor = $.fn.wffPluginConstructors[functionName];
		var PluginPrototype = PluginConstructor.prototype;
		// Set the plugin's data name
		var dataName = 'plugin_' + functionName;
		// Go through all elements, return the original jQuery element
		return this.each(function () {
			// Set shortcuts
			var singleton = PluginPrototype.singleton;
			// If not singleton or if there are no other instances
			if (!singleton || !retrievePlugins(this, dataName).length) {
				// Create a new plugin object instance
				var plugin = new PluginConstructor(this);
				// Create the plugin
				plugin._create(settings, effects, debug);
				// Insert the plugin into the element's data
				insertPlugin(plugin, this, dataName);
			}
		});
	};
	
	// Set the plugin destroying function for jQuery
	$.wffDestroyPlugin = function (functionName, index) {
		// Set the plugin's data name
		var dataName = 'plugin_' + functionName;
		// Remove the plugin from the document's data
		var plugin = removePlugin(document, dataName, index);
		// Destroy the plugin
		plugin && plugin._destroy();
	};
	
	// Set the plugin destroying function for jQuery objects
	$.fn.wffDestroyPlugin = function (functionName, index) {
		// Set the plugin's data name
		var dataName = 'plugin_' + functionName;
		// Go through all elements, return the original jQuery element
		return this.each(function () {
			// Remove the plugin from the element's and the document's data
			var plugin = removePlugin(this, dataName, index);
			// Destroy the plugin
			plugin && plugin._destroy();
		});
	};
	
	// Define the component prototype
	$.wffComponentPrototype = {
		
		// Enables the object
		enable: function () {
			// Print debugging information
			this._log('Enabling the object');
			// Set the enabled status to true
			this.status.enabled = true;
		}, 
		
		// Disables the object
		disable: function () {
			// Print debugging information
			this._log('Disabling the object');
			// Clear timeouts
			this._actionTimeout && clearTimeout(this._actionTimeout);
			// Set the enabled status to false
			this.status.enabled = false;
		}, 
		
		// Returns the plugin's enabled status
		isEnabled: function () {
			// Return the enabled status
			return this.status.enabled;
		}, 
		
		// Sets the object's binds (optional string action)
		bind: function (action) {
			// Print debugging information
			this._log('Binding the actions');
			// Set shortcuts
			var settings = this.settings;
			var bindEvents = settings.bindEvents;
			var bindCode = settings.bindCode;
			var $elements = this.$elements;
			// TODO: Implement the action parameter
			// Go throuh the actions
			for (var action in bindEvents) {
				// If the bind code is given
				if (bindCode[action]) {
					// Save a reference to the bind code
					var _bindCode = this._wrapBindCode(bindCode[action]);
					// Go throuh the elements
					for (var key in bindEvents[action]) {
						// If the key is given, element exist and event is given
						if (key && $elements[key] && bindEvents[action][key]) {
							// Bind to the event
							$elements[key].on(bindEvents[action][key], _bindCode);
						}
					}
				}
			}
		}, 
		
		// Unsets the object's binds (optional string action)
		unbind: function (action) {
			// Print debugging information
			this._log('Unbinding the actions');
			// Set shortcuts
			var bindEvents = this.settings.bindEvents;
			var $elements = this.$elements;
			var bindCode = this._bindCode;
			// TODO: Implement the action parameter
			// Go through the actions
			for (var action in bindEvents) {
				// Go through the elements
				for (var key in bindEvents[action]) {
					// If the bind event is given, unbind
					bindEvents[action][key] && $elements[key].off(bindEvents[action][key], bindCode[action]);
				}
			}
		}, 
		
		// Delays the action (string action, optional integer delay (ms), optional boolean enqueue, optional string effect)
		_delay: function (action, delay, enqueue, effect) {
			// If enabled
			if (this.isEnabled()) {
				// If no delay given, set the delay to the default value
				delay = (delay === undefined || isNaN(delay) || delay < 0 ? this.settings.delays[action] : delay);
				// Print debugging information
				this._log('Delaying the ' + action + ' action for ' + delay + ' ms');
				// Save the 'this' reference for later use
				var _this = this;
				// Set the timer code
				var code = function () {
					// Execute the action
					_this._prioritize(action, enqueue, effect);
				}
				// Set a timer
				this._setTimer(code, delay);
			}
			// Else
			else {
				// Print debugging information
				this._log('The plugin is disabled');
			}
		}, 
		
		// Sets a new timer (function code, integer delay (ms))
		_setTimer: function (code, delay) {
			// If there is a timer, clear it first
			this._actionTimeout && clearTimeout(this._actionTimeout);
			// If there is some code
			if (code) {
				// If the delay is more than 0
				if (delay > 0) {
					// Print debugging information
					this._log('Setting the timer for ' + delay +' ms');
					// Set the timeout
					this._actionTimeout = setTimeout(code, delay);
				}
				// Else execute immediately
				else {
					// Print debugging information
					this._log('Executing the code instantly');
					// Execute the code
					code();
				}
			}
		}, 
		
		// Prioritizes the actions (optional string action, optional boolean enqueue, optional string effect)
		_prioritize: function (action, enqueue, effect) {
			// If enabled
			if (this.isEnabled()) {
				// Print debugging information
				this._log('Prioritizing the actions');
				// If there is an action parameter or there are actions in the action queue
				if (action !== undefined || this._actionQueue.length > 0) {
					// If there was no action parameter
					if (action === undefined) {
						// Print debugging information
						this._log('Dequeueing an action');
						var queuedItem = this._actionQueue.shift();
						// Set the action argument
						action = queuedItem[0];
						// Set the effect argument
						effect = queuedItem[1];
					}
					// If able to reserve
					if (this._reserve(action)) {
						// If not canceled by the triggered functions
						if (this['_' + action]('validate')) {
							// Execute the action
							this._execute(action, effect);
						}
						// Else canceled by the triggered functions
						else {
							// Print debugging information
							this._log('The ' + action + ' action is not currently valid');
							// Release the object
							this._release(action);
						}
					}
					// Else not able to reserve
					else {
						// Print debugging information
						this._log('Unable to reserve the object');
						// If removed from queue
						if (queuedItem !== undefined) {
							// Print debugging information
							this._log('Enqueueing the action');
							// Put the item back to the beginning of the queue
							this._actionQueue.unshift(queuedItem);
						}
						// If asked to enqueue
						else if (enqueue) {
							// Print debugging information
							this._log('Enqueueing the action');
							// Put the item the end of the queue
							this._actionQueue.push([action, effect]);
						}
					}
				}
				else {
					// Print debugging information
					this._log('No more actions in the queue');
				}
			}
			// Else
			else {
				// Print debugging information
				this._log('The plugin is disabled');
			}
		}, 
		
		// Executes the action (string action, optional string effect)
		_execute: function (action, effect) {
			// Print debugging information
			this._log('Executing the ' + action + ' action');
			// Set shortcuts
			var $elements = this.$elements;
			var settings = this.settings;
			var effects = this.effects;
			// TODO: ...
			if (effect !== undefined) {
				// If the effect value is a string
				if (typeof effect == 'string') {
					// Fetch the effect by name
					effect = effects[action][effect];
				}
			}
			// TODO: ...
			else {
				// Fetch the default effect
				effect = effects[action][settings.effects[action]];
			}
			// Set promises
			var promiseStart;
			var promiseEnd;
			/*
			// TODO
			// If not canceled by the triggered functions
			if (this._trigger(action, 'start')) {
				// TODO
			}
			// Else canceled by the triggered functions
			else {
				// Print debugging information
				this._log('Canceled by the triggered functions');
				// Release the object
				this._release(action);
			}*/
			// Trigger the events
			this._trigger(action, 'start');
			// TODO: ...
			if (this['_' + action]('start')) {
				// Call the effect and save the promise object
				promiseStart = effect.call(this, 'start', $elements, settings.animationMethod, settings.durations[action]);
				// TODO: ...
				var codeA = function () {
					// TODO: ...
					if (this['_' + action]('middle')) {
						// Trigger the events
						this._trigger(action);
						// Call the effect and save the promise object
						promiseEnd = effect.call(this, 'end', $elements, settings.animationMethod, settings.durations[action]);
						// TODO: ...
						var codeB = function () {
							// TODO: ...
							this['_' + action]('end');
							// Finish the update
							this._finish();
						}
						// Save the 'this' reference for later use
						var __this = this;
						// When the effect is executed
						promiseEnd.always(function () {
							// TODO: ...
							codeB.call(__this);
						});
					}
					// TODO: ...
					else {
						// Finish the update
						this._finish();
					}
				}
				// Save the 'this' reference for later use
				var _this = this;
				// When the effect is executed
				promiseStart.always(function () {
					codeA.call(_this);
				});
			}
			// TODO: ...
			else {
				// Finish the update
				this._finish();
			}
		}, 
		
		// Returns if the plugin is ready for action
		_ready: function () {
			// Return true if there is no current action, otherwise false
			return this._action == '';
		}, 
		
		// Reserves the object in order to prevent conflicting actions, returns true if successful (string action)
		_reserve: function (action) {
			// Print debugging information
			this._log('Reserving the object');
			// Check if the object is ready
			var ready = this._ready();
			// If ready
			if (ready) {
				// Set the current action
				this._action = action;
			}
			// Return if successful
			return ready;
		}, 
		
		// Releases the object in order to prevent conflicting actions
		_release: function () {
			// Print debugging information
			this._log('Releasing the object');
			// Set the current action to none
			this._action = '';
		}, 
		
		// Finishes the action (string action)
		_finish: function (action) {
			// Print debugging information
			this._log('Finishing the action');
			// Trigger the events
			this._trigger(action, 'end');
			// Execute the callback functions
			this._callback(action);
			// Release the object
			this._release(action);
			// Update the object (in case the situation has changed)
			this._prioritize();
		}, 
		
		// TODO: ...
		_wrapBindCode: function (bindCode) {
			// Save the 'this' reference for later use
			var _this = this;
			// Create a wrapper function that delivers 'this' reference
			var wrapperCode = function (event) {
				// Execute the bind code
				bindCode.call(_this, event);
			};
			// Return the wrapper code
			return wrapperCode;
		}, 
		
		// Triggers the events based on the current action, returns false if canceled, otherwise true (string action, optional boolean postfix, optional mixed data)
		_trigger: function (action, postfix, data) {
			// Print debugging information
			this._log('Triggering the ' + action + ' action events');
			// Set shortcuts
			var settings = this.settings;
			var triggers = settings.triggers;
			var $elements = this.$elements;
			// Capitalize the first letter of the postfix
			postfix = (postfix ? postfix.charAt(0).toUpperCase() + postfix.slice(1) : '');
			// Set utility variables
			var canceled = false;
			// If there is a trigger for the current action 
			if (triggers[action + postfix]) {
				// Go through triggers
				for (var key in triggers[action + postfix]) {
					// If there are events for the element
					if (triggers[action + postfix][key]) {
						// Set the event to a new event
						var event = new jQuery.Event(triggers[action + postfix][key]);
						// Call the trigger
						$elements[key].trigger(event, data);
						// If the event was canceled
						if (event.isDefaultPrevented()) {
							// Set canceled to true
							canceled = true;
							// Break the for loop
							break;
						}
					}
				}
			}
			// Return true if not canceled, otherwise false
			return !canceled;
		}, 
		
		// Calls the callback functions (string action)
		_callback: function (action) {
			// Print debugging information
			this._log('Executing callbacks');
			// If there is a callback function for the current action
			if (this.settings.callbacks[action]) {
				// Execute the callback function
				$.proxy(this.settings.callbacks[action], this);
			}
		}, 
		
		// Logs debugging information to the console if in the debug mode
		_log: function (message, values) {
			// If in the debug mode and the logger function exists, print debugging information
			this.debug && $.log && $.log(this.name, message, values);
		}
		
	};
	
// Execute the protective wrapper
})(jQuery, window, document);
