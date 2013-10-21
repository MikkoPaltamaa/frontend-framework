/*!

Speech Balloon jQuery plugin
Version: 0.7 (2013-02-05 13:30)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description:

This plugin can be used to create speech balloons either from existing 
DOM elements, element attributes, or custom HTML code. Apply it to the 
target elements that the speech balloon are related to.


Usage: 

$(...).createPlugin('speechBalloon', [object settings], [object effects], [boolean debug]);

Returns: object jQuery


Examples: 

// Create the plugins using the default settings and effects
$('.speech-balloon-target').createPlugin('speechBalloon');

// Get the plugins
var plugins = $('.speech-balloon-target').speechBalloon();

// Go through the plugins
for (var i = 0; i < plugins.length; i++) {

	// Show the speech balloon
	plugins[i].show();
	
}

...

 
*/

// TODO: Toteuta asetus etäisyydestä target-elementistä
// TODO: Lisää asetus ja koodit, jotka kohdistavat puhekuplan kursoriin
// TODO: Lisää koodi, joka hakee URL-sisällön tarvittaessa


// Add a protective wrapper
;(function ($, window, document, undefined) {

	// The default settings for the plugin
	var defaultSettings = {
		
		// Element selectors (selector string, DOM object or jQuery element)
		selectors: {
			'balloon': '.speech-balloon-balloon', 
			'content': '.speech-balloon-content'
		}, 
		
		// Context where the elements should be searched (selector string, DOM object or jQuery element; if empty, the default context is used)
		contexts: {
			'balloon': 'body', 
			'content': 'body'
		}, 
		
		// The balloon is visible on startup
		startVisible: false, 
		
		// Content source type (none, element, attribute, html or url)
		sourceType: 'none', 
		
		// Content sources
		sources: {
			// Element source
			element: {
				// Element selector (selector string, DOM object or jQuery element)
				selector: '.speech-balloon-source', 
				// Context where the elements should be searched (selector string, DOM object or jQuery element; if empty, the default context is used)
				context: 'body', 
				// If the content element should be cloned insted of detached from its current location
				clone: false
			}, 
			// Attribute source
			attribute: {
				// Source element (element key)
				element: 'target', 
				// Source attribute (attribute name)
				name: 'title', 
				// If the source attribute should be removed
				remove: true
			}, 
			// HTML source (HTML string)
			html: '', 
			// URL source (URL string)
			url: ''
		}, 
		
		// Balloon anchor (none or target)
		anchor: 'target', 
		
		// Alignments (syntax: 'horizontal vertical')
		alignment: {
			// Target (left, center or right; top, center or bottom)
			'target': 'center top', 
			// Balloon (left, center or right; top, center or bottom)
			'balloon': 'center bottom'
		}, 
		
		// Balloon stays inside the document
		stayInDocument: true, 
		
		// Balloon's distance from the document borders (in px)
		documentDistance: 20, 
		
		/*
		// TODO: Poista nämä turhina
		// Balloon stays inside the browser's viewport
		stayInViewport: false, 
		
		// Balloon's distance from the viewport borders (in px)
		viewportDistance: 20, 
		*/
		
		// Delays before executing actions (ms)
		delays: {
			'show': 667, 
			'hide': 667
		}, 
		
		// Effects used in actions (one of the default effect names or a custom function)
		effects: {
			'show': 'fade', 
			'hide': 'fade'
		}, 
		
		// Durations for actions (ms)
		durations: {
			'show': 333, 
			'hide': 333
		}, 
		
		// Animation method (either jQuery's 'animate' or a custom animation method name, like jQuery Transit's 'transition')
		animationMethod: ($.transit && $.support.transition ? 'transition' : 'animate'), // If available, use jQuery Transit plugin's method
	
		// Class names that will be added to the plugin elements
		classNames: {
			// Target element class name
			'target': 'speech-balloon-target', 
			// Balloon class name
			'balloon': 'speech-balloon-balloon', 
			// Balloon content class name
			'content': 'speech-balloon-content'
		}, 
		
		// Element CSS styles (css style objects)
		styles: {
			'target': {}, 
			'balloon': {
				'display': 'block', 
				'position': 'absolute', 
				'z-index': '10'
			}, 
			'content': {}
		}, 
		
		// Binded events (event names; optionally with namespaces)
		bindEvents: {
			'relocate': {
				'window': 'resize layoutupdate.responsiveLayout', 
				'target': 'resize', 
				'balloon': 'resize', 
				'content': ''
			}, 
			'show': {
				'window': '', 
				'target': 'mouseenter focusin', 
				'balloon': 'mouseenter focusin', 
				'content': ''
			}, 
			'hide': {
				'window': '', 
				'target': 'mouseleave focusout', 
				'balloon': 'mouseleave focusout', 
				'content': ''
			}, 
			'toggle': {
				'window': '', 
				'target': '', 
				'balloon': '', 
				'content': ''
			}
		}, 
		
		// Binded code
		bindCode: {
			'relocate': function (event) {
				// Print debugging information
				this._log('The binded relocate action triggered');
				// If the balloon is visible
				if (this.isVisible()) {
					// Relocate the balloon
					this.relocate();
				}
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'show': function (event) {
				// Print debugging information
				this._log('The binded show action triggered');
				// Show the balloon
				this.show();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'hide': function (event) {
				// Print debugging information
				this._log('The binded hide action triggered');
				// Hide the balloon
				this.hide();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'toggle': function (event) {
				// Print debugging information
				this._log('The binded toggle action triggered');
				// Toggle the balloon
				this.toggle();
				// Cancel the default action and stop bubbling
				return false;
			}
		}, 
		
		// Triggered events (event names; optionally with namespaces)
		triggers: {
			'showStart': {
				'window': '', 
				'target': '', 
				'balloon': 'showstart.speechBalloon', 
				'content': ''
			}, 
			'showEnd': {
				'window': '', 
				'target': '', 
				'balloon': 'showend.speechBalloon', 
				'content': ''
			}, 
			'hideStart': {
				'window': '', 
				'target': '', 
				'balloon': 'hidestart.speechBalloon', 
				'content': ''
			}, 
			'hideEnd': {
				'window': '', 
				'target': '', 
				'balloon': 'hideend.speechBalloon', 
				'content': ''
			}
		}, 
		
		// Callback functions (custom functions)
		callbacks: {
			'show': function () {}, 
			'hide': function () {}
		}
		
	};
		
	// The default effects for the plugin actions
	var defaultEffects = {
	
		// Effects for the 'show' action
		'show': {
			'instant': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default instant effect');
				switch (phase) {
					case 'start':
						//$elements['balloon'].removeClass('hidden').addClass('visible');
						$elements['balloon'].css({'visibility': 'visible', 'opacity': '1'});
						return $elements['balloon'].promise();
					break;
					case 'end':
						return $elements['balloon'].promise();
					break;
				}
			}, 
			'fade': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default fade effect');
				switch (phase) {
					case 'start':
						//$elements['balloon'].removeClass('hidden').addClass('visible');
						$elements['balloon'].css({'visibility': 'visible', 'opacity': '0'});
						$elements['balloon'][method]({'opacity': '1'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['balloon'].promise();
					break;
					case 'end':
						return $elements['balloon'].promise();
					break;
				}
			}
		}, 
		
		// Effects for the 'hide' action
		'hide': {
			'instant': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default instant effect');
				switch (phase) {
					case 'start':
						$elements['balloon'].removeClass('visible').addClass('hidden');
						$elements['balloon'].css({'visibility': 'hidden', 'opacity': '0'});
						return $elements['balloon'].promise();
					break;
					case 'end':
						return $elements['balloon'].promise();
					break;
				}
			}, 
			'fade': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default fade effect');
				switch (phase) {
					case 'start':
						$elements['balloon'].removeClass('visible').addClass('hidden');
						$elements['balloon'].css({'visibility': 'visible', 'opacity': '1'});
						$elements['balloon'][method]({'opacity': '0'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['balloon'].promise();
					break;
					case 'end':
						$elements['balloon'].css({'visibility': 'hidden'});
						return $elements['balloon'].promise();
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
			// Visible
			visible: false, 
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
		name: 'WFF Speech Balloon', 
		
		// Plugin's jQuery function name
		functionName: 'speechBalloon', 
		
		// Standalone (instances are not tied to a certain element)
		standalone: false, 
		
		// Singleton (only single instance allowed per element, or globally if a standalone plugin)
		singleton: false, 
		
		// Default settings
		defaultSettings: defaultSettings, 
		
		// Default effects
		defaultEffects: defaultEffects, 
		
		// Returns the object's visible status
		isVisible: function () {
			// Return the visible status
			return this.status.visible;
		}, 
		
		// Shows the balloon (optional integer delay (ms), optional boolean enqueue, optional string effect)
		show: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Show action called');
			// Delay the action
			this._delay('show', delay, enqueue, effect);
		}, 
		
		// Hides the balloon (optional integer delay (ms), optional boolean enqueue, optional string effect)
		hide: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Hide action called');
			// Delay the action
			this._delay('hide', delay, enqueue, effect);
		}, 
		
		// Toggles the balloon (optional integer delay (ms), optional boolean enqueue, optional string effect)
		toggle: function (delay, enqueue, effect) {
			// Print debugging information
			this._log('Toggle action called');
			// If the balloon is visible
			if (this.status.visible) {
				// Hide after a delay
				this.hide(delay, enqueue, effect);
			}
			// Else the balloon is hidden
			else {
				// Show after a delay
				this.show(delay, enqueue, effect);
			}
		}, 
		
		// Relocates the balloon
		relocate: function () {
			// Print debugging information
			this._log('Relocating the balloon');
			// Set shortcuts
			var $elements = this.$elements;
			var settings = this.settings;
			var anchor = settings.anchor;
			var alignment = settings.alignment;
			// If the anchor is 'target'
			if (anchor == 'target') {
				// Set utility variables
				var coords;
				var parts;
				// Set the balloon's left and top styles
				$elements['balloon'].css({'left': '0px', 'top': '0px'});
				// Get the container's coordinates (default 0, 0)
				coords = $elements['balloon'].offsetParent().offset() || {left: 0, top: 0};
				// Set the container's coordinates
				var containerLeft = coords.left;
				var containerTop = coords.top;
				// Set the anchor's coordinates
				var anchorX;
				var anchorY;
				// If the anchor was 'target'
				if (anchor == 'target') {
					// Set utility variables
					var targetWidth, targetHeight;
					// Fetch the target element's coordinates (default 0, 0)
					coords = $elements['target'].offset() || {left: 0, top: 0};
					// Set the the achor into target element's coordinates
					anchorX = coords.left;
					anchorY = coords.top;
					// Fetch the target element's size
					targetWidth = $elements['target'].outerWidth();
					targetHeight = $elements['target'].outerHeight();
					// Split the target's alignment string
					parts = alignment['target'].split(' ');
					// If the first part was 'center'
					if (parts[0] == 'center') {
						// Calculate the anchor point's x coordinates
						anchorX += targetWidth / 2;
					}
					// Else if the first part was 'right'
					else if (parts[0] == 'right') {
						// Calculate the anchor point's x coordinates
						anchorX += targetWidth;
					}
					// If the second part was 'center'
					if (parts[1] == 'center') {
						// Calculate the anchor point's y coordinates
						anchorY += targetHeight / 2;
					}
					// If the second part was 'bottom'
					else if (parts[1] == 'bottom') {
						// Calculate the anchor point's y coordinates
						anchorY += targetHeight;
					}
				}
				// Fetch the balloon's size
				var balloonWidth = $elements['balloon'].outerWidth();
				var balloonHeight = $elements['balloon'].outerHeight();
				// Fetch the balloon margins
				var marginRight = parseInt($elements['balloon'].css('margin-right').replace('px', ''));
				var marginTop = parseInt($elements['balloon'].css('margin-top').replace('px', ''));
				var marginBottom = parseInt($elements['balloon'].css('margin-bottom').replace('px', ''));
				var marginLeft = parseInt($elements['balloon'].css('margin-left').replace('px', ''));
				// Set the balloon's offset
				var offsetX = marginLeft;
				var offsetY = marginTop;
				// Split the balloon's alignment string
				parts = alignment['balloon'].split(' ');
				// If the first part was 'center'
				if (parts[0] == 'center') {
					// Calculate the balloon's x offset
					offsetX = -(balloonWidth / 2);
				}
				// If the first part was 'right'
				else if (parts[0] == 'right') {
					// Calculate the balloon's x offset
					offsetX = -balloonWidth - marginRight;
				}
				// If the second part was 'center'
				if (parts[1] == 'center') {
					// Calculate the balloon's y offset
					offsetY = -(balloonHeight / 2);
				}
				// If the second part was 'right'
				else if (parts[1] == 'bottom') {
					// Calculate the balloon's y offset
					offsetY = -balloonHeight - marginBottom;
				}
				// Calculate the balloon's coordinates
				var balloonLeft = anchorX + offsetX;
				var balloonTop = anchorY + offsetY;
				// If the balloon shoud stay inside the document
				if (settings.stayInDocument) {
					// Set shortcuts
					var $document = $(document);
					var documentDistance = settings.documentDistance;
					// Set document's coordinates
					var documentLeft = 0;
					var documentRight = $document.width();
					var documentTop = 0;
					var documentBottom = $document.height();
					// If the balloon is over the distance to the right border
					if (balloonLeft + marginLeft + balloonWidth > documentRight - documentDistance) {
						// Move into the document
						balloonLeft = documentRight - marginLeft - balloonWidth - documentDistance;
					}
					// If the balloon is over the distance to the left border
					if (balloonLeft < documentLeft + documentDistance) {
						// Move into the document
						balloonLeft = documentLeft + documentDistance;
					}
					// If the balloon is over the distance to the bottom border
					if (balloonTop + marginTop + balloonHeight > documentBottom - documentDistance) {
						// Move into the document
						balloonTop = documentBottom - marginTop - balloonHeight - documentDistance;
					}
					// If the balloon is over the distance to the top border
					if (balloonTop < documentTop + documentDistance) {
						// Move into the document
						balloonTop = documentTop + documentDistance;
					}
				}
				/*
				// TODO: Poista nämä turhina
				// If the balloon shoud stay inside the viewport
				if (settings.stayInViewport) {
					// Set shortcuts
					var $window = $(window);
					var viewportDistance = settings.viewportDistance;
					// Set viewport's coordinates
					var viewportLeft = $window.scrollLeft();
					var viewportRight = viewportLeft + $window.width();
					var viewportTop = $window.scrollTop();
					var viewportBottom = viewportTop + $window.height();
					// If the balloon is over the distance to the right border
					if (balloonLeft + marginLeft + balloonWidth > viewportRight - viewportDistance) {
						// Move into the viewport
						balloonLeft = viewportRight - marginLeft - balloonWidth - viewportDistance;
					}
					// If the balloon is over the distance to the left border
					if (balloonLeft < viewportLeft + viewportDistance) {
						// Move into the viewport
						balloonLeft = viewportLeft + viewportDistance;
					}
					// If the balloon is over the distance to the bottom border
					if (balloonTop + marginTop + balloonHeight > viewportBottom - viewportDistance) {
						// Move into the viewport
						balloonTop = viewportBottom - marginTop - balloonHeight - viewportDistance;
					}
					// If the balloon is over the distance to the top border
					if (balloonTop < viewportTop + viewportDistance) {
						// Move into the viewport
						balloonTop = viewportTop + viewportDistance;
					}
				}
				*/
				// Calculate the balloon's location
				var left = balloonLeft - containerLeft - marginLeft;
				var top = balloonTop - containerTop - marginTop;
				// Set the balloon's left and top styles
				$elements['balloon'].css({'left': left, 'top': top});
			}
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
			var alignment = settings.alignment;
			// Print debugging information
			this._log('The target element is:', this._targetElement);
			this._log('The settings are:', settings);
			this._log('The effects are:', effects);
			// Set the target jQuery element
			$elements['target'] = $(this._targetElement);
			// Set the window jQuery element
			$elements['window'] = $(window);
			// Set the visible status
			status.visible = settings.startVisible;
			// Fetch the elements
			this._fetchElements();
			// Fetch the content
			this._fetchContent();
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
			// Go through the alignment settings
			for (var key in alignment) {
				// Split the alignment string
				var parts = alignment[key].split(' ');
				// Combine and add the alignment class name to the element
				$elements[key].addClass('align-' + parts[0] + '-' + parts[1]);
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
						context = $elements[(key == 'balloon' ? 'target' : 'balloon')];
					}
					// Set the balloon jQuery element (search from the context)
					$elements[key] = $(selector, $(context));
				}
			}
			// Check if the elements are attached into DOM
			var balloonAttached = !!$elements['balloon'].closest('html').length;
			var contentAttached = !!$elements['content'].closest('html').length;
			// If both are not attached
			if (!balloonAttached && !contentAttached) {
				// Attach the element into DOM
				$('body').append($elements['balloon']);
			}
			// Else if the balloon is not attached
			else if (!balloonAttached) {
				$elements['content'].after($elements['balloon']);
			}
			// Else if the content is not attached
			else if (!contentAttached) {
				$elements['balloon'].wrapInner($elements['content']);
			}
			// Check if the content is inside the balloon
			var contentInsideBalloon = !!$elements['content'].closest($elements['balloon']).length;
			// If not inside
			if (!contentInsideBalloon) {
				// Detach the content
				$elements['content'].detach();
				// Put the content inside the balloon
				$elements['balloon'].wrapInner($elements['content']);
			}
		}, 
		
		// Fetches the balloon content
		_fetchContent: function () {
			// Print debugging information
			this._log('Fetching the content');
			// Set shortcuts
			var settings = this.settings;
			var sources = settings.sources;
			var $elements = this.$elements;
			var content;
			// Switch for values element, attribute, html, url
			switch (settings.sourceType) {
				// Case element source type
				case 'element':
					// Set shortcuts
					var selector = sources.element.selector;
					var context = sources.element.context;
					// If a selector is given
					if (selector) {
						// If no context is given, use the default context
						context = context ? context : $elements['target'];
						// Set content (search from the context)
						content = $(selector, $(context));
					}
					// If the element should be cloned
					if (sources.element.clone) {
						// Clone the element
						content = content.clone(true);
					}
					// Else the element should be detached
					else {
						// Detach the element
						content = content.detach();
					}
				break;
				// Case attribute source type
				case 'attribute':
					// Set the source element
					var $source = $elements[sources.attribute.element];
					// Fetch the attribute value by element key and attribute name
					content = $source.attr(sources.attribute.name);
					// If set to remove the attribute, remove it
					sources.attribute.remove && $source.removeAttr(sources.attribute.name);
				break;
				// Case HTML source type
				case 'html':
					// Set the html content
					content = sources.html;
				break;
				case 'url':
					// TODO: Implement the url content fetching code
					content = sources.url;
				break;
			}
			// If there is content
			if (content) {
				// Put the content into the content element
				$elements['content'].append(content);
			}
		}, 
		
		// Executes the show action (optional string phase)
		_show: function (phase) {
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// If the balloon is already visible
					if (this.status.visible) {
						// Cancel the action
						return false;
					}
				break;
				// Phase is 'start'
				case 'start':
					// Set the visible status to visible
					this.status.visible = true;
					// Relocate the balloon
					this.relocate();
				break;
				// Phase is 'middle'
				case 'middle':
				break;
				// Phase is 'end'
				case 'end':
				break;
			}
			return true;
		}, 
		
		// Executes the hide action (optional string phase)
		_hide: function (phase) {
			// Switch for phase
			switch (phase) {
				// Phase is 'validate'
				case 'validate':
					// If the balloon is already hidden
					if (!this.status.visible) {
						// Cancel the action
						return false;
					}
				break;
				// Phase is 'start'
				case 'start':
				break;
				// Phase is 'middle'
				case 'middle':
				break;
				// Phase is 'end'
				case 'end':
					// Set the visible status to hidden
					this.status.visible = false;
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