/*!

Grid Row Fix jQuery plugin
Version: 0.7 (2013-02-05 17:00)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description:

...


Usage: 

$(...).createPlugin('gridRowFix', [object settings], [object effects], [boolean debug]);

Returns: object jQuery


Examples: 

// Create the plugins using the default settings and effects
$('.grid-row-fix-target').createPlugin('gridRowFix');


// Get the plugins
var plugins = $('.grid-row-fix-target').gridRowFix();

// Go through the plugins
for (var i = 0; i < plugins.length; i++) {

	// Update the grid rows
	plugins[i].update();
	
}


*/

// TODO: Lisää tarkistus siitä, tarvitseeko jotakin tehdä (onko kaikilta jo poistettu left-marginaalit ja lisätty clear left, tai ehkä suoritetaan fluid layout -tilassa?)
// TODO: Miten bindattu koodi poistetaan siinä tapauksessa, jos siihen ei ole viittausta? Pitääkö viittauksetkin säilyttää?
// TODO: Pitäisikö lisätä asetus gridin solujen valitsimista ja kontekstista?


// Add a protective wrapper
;(function ($, window, document, undefined) {

	// The default settings for the plugin
	var defaultSettings = {
		
		// Updates the grids at startup
		updateOnStart: false, 
		
		// Delays before executing actions (ms)
		delays: {
			'update': 1000
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
			'target': 'grid-row-fix-target'
		}, 
		
		// Element CSS styles (css style objects)
		styles: {
			'target': {}
		}, 
		
		// Binded events (event names; optionally with namespaces)
		// Note that element's resize event support is poor. Window element is a safe choice.
		bindEvents: {
			'update': {
				'window': 'resize', 
				'target': ''
			}, 
			'fix': {
				'window': 'layoutupdate.responsiveLayout', 
				'target': 'layoutupdate.responsiveLayout'
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
			}, 
			'fix': function (event) {
				// Print debugging information
				this._log('The binded fix action triggered');
				// Clear the timer
				this._setTimer();
				// Fix the grid
				this.fix();
				// Cancel the default action and stop bubbling
				return false;
			}
		}, 
		
		// Triggered events (event names; optionally with namespaces)
		triggers: {
			'updateStart': {
				'window': 'gridupdatestart.gridRowFix', 
				'target': 'gridupdatestart.gridRowFix'
			}, 
			'update': {
				'window': 'gridupdate.gridRowFix', 
				'target': 'gridupdate.gridRowFix'
			}, 
			'updateEnd': {
				'window': 'gridupdateend.gridRowFix', 
				'target': 'gridupdateend.gridRowFix'
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
						var $target = $elements['target'];
						$target[method]({'opacity': '0'}, duration / 2, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $target.promise();
					break;
					case 'end':
						var $target = $elements['target'];
						$target[method]({'opacity': '1'}, duration / 2, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $target.promise();
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
		_bindCode: {}, 
		
		// Last grid width
		_lastGridWidth: 0
		
	};

	// Define the plugin prototype
	var PluginPrototype = {
		
		// Plugin's name
		name: 'WFF Grid Row Fix', 
		
		// Plugin's jQuery function name
		functionName: 'gridRowFix', 
		
		// Standalone (instances are not tied to a certain element)
		standalone: false, 
		
		// Singleton (only single instance allowed per element, or globally if a standalone plugin)
		singleton: true, 
		
		// Default settings
		defaultSettings: defaultSettings, 
		
		// Default effects
		defaultEffects: defaultEffects, 
		
		// Check if IE7 (or lower) and save info
		_isIE7: $.browser.msie && parseInt($.browser.version, 10) < 8, 
		
		// Updates the layout (optional integer delay (ms), optional boolean enqueue, optional string effect)
		update: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Update action called');
			// Delay the action
			this._delay('update', delay, enqueue, effect);
			/*
			// If enabled
			if (this.status.enabled) {
				// If no delay given, set the delay to the default value
				delay = (delay === undefined ? this.settings.delays['check'] : delay);
				// Print debugging information
				this._log('Checking the grid rows after a delay (ms):', delay);
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
			*/
		}, 
		
		// Fixes the grid rows
		fix: function () {
			// Print debugging information
			this._log('Fixing the grid rows');
			// Set shortcuts
			var $elements = this.$elements;
			var isIE7 = this._isIE7;
			// Set grid cells
			var $cells = $elements['target'].children();
			// Remove the row break class from each grid cell
			$cells.removeClass('auto-row-break');
			// IE7 fix: Remove additional elements
			isIE7 && $cells.filter('.ie7-fix').remove();
			// Set the last x position
			var lastX = 0;
			// Set utility variables
			var coords;
			// Go through all grid cells
			$cells.each(function (index) {
				// Set the cell jQuery object
				var $cell = $(this);
				// Get the cell's coordinates (default 0, 0)
				coords = $cell.position() || {left: 0, top: 0};
				// If the first item or if the cell is dropped to the next row
				if (coords.left <= lastX) {
					// Add the row break class to the grid cell
					$cell.addClass('auto-row-break');
					// IE7 fix: Insert additional element in order to avoid the float clearing bug
					isIE7 && $cell.before('<div class="ie7-fix" style="float: none !important; clear: both !important; margin: 0px !important; height: 0px !important;"></div>');
					// Get the cell's coordinates (default 0, 0)
					coords = $cell.position() || {left: 0, top: 0};
					// Update the last x position
					lastX = coords.left;
				}
				else {
					// Update the last x position
					lastX = coords.left;
				}
			});
			// Set the last grid width
			this._lastGridWidth = $elements['target'].width();
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
			var $elements = this.$elements;
			var settings = this.settings;
			var classNames = settings.classNames;
			var styles = settings.styles;
			var effects = settings.effects;
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
			// Set the object's binds
			this.bind();
			// Enable the object
			this.enable();
			// If asked to, update on startup
			settings.updateOnStart && this.fix();
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
			// Set the grid width
			var gridWidth = this.$elements['target'].width();
			// If enabled and if the window's width has changed (prevents unnecessary calls, also fixes infinite loop IE7 & IE8)
			if (enabled && gridWidth != this._lastGridWidth) {
				// If able to reserve
				if (this._reserve('rowFix')) {
					// If not canceled by triggered functions
					if (this._trigger('start')) {
						// Set the last grid width
						this._lastGridWidth = gridWidth;
						// Refresh the object
						this._refresh(instant);
					}
				}
				// Else canceled by triggered functions
				else {
					// Release the object
					this._release('rowFix');
				}
			}
		}, 
		
		// Finishes updating the object, called after refresh (optional boolean instant)
		_finish: function (instant) {
			// Print debugging information
			this._log('Finishing the update');
			// Set shortcuts
			var status = this.status;
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
			var status = this.status;
			var $elements = this.$elements;
			var settings = this.settings;
			var effects = this.settings.effects;
			var animationMethod = settings.animationMethod;
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
				promise = settings.effects[action].call(this, $elements, animationMethod);
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
			var settings = this.settings;
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// Print debugging information
					this._log('Validating the update action');
					// Test if the grid is visible
					if (!$elements['target'].is(':visible')) {
						// Cancel the action
						return false;
					}
					// Set the grid width
					var gridWidth = $elements['target'].width();
					// If the grid width has not changed
					if (gridWidth == this._lastGridWidth) {
						// Cancel the action
						return false;
					}
					// Set the last grid width
					this._lastGridWidth = gridWidth;
				break;
				// Phase is 'start'
				case 'start':
				break;
				// Phase is 'middle'
				case 'middle':
					// Fix the grid
					this.fix();
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