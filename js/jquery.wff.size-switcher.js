/*!

Size Switcher jQuery plugin
Version: 0.7 (2013-02-08 14:00)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description:

...


Usage: 

$(...).createPlugin('sizeSwitcher', [object settings], [object effects], [boolean debug]);

Returns: object jQuery


Examples: 

// Create the plugins
$('.size-switcher-target').createPlugin('sizeSwitcher');

// Get the plugins
var plugins = $('.size-switcher-target').sizeSwitcher();

// Go through the plugins
for (var i = 0; i < plugins.length; i++) {

	// Maximize the target
	plugins[i].maximize();
	
}

...

 
*/

// TODO: Tämä voidaan haluta bindata joko hover-tapahtumaan tai klikkaukseen. Miten saadaan delay riippumaan siitä?
// Pitäisikö nykyiset delayt korvata yhdellä arvolla, joka olisi kaikille toiminnoille sama?

// Add a protective wrapper
;(function ($, window, document, undefined) {

	// The default settings for the plugin
	var defaultSettings = {
		
		// Element selectors (selector string, DOM object or jQuery element)
		selectors: {
			'minimize': '.size-switcher-minimize', 
			'maximize': '.size-switcher-maximize'
		}, 
		
		// Context where the elements should be searched (selector string, DOM object or jQuery element; if empty, the default context is used)
		contexts: {
			'minimize': 'body', 
			'maximize': 'body'
		}, 
		
		// The target is minimized on startup
		startMinimized: false, 
		
		// Delays before executing actions (ms)
		delays: { 
			'minimize': 667, 
			'maximize': 667
		}, 
		
		// Effects used in actions (one of the default effect names or a custom function)
		effects: {
			'minimize': 'fade', 
			'maximize': 'fade'
		}, 
		
		// Durations for actions (ms)
		durations: {
			'show': 667, 
			'hide': 667
		}, 
		
		// Animation method (either jQuery's 'animate' or a custom animation method name, like jQuery Transit's 'transition')
		animationMethod: ($.transit && $.support.transition ? 'transition' : 'animate'), // If available, use jQuery Transit plugin's method
	
		// Class names that will be added to the plugin elements
		classNames: {
			// Target element class name
			'target': 'size-switcher-target', 
			// Minimize trigger class name
			'minimize': 'size-switcher-minimize', 
			// Maximize trigger class name
			'maximize': 'size-switcher-maximize'
		}, 
		
		// Element CSS styles (css style objects)
		styles: {
			'target': {}, 
			'minimize': {}, 
			'maximize': {}
		}, 
		
		// Binded events (event names; optionally with namespaces)
		bindEvents: {
			'minimize': {
				'window': '', 
				'target': '', 
				'minimize': 'click keypress', 
				'maximize': ''
			}, 
			'maximize': {
				'window': '', 
				'target': '', 
				'minimize': '', 
				'maximize': 'click keypress'
			}, 
			'toggle': {
				'window': '', 
				'target': '', 
				'minimize': '', 
				'maximize': ''
			}
		}, 
		
		// Binded code
		bindCode: {
			'minimize': function (event) {
				// Print debugging information
				this._log('The binded minimize action triggered');
				// Minimize the target
				this.minimize(0);
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'maximize': function (event) {
				// Print debugging information
				this._log('The binded maximize action triggered');
				// Maximize the target
				this.maximize(0);
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'toggle': function (event) {
				// Print debugging information
				this._log('The binded toggle action triggered');
				// Toggle the target
				this.toggle(0);
				// Cancel the default action and stop bubbling
				return false;
			}
		}, 
		
		// Triggered events (event names; optionally with namespaces)
		triggers: {
			'minimizeStart': {
				'target': 'minimizestart.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}, 
			'minimize': {
				'target': 'minimize.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}, 
			'minimizeEnd': {
				'target': 'minimizeend.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}, 
			'maximizeStart': {
				'target': 'maximizestart.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}, 
			'maximize': {
				'target': 'minimize.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}, 
			'maximizeEnd': {
				'target': 'maximizeend.sizeSwitcher', 
				'minimize': '', 
				'maximize': ''
			}
		}, 
		
		// Callback functions (custom functions)
		callbacks: {
			'minimize': function () {}, 
			'maximize': function () {}
		}
		
	};
		
	// The default effects for the plugin actions
	var defaultEffects = {
		
		// Effects for the 'minimize' action
		'minimize': {
			'instant': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default instant effect');
				switch (phase) {
					case 'start':
						return $elements['target'].promise();
					break;
					case 'end':
						return $elements['target'].promise();
					break;
				}
			}, 
			'fade': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default fade effect');
				switch (phase) {
					case 'start':
						$elements['target'][method]({'opacity': '0'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['target'].promise();
					break;
					case 'end':
						$elements['target'][method]({'opacity': '1'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['target'].promise();
					break;
				}
			}
		}, 
	
		// Effects for the 'maximize' action
		'maximize': {
			'instant': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default instant effect');
				switch (phase) {
					case 'start':
						return $elements['target'].promise();
					break;
					case 'end':
						return $elements['target'].promise();
					break;
				}
			}, 
			'fade': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default fade effect');
				switch (phase) {
					case 'start':
						$elements['target'][method]({'opacity': '0'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['target'].promise();
					break;
					case 'end':
						$elements['target'][method]({'opacity': '1'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['target'].promise();
					break;
				}
			}
		}
		
	};
	
	// Define the plugin
	var Plugin = {
	
		// Debug mode (prints debug information to the console if true)
		debug: false, 
		
		// Settings
		settings: {}, 
		
		// Effects
		effects: {}, 
		
		// Statuses
		status: {
			// Minimized
			minimized: false, 
			// Enabled
			enabled: false
		}, 
		
		// Elements (jQuery objects)
		$elements: {}, 
		
		// Target element
		_targetElement: null, 
		
		// Current action
		_action: '', 
		
		// Timeout for actions
		_actionTimeout: null, 
		
		// Queue for actions
		_actionQueue: [], 
		
		// Bind code
		_bindCode: {}
		
	};

	// Define the plugin prototype
	var PluginPrototype = {
	
		// Plugin's name
		name: 'WFF Size Switcher', 
		
		// Plugin's jQuery function name
		functionName: 'sizeSwitcher', 
		
		// Standalone (instances are not tied to a certain element)
		standalone: false, 
		
		// Singleton (only single instance allowed per element, or globally if a standalone plugin)
		singleton: true, 
		
		// Default settings
		defaultSettings: defaultSettings, 
		
		// Default effects
		defaultEffects: defaultEffects, 
		
		// Returns the object's minimized status
		isMinimized: function () {
			// Return the minimized status
			return this.status.minimized;
		}, 
		
		// Minimizes the target (optional integer delay (ms), optional boolean enqueue, optional string effect)
		minimize: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Minimize action called');
			// Delay the action
			this._delay('minimize', delay, enqueue, effect);
			/*
			// If enabled
			if (this.status.enabled) {
				// If no delay given, set the delay to the default value
				delay = (delay === undefined ? this.settings.delays['minimize'] : delay);
				// Print debugging information
				this._log('Minimizing the target after a delay (ms):', delay);
				// Save the 'this' reference for later use
				var _this = this;
				// Set the timer code
				var code = function () {
					// Print debugging information
					_this._log('The delay for minimize passed');
					// Set the ultimate minimized status
					_this.status.minimized.ultimate = true;
					// Update the object
					_this._update(instant);
				}
				// Launch the timer
				this._launchTimer(code, delay);
			}
			*/
		}, 
		
		// Maximizes the target (optional integer delay (ms), optional boolean enqueue, optional string effect)
		maximize: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Maximize action called');
			// Delay the action
			this._delay('maximize', delay, enqueue, effect);
			/*
			// Delay the action
			this._delay('minimize', delay, enqueue, effect);
			// If enabled
			if (this.status.enabled) {
				// If no delay given, set the delay to the default value
				delay = (delay === undefined ? this.settings.delays['maximize'] : delay);
				// Print debugging information
				this._log('Maximizing the target after a delay (ms):', delay);
				// Save the 'this' reference for later use
				var _this = this;
				// Set the timer code
				var code = function () {
					// Print debugging information
					_this._log('The delay for maximize passed');
					// Set the ultimate minimized status
					_this.status.minimized.ultimate = false;
					// Update the object
					_this._update(instant);
				}
				// Launch the timer
				this._launchTimer(code, delay);
			}
			*/
		}, 
		
		// Toggles the target (optional integer delay (ms), optional boolean enqueue, optional string effect)
		toggle: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Toggle action called');
			// If the target is minimized
			if (this.status.minimized) {
				// Maximize the target
				this.maximize(delay, enqueue, effect);
			}
			// Else the balloon is maximized
			else {
				// Minimize the target
				this.minimize(delay, enqueue, effect);
			}
			/*
			// If enabled
			if (this.status.enabled) {
				// Print debugging information
				this._log('Toggle the target after a delay (ms):', delay);
				// If the target is minimized
				if (this.status.minimized.current) {
					// Maximize after a delay
					this.maximize(delay, instant);
				}
				// Else the target is hidden
				else {
					// Minimize after a delay
					this.minimize(delay, instant);
				}
			}
			*/
		}, 
		
		// Creates the plugin, called by the factory code (object settings, object effects, boolean debug)
		_create: function (settings, effects, debug) {
			// Set the debug mode
			this.debug = (debug ? true : this.debug);
			// Print debugging information
			this._log('Creating the object');
			// Merge default settings and given settings
			$.extend(true, this.settings, this.defaultSettings, settings);
			// Merge default effects and given effects
			$.extend(true, this.effects, this.defaultEffects, effects);
			// Set shortcuts
			var status = this.status;
			var $elements = this.$elements;
			var settings = this.settings;
			var classNames = settings.classNames;
			var styles = settings.styles;
			// Print debugging information
			this._log('The target element is:', this._targetElement);
			this._log('The settings are:', settings);
			this._log('The effects are:', effects);
			// Set the target jQuery element
			$elements['target'] = $(this._targetElement);
			// Set the window jQuery element
			$elements['window'] = $(window);
			// Set the minimized status
			status.minimized = settings.startMinimized;
			// Fetch the elements
			this._fetchElements();
			// Go through the class name settings
			for (var key in classNames) {
				// Add the class names to the element
				$elements[key].addClass(classNames[key]);
			}
			// Go through the style settings
			for (var key in styles) {
				// Apply the styles to the element
				$elements[key].css(styles[key]);
			}
			// Set the object's binds
			this.bind();
			// Enable the object
			this.enable();
		}, 

		// Destroys the plugin
		_destroy: function () {
			// Print debugging information
			this._log('Destroying the object');
			// Unset the object's binds
			this.unbind();
			// Disable the object
			this.disable();
		}, 
		
		// Fetches the elements
		_fetchElements: function () {
			// Print debugging information
			this._log('Fetching the elements');
			// Set shortcuts
			var settings = this.settings;
			var selectors = settings.selectors;
			var contexts = settings.contexts;
			var $elements = this.$elements;
			// Go through the selectors
			for (key in selectors) {
				// Set the selector
				var selector = selectors[key];
				// If no selector was given
				if (!selector) {
					// Set the jQuery element (to a new jQuery element)
					$elements[key] = $('<div>');
				}
				// Else the selector was given
				else {
					// Set the context
					var context = contexts[key];
					// If no context was given
					if (!context) {
						// Set context to default context
						context = $elements['target'];
					}
					// Set the target jQuery element (search from the context)
					$elements[key] = $(selector, $(context));
				}
			}
			// Check if the element is attached into DOM
			var minimizeAttached = !!$elements['minimize'].closest('html').length;
			// If the minimize trigger is not attached
			if (!minimizeAttached) {
				// Attach the element into DOM
				$elements['target'].prepend($elements['minimize']);
			}
			// Check if the element is attached into DOM
			var maximizeAttached = !!$elements['maximize'].closest('html').length;
			// If the minimize trigger is not attached
			if (!maximizeAttached) {
				// Attach the element into DOM
				$elements['target'].prepend($elements['maximize']);
			}
		}, 
		
		// Executes the minimize action (optional string phase)
		_minimize: function (phase) {
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// If the target is already minimized
					if (this.status.minimized) {
						// Cancel the action
						return false;
					}
				break;
				// Phase is 'start'
				case 'start':
				break;
				// Phase is 'middle'
				case 'middle':
					// Set the status to minimized
					this.status.minimized = true;
					// Switch the class names based on the minimized status
					this.$elements['target'].removeClass('maximized').addClass('minimized');
				break;
				// Phase is 'end'
				case 'end':
				break;
			}
			return true;
		}, 
		
		// Executes the maximize action (optional string phase)
		_maximize: function (phase) {
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// If the balloon is already maximized
					if (!this.status.minimized) {
						// Cancel the action
						return false;
					}
				break;
				// Phase is 'start'
				case 'start':
				break;
				// Phase is 'middle'
				case 'middle':
					// Set the status to maximized
					this.status.minimized = false;
					// Switch the class names based on the minimized status
					this.$elements['target'].removeClass('minimized').addClass('maximized');
				break;
				// Phase is 'end'
				case 'end':
				break;
			}
			return true;
		}
		
		/*
		// Updates the object (optional boolean instant)
		_update: function (instant) {
			// Print debugging information
			this._log('Updating');
			// Set shortcuts
			var enabled = this.status.enabled;
			var minimized = this.status.minimized;
			// If enabled and the current display status is different than the ultimate
			if (enabled && minimized.current != minimized.ultimate) {
				// Set action
				var action = (minimized.ultimate ? 'minimize' : 'maximize');
				// If able to reserve
				if (this._reserve(action)) {
					// If not canceled by triggered functions
					if (this._trigger('start')) {
						// Refresh the object
						this._refresh(instant);
					}
					// Else canceled by triggered functions
					else {
						// Release the object
						this._release(action);
					}
				}
			}
		}, 
		
		// Finishes updating the object, called after refresh (optional boolean instant)
		_finish: function (instant) {
			// Print debugging information
			this._log('Finishing the update');
			// Set shortcuts
			var minimized = this.status.minimized;
			// Toggle the current minimized status
			minimized.current = !minimized.current;
			// Execute the trigger functions
			this._trigger('end');
			// Execute the callback functions
			this._callback();
			// Release the object
			this._release();
			// Update the object (in case the situation has changed)
			this._update(instant);
		}, 
		
		// Refreshes the object (optional boolean instant)
		_refresh: function (instant) {
			// Print debugging information
			this._log('Animating the object');
			// Set shortcuts
			var action = this._action;
			var $elements = this.$elements;
			var settings = this.settings;
			var animationMethod = settings.animationMethod;
			var effects = settings.effects;
			// Set promise
			var promise;
			// If instant
			if (instant) {
				// Call the instant effect and save the promise object
				promise = defaultEffects[action]['instant'].call(this, $elements, animationMethod);
			}
			// Else
			else {
				// Call the effect and save the promise object
				promise = effects[action].call(this, $elements, animationMethod);
			}
			// If a promise was returned
			if (promise) {
				// Save the 'this' reference for later use
				var _this = this;
				// When the effect is executed
				promise.always(function () {
					// Finish the update
					_this._finish(instant);
				});
			}
			// Else no promise was returned
			else {
				// Finish the update
				this._finish(instant);
			}
		}
		*/
		
	};

	// Define the plugin's constructor
	var PluginConstructor = function (targetElement) {
		// Merge this and the plugin object
		$.extend(true, this, Plugin);
		// Set the target element
		this._targetElement = targetElement;
	};
	
	// Set the plugin's prototype
	PluginConstructor.prototype = $.extend(true, {}, $.wffComponentPrototype, PluginPrototype);
	
	// Register the plugin
	$.wffRegisterPlugin(PluginConstructor);

// Execute the protective wrapper
})(jQuery, window, document);