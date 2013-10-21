/*!

Responsive Layout jQuery plugin
Version: 0.7 (2013-02-05 13:30)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description:

Binds to window object's resize event and sets the element's class 
based on given class names and media selectors. Provides more logic than 
what a would be possible with the current support for media queries in 
different browsers.


Usage: 

$(...).createPlugin('responsiveLayout', [object settings], [object effects], [boolean debug]);

Returns: object jQuery


Examples: 

// Create the plugins using the default settings and effects
$('.responsive-layout-target').createPlugin('responsiveLayout');

// Get the plugins
var plugins = $('.responsive-layout-target').responsiveLayout();

// Go through the plugins
for (var i = 0; i < plugins.length; i++) {

	// Update the layout
	plugins[i].update();

}

...


*/

// TODO: Tulostus saa ikkunan muuttumaan fluidiksi vähäksi aikaa???
// TODO: Pitäisikö tämän olla singleton ja asettaa layout jonnekin tiedoksi kaikkien muiden plugareiden saataville?
// TODO: Mieti voisiko toiminnallisuutta yksinkertaistaa, erityisesti automaattisen kuuntelun kohdalla
// TODO: Lue dokumentaatio läpi ja korjaa mahdolliset virheet
// TODO: Pitäisikö autoupdate tehdä ajastetusti? http://stackoverflow.com/questions/599288/cross-browser-window-resize-event-javascript-jquery
 
 
// Add a protective wrapper
;(function ($, window, document, undefined) {

	// The default settings for the plugin
	var defaultSettings = {
		
		// The layout applied on startup
		startLayout: 'default', 
		
		// Updates the layout on startup
		updateOnStartup: false, 
		
		// Updates the layout automatically
		autoUpdate: true, 
		
		// Layout options (syntax: string name: string media query)
		// Only the first matching layout will be applied
		// Note that media query 'min-width' always returns false in IE8 and lower
		// There is not enough browser support to get the print media query to work: http://tjvantoll.com/2012/06/15/detecting-print-requests-with-javascript/
		layouts: {
			// 'wide': 'screen AND (min-width: 1280px)', 
			'default': '(min-width: 980px)', 
			'narrow': '(min-width: 740px)', 
			'fluid': '(min-width: 0px)'
			//'fluid': 'screen AND (max-width: 739px)', 
			//'narrow': 'screen AND (max-width: 979px)', 
			//'default': ''
		}, 
		
		// Default layout (if none of the layout tests match)
		defaultLayout: 'default', 
		
		// Delays before executing actions (ms)
		delays: {
			'update': 667
		}, 
		
		// Effects used in actions (one of the default effect names or a custom function)
		effects: {
			'update': 'instant'
		}, 
		
		// Durations for actions (ms)
		durations: {
			'update': 667
		}, 
		
		// Animation method (either jQuery's 'animate' or a custom animation method name, like jQuery Transit's 'transition')
		animationMethod: ($.transit && $.support.transition ? 'transition' : 'animate'), // Uses jQuery Transit's transition method if available
		
		// Class names that will be added to the plugin elements
		classNames: {
			// Target element class name
			'target': 'responsive-layout-target'
		}, 
		
		// Element CSS styles (css style objects)
		styles: {
			'target': {}
		}, 
		
		// Binded events (event names; optionally with namespaces)
		// Note that the the layout change is automatically triggered by the media match listeners if the autoUpdate setting is on
		bindEvents: {
			'update': {
				'window': 'resize', 
				'target': ''
			}
		}, 
		
		// Binded code
		bindCode: {
			'update': function (event) {
				// Print debugging information
				this._log('The binded update action triggered');
				// Update the object (with a delay)
				this.update();
				// Cancel the default action and stop bubbling
				return false;
			}
		}, 
		
		// Triggered events (event names; optionally with namespaces)
		triggers: {
			'updateStart': {
				'window': 'layoutupdatestart.responsiveLayout', 
				'target': 'layoutupdatestart.responsiveLayout'
			}, 
			'update': {
				'window': 'layoutupdate.responsiveLayout', 
				'target': 'layoutupdate.responsiveLayout'
			}, 
			'updateEnd': {
				'window': 'layoutupdateend.responsiveLayout', 
				'target': 'layoutupdateend.responsiveLayout'
			}
		},
		
		// Callback functions (custom functions)
		callbacks: {
			'update': function () {}
		}
		
	};
		
	// The default effects for the plugin actions
	var defaultEffects = {
	
		// Effects for the 'update' action
		'update': {
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
						var $body = $('body');
						$body[method]({'opacity': '0'}, duration / 2, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $body.promise();
					break;
					case 'end':
						var $body = $('body');
						$body[method]({'opacity': '1'}, duration / 2, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $body.promise();
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
		
		// Status
		status: {
			// Layout
			layout: null, 
			// Enabled
			enabled: false
		}, 
		
		// Elements (jQuery objects)
		$elements: {}, 
		
		// Media queries
		mediaQueries: {}, 
		
		/*
		// Print media query
		printMediaQuery: {}, 
		*/
		
		// Target element
		_targetElement: null, 
		
		// Current action
		_action: '', 
		
		// Timeout for actions
		_actionTimeout: null, 
		
		// Queue for actions
		_actionQueue: [], 
		
		// Bind code
		_bindCode: {}, 
		
		// Last window width
		_lastWindowWidth: 0
		
	};

	// Define the plugin prototype
	var PluginPrototype = {
		
		// Plugin's name
		name: 'WFF Responsive Layout', 
		
		// Plugin's jQuery function name
		functionName: 'responsiveLayout', 
		
		// Standalone (instances are not tied to a certain element)
		standalone: false, 
		
		// Singleton (only single instance allowed per element, or globally if a standalone plugin)
		singleton: true, 
		
		// Default settings
		defaultSettings: defaultSettings, 
		
		// Default effects
		defaultEffects: defaultEffects, 
		
		// Updates the layout (optional integer delay (ms), optional boolean enqueue, optional string effect)
		update: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Update action called');
			// Delay the action
			this._delay('update', delay, enqueue, effect);
		}, 
		
		/*
		// Updates the layout (optional integer delay (ms), optional boolean instant)
		update: function (delay, instant) {
			// If enabled
			if (this.status.enabled) {
				// If no delay given, set the delay to the default value
				delay = (delay === undefined ? this.settings.delays['check'] : delay);
				// Print debugging information
				this._log('Checking the layout after a delay (ms):', delay);
				// Save the 'this' reference for later use
				var _this = this;
				// Set the timer code
				var code = function () {
					// Print debugging information
					_this._log('The delay for check passed');
					// Update the object
					_this._update(instant);
				}
				// Launch the timer
				this._launchTimer(code, delay);
			}
		},
		*/
		
		// Returns the object's current layout
		getCurrentLayout: function () {
			// Return the current layout
			return this.settings.layouts[this.status.layout];
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
			var mediaQueries = this.mediaQueries;
			var $elements = this.$elements;
			var settings = this.settings;
			var layouts = this.settings.layouts;
			var classNames = settings.classNames;
			var styles = settings.styles;
			var effects = this.settings.effects;
			// Print debugging information
			this._log('The target element is:', this._targetElement);
			this._log('The settings are:', settings);
			this._log('The effects are:', effects);
			// Set the target jQuery element
			$elements['target'] = $(this._targetElement);
			// Set the window jQuery element
			$elements['window'] = $(window);
			// Add the class names to the element
			$elements['target'].addClass(classNames['target']);
			// Apply the styles to the element
			$elements['target'].css(styles['target']);
			// If the startup layout is defined
			if (settings.startLayout) {
				// Set the current layout to default layout
				status.layout = settings.startLayout;
				// Add the startup layout class name to the target element
				$elements['target'].addClass('layout-' + settings.startLayout);
			}
			// If match media is supported
			if (window.matchMedia) {
				/*
				// Create a print query
				this.printMediaQuery = window.matchMedia('print');
				*/
				// For each layout
				for (var key in layouts) {
					// Create media queries
					mediaQueries[key] = window.matchMedia(layouts[key]);
				}
				// If auto update is on
				if (settings.autoUpdate) {
					// Save the 'this' reference for later use
					var _this = this;
					// Set the timer code
					var code = function (mediaQueryList) {
						// Print debugging information
						_this._log('The automatic update triggered');
						// Update the object (without a delay)
						_this.update(0);
					}
					// For each media query
					for (var key in mediaQueries) {
						// Bind to media queries
						mediaQueries[key].addListener(code);
					}
				}
			}
			// Set the object's binds
			this.bind();
			// Enable the object
			this.enable();
			// If set to update at startup
			if (!settings.updateOnStartup) {
				// Update on startup
				this.update(0);
			}
			// Else
			else {
				// Set the last window width to current width
				this._lastWindowWidth = $elements['window'].width();
			}
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
		
		/*
		// Updates the layout (optional boolean instant)
		_update: function (instant) {
			// Print debugging information
			this._log('Updating');
			// Set shortcuts
			var enabled = this.status.enabled;
			// Set the window width
			var windowWidth = $(window).width();
			// If enabled and if the window's width has changed (prevents unnecessary calls)
			if (enabled && windowWidth != this._lastWindowWidth) {
				// If match media is supported
				if (window.matchMedia) {
					// Set shortcuts
					var layout = this.status.layout;
					var $target = this.$elements['target'];
					var settings = this.settings;
					var layouts = settings.layouts;
					var defaultLayout = settings.defaultLayout;
					var mediaQueries = this.mediaQueries;
					// Set the ultimate layout to the default layout
					layout.ultimate = defaultLayout;
					// Go through the media queries
					for (var key in mediaQueries) {
						// If the layout matches
						if (mediaQueries[key].matches) {
							// Set the ultimate layout to the matched layout
							layout.ultimate = key;
							// Use the first match
							break;
						}
					}
					// If the matching layout has changed
					if (layout.ultimate != layout.current) {
						// If able to reserve
						if (this._reserve('change')) {
							// If not canceled by triggered functions
							if (this._trigger('start', layout.current)) {
								// Save the next layout status
								layout.next = layout.ultimate;
								// Set the last window width
								this._lastWindowWidth = windowWidth;
								// Refresh the object
								this._refresh(instant);
							}
						}
						// Else canceled by triggered functions
						else {
							// Release the object
							this._release('change');
						}
					}
				}
			}
		}, 
		
		// Finishes updating the object, called after refresh (optional boolean instant)
		_finish: function (instant) {
			// Print debugging information
			this._log('Finishing the update');
			// Set shortcuts
			var status = this.status;
			var layout = status.layout;
			// Set the current layout
			layout.current = layout.next;
			// Execute the trigger functions
			this._trigger('end', layout.current);
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
			this._log('Animating the object into layout:', this.status.layout.ultimate);
			// Set shortcuts
			var action = this._action;
			var status = this.status;
			var layout = status.layout;
			var $elements = this.$elements;
			var settings = this.settings;
			var layouts = this.settings.layouts;
			var effects = this.settings.effects;
			var animationMethod = settings.animationMethod;
			// Set promise
			var promise;
			// If instant
			if (instant) {
				// Call the instant effect and save the promise object
				promise = defaultEffects[action]['instant'].call(this, layout, $elements, animationMethod);
			}
			// Else
			else {
				// Call the effect and save the promise object
				promise = effects[action].call(this, layout, $elements, animationMethod);
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
		
		// Executes the update action (optional string phase)
		_update: function (phase) {
			// Set shortcuts
			var $elements = this.$elements;
			var status = this.status;
			var settings = this.settings;
			var layouts = this.settings.layouts;
			var mediaQueries = this.mediaQueries;
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// Print debugging information
					this._log('Validating the update action');
					// Set the window width
					var windowWidth = $elements['window'].width();
					// If the window width has not changed
					if (windowWidth == this._lastWindowWidth) {
						// Cancel the action
						return false;
					}
					// Set the last window width
					this._lastWindowWidth = windowWidth;
					// Set the next layout to same as the default layout
					var nextLayout = settings.defaultLayout;
					// If match media is supported
					if (window.matchMedia) {
						/*
						// Test if currently printing
						if (this.printMediaQuery.matches) {
							nextLayout = status.layout;
						}
						// Else not printing
						else {
						*/
							// Go through the media queries
							for (var key in mediaQueries) {
								// If the layout matches
								if (mediaQueries[key].matches) {
									// Set the layout to the matched layout
									nextLayout = key;
									// Use the first match
									break;
								}
							}
						/*
						}
						*/
					}
					// If the matching layout has not changed
					if (status.layout == nextLayout) {
						// Cancel the action
						return false;
					}
					// Change the current layout
					status.layout = nextLayout;
				break;
				// Phase is 'start'
				case 'start':
				break;
				// Phase is 'middle'
				case 'middle':
					// Print debugging information
					this._log('Updating to the ' + status.layout + ' layout');
					// Go through the layout settings
					for (var key in layouts) {
						// Remove the obsolete layout classes
						status.layout != key && $elements['target'].removeClass('layout-' + key);
					}
					// Add the current layout class
					$elements['target'].addClass('layout-' + status.layout);
				break;
				// Phase is 'end'
				case 'end':
				break;
			}
			return true;
		}
		
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