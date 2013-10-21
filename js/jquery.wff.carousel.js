/*!

Carousel jQuery plugin
Version: 0.7 (2013-03-01 14:15)
Package: Konsepto Web Frontend Framework
Author: Mikko Paltamaa / Konsepto
Website: http://konsepto.fi
License: All rights reserved

Description:

This plugin can be used to create a carousel from existing DOM 
elements of certain structure. Apply it to the target elements that 
form the carousel content.


Usage: 

$(...).createPlugin('carousel', [object settings], [object effects], [boolean debug]);

Returns: object jQuery


Examples: 

// Create the plugins using the default settings and effects
$('.carousel-target').createPlugin('carousel');

// Get the plugins
var plugins = $('.carousel-target').carousel();

// Go through the plugins
for (var i = 0; i < plugins.length; i++) {

	// Change to the next slide
	plugins[i].next();
	
}

...

 
*/

// TODO: Triggeröi tapahtumat, kuten
		// Event change.carousel
		// Event pause.carousel
		// Event resume.carousel
		// Event next.carousel
		// Event previous.carousel
		// Event loop.carousel
// TODO: Dokumentaatio pitää laittaa kuntoon
// TODO: Muuta rakennetta siten, että asetuksia voi muuttaa lennossa
// TODO: Toimenpiteet voisi tehdä ajastetusti: http://stackoverflow.com/questions/599288/cross-browser-window-resize-event-javascript-jquery
// TODO: Toteuta rewind/loop-toiminto
// TODO: Muuta koodi sellaiseksi, että sisältöä voidaan muuttaa dynaamisesti
// TODO: Muuta koodi sellaiseksi, että karusellin korkeus säätyy tarvittaessa dynaamisesti
// TODO: Lisää luokat autoplay, playing, paused, ready, busy jne.
// TODO: Lisää touch support
// TODO: Toteuta pager
// TODO: Toteuta bindeille router metodi, optimoi prevent-käskyt
 
// Add a protective wrapper
;(function ($, window, document, undefined) {

	// The default settings for the plugin
	var defaultSettings = {
		
		// Element selectors (selector string, DOM object or jQuery element)
		selectors: {
			'viewport': '.carousel-viewport', 
			'slides': '.carousel-slides', 
			'slide': '.carousel-slide', 
			'next-button': '.carousel-next-button', 
			'previous-button': '.carousel-previous-button', 
			'first-button': '.carousel-first-button', 
			'last-button': '.carousel-last-button', 
			'pager': '.carousel-pager', 
			'page': '.carousel-page', 
			'play-button': '.carousel-play-button', 
			'pause-button': '.carousel-pause-button', 
			'stop-button': '.carousel-stop-button'
		}, 
		
		// Context where the elements should be searched (selector string, DOM object or jQuery element; if empty, the default context is used)
		contexts: {
			'viewport': 'body', 
			'slides': 'body', 
			'slide': 'body', 
			'next': 'body', 
			'previous': 'body', 
			'first': 'body', 
			'last': 'body', 
			'pager': 'body', 
			'page': 'body', 
			'play': 'body', 
			'pause': 'body', 
			'stop': 'body'
		}, 
		
		// The index of the slide that is visible on startup
		startIndex: 0, 
		
		// The carousel plays on startup
		startPlaying: false, 
		
		// Content source type (none, element, html or url)
		sourceType: 'none', 
		
		// Content sources
		sources: {
			// Element source
			element: {
				// Element selector (selector string, DOM object or jQuery element)
				selector: '.carousel-source', 
				// Context where the elements should be searched (selector string, DOM object or jQuery element; if empty, the default context is used)
				context: 'body', 
				// If the content element should be cloned insted of detached from its current location
				clone: false
			}, 
			// HTML source (HTML string)
			html: '', 
			// URL source (URL string)
			url: ''
		}, 
		
		// Looping (none, forward, backward)
		looping: 'forward', 
		
		// TODO: ...
		playing: {
			// Time a slide is displayed before changing to the next slide
			displayTime: 5000, 
			// Should hovering on the carousel area pause playing
			hoverPause: true
		}, 
		
		// Pager type (none, bullets, numbers, titles, thumbnails)
		pagerType: 'bullets', 
		
		// TODO: Remove?
		// Pager settings
		pager: {
			// How slide changing should happen (change, rewind)
			changeAction: 'change'
		}, 
		
		// TODO: ???
		controls: {
			keyboard: true, // Enable keyboard control
			keys: {next: 39, previous: 37}, 
			mouseClick: true, 
			mouseDrag: true, 
			mouseWheel: true, 
			touchDrag: true, 
		}, 
		
		// TODO: ???
		// Delays before executing actions (ms)
		delays: {
			'next': 667, 
			'previous': 667, 
			'first': 667, 
			'last': 667, 
			'change': 667, 
			'scroll': 667, 
			'play': 667, 
			'pause': 667, 
			'stop': 667
		}, 
		
		// TODO: ???
		// Effects used in actions (one of the default effect names or a custom function)
		effects: {
			'next': 'fade', 
			'previous': 'fade', 
			'first': 'fade', 
			'last': 'fade', 
			'change': 'fade', 
			'scroll': 'fade', 
			'play': 'instant', 
			'pause': 'instant', 
			'stop': 'instant'
		}, 
		
		// Animation method (either jQuery's 'animate' or a custom animation method name, like jQuery Transit's 'transition')
		animationMethod: ($.transit && $.support.transition ? 'transition' : 'animate'), // If available, use jQuery Transit plugin's method
		
		// Class names that will be added to the plugin elements
		classNames: {
			'target': 'carousel-target', 
			'viewport': 'carousel-viewport', 
			'slides': 'carousel-slides', 
			'slide': 'carousel-slide', 
			'next-button': 'carousel-next-button', 
			'previous-button': 'carousel-previous-button', 
			'first-button': 'carousel-first-button', 
			'last-button': 'carousel-last-button', 
			'pager': 'carousel-pager', 
			'page': 'carousel-page', 
			'play-button': 'carousel-play-button', 
			'pause-button': 'carousel-pause-button', 
			'stop-button': 'carousel-stop-button'
		}, 
		
		// Element CSS styles (css style objects)
		styles: {
			'target': {
				'position': 'relative'
			}, 
			'viewport': {
				'position': 'relative', 
				'overflow': 'hidden'
			}, 
			'slides': {
				'list-style': 'none', 
				'padding': '0px', 
				'position': 'absolute', 
				'margin': '0%', 
				'width': '100%', 
				'height': '100%'
			}, 
			'slide': {
				'margin': '0%', 
				'padding': '0%', 
				'position': 'absolute'
			}, 
			'next-button': {}, 
			'previous-button': {}, 
			'first-button': {}, 
			'last-button': {}, 
			'pager': {}, 
			'page': {}, 
			'play-button': {}, 
			'pause-button': {}, 
			'stop-button': {}
		}, 
		
		// TODO: ?
		// Binded events (event names; optionally with namespaces)
		bindEvents: {
			'next': {
				'next-button': 'click'
			}, 
			'previous': {
				'previous-button': 'click'
			}, 
			'first': {
				'first-button': 'click'
			}, 
			'last': {
				'last-button': 'click'
			}, 
			'play': {
				'play-button': 'click'
			}, 
			'pause': {
				'pause-button': 'click'
			}, 
			'stop': {
				'stop-button': 'click'
			}
		}, 
		
		// Binded code
		bindCode: {
			'next': function (event) {
				// Print debugging information
				this._log('The binded next action triggered');
				// Show the next slide
				this.next();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'previous': function (event) {
				// Print debugging information
				this._log('The binded previous action triggered');
				// Show the previous slide
				this.previous();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'first': function (event) {
				// Print debugging information
				this._log('The binded first action triggered');
				// Show the first slide
				this.first();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'last': function (event) {
				// Print debugging information
				this._log('The binded last action triggered');
				// Show the last slide
				this.last();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'play': function (event) {
				// Print debugging information
				this._log('The binded play action triggered');
				// Start playing
				this.play();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'pause': function (event) {
				// Print debugging information
				this._log('The binded pause action triggered');
				// Pause playing
				this.pause();
				// Cancel the default action and stop bubbling
				return false;
			}, 
			'stop': function (event) {
				// Print debugging information
				this._log('The binded stop action triggered');
				// Stop playing
				this.stop();
				// Cancel the default action and stop bubbling
				return false;
			}
		}, 
		
		// TODO: Tähän jäin
		// Triggered events (event names; optionally with namespaces)
		triggers: {
			'nextStart': {
				'carousel': 'nextstart.carousel'
			}, 
			'nextEnd': {
				'carousel': 'nextend.carousel'
			}, 
			'firstStart': {
				'carousel': 'previousstart.carousel'
			}, 
			'firstEnd': {
				'carousel': 'previousend.carousel'
			}, 
		}, 
		
		// Callback functions (custom functions)
		callbacks: {
			'next': function () {}, 
			'previous': function () {}, 
			'first': function () {}, 
			'last': function () {}, 
			'change': function () {}, 
			'scroll': function () {}, 
			'play': function () {}, 
			'pause': function () {}, 
			'stop': function () {}
		}
		
	}, 

	// The default effects for the plugin actions
	var defaultEffects = {
	
		// Effects for the 'change' action
		'change': {
			'instant': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default instant effect');
				switch (phase) {
					case 'start':
						/*
						$elements['balloon'].removeClass('hidden').addClass('visible');
						$elements['balloon'].css({'visibility': 'visible', 'opacity': '1'});
						return $elements['balloon'].promise();
						*/
					break;
					case 'end':
						/*
						return $elements['balloon'].promise();
						*/
					break;
				}
			}, 
			'fade': function (phase, $elements, method, duration) {
				// Print debugging information
				this._log('Executing the default fade effect');
				switch (phase) {
					case 'start':
						/*
						$elements['balloon'].removeClass('hidden').addClass('visible');
						$elements['balloon'].css({'visibility': 'visible', 'opacity': '0'});
						$elements['balloon'][method]({'opacity': '1'}, duration, (method == 'transition' ? 'ease-in-out' : 'swing'));
						return $elements['balloon'].promise();
						*/
					break;
					case 'end':
						/*
						return $elements['balloon'].promise();
						*/
					break;
				}
			}, 
			'scroll-left': function (phase, $elements, method, duration) {
			}, 
			'scroll-right': function (phase, $elements, method, duration) {
			}, 
			'scroll-up': function (phase, $elements, method, duration) {
			}, 
			'scroll-down': function (phase, $elements, method, duration) {
			}, 
			'stack-left': function (phase, $elements, method, duration) {
			}, 
			'stack-right': function (phase, $elements, method, duration) {
			}, 
			'stack-up': function (phase, $elements, method, duration) {
			}, 
			'stack-down': function (phase, $elements, method, duration) {
			}
		}
		
		/*
		effects: {
			'instant': {
				steps: [
					{
						next: [{'display': 'block', 'z-index': '1'}], 
						previous: [{'display': 'none', 'z-index': '0'}]
					}
				]
			}, 
			'fade': {
				steps: [
					{
						next: [{'opacity': '0', 'z-index': '1', 'display': 'block'}, {'opacity': '1'}, 667, ($.transit && $.support.transition ? 'ease-in-out' : 'swing')], 
						previous: [{'z-index': '0'}]
					}, 
					{
						previous: [{'display': 'none'}]
					}
				]
			}, 
			'scroll-left': {
				steps: [
					{
						next: [{'left': '0%', 'display': 'block'}], 
						previous: [{'left': '-100%'}], 
						container: [{'left': '100%'}, {'left': '0%'}, 667, ($.transit && $.support.transition ? 'ease-in-out' : 'swing')]
					}, 
					{
						previous: [{'left': '0%', 'display': 'none'}]
					}
				]
			}, 
			'scroll-right': {
				steps: [
					{
						next: [{'left': '0%', 'display': 'block'}], 
						previous: [{'left': '100%'}], 
						container: [{'left': '-100%'}, {'left': '0%'}, 667, ($.transit && $.support.transition ? 'ease-in-out' : 'swing')]
					}, 
					{
						previous: [{'left': '0%', 'display': 'none'}]
					}
				]
			}, 
			'scroll-up': {
				steps: [
					{
						next: [{'top': '0%', 'display': 'block'}], 
						previous: [{'top': '-100%'}], 
						container: [{'top': '100%'}, {'top': '0%'}, 667, ($.transit && $.support.transition ? 'ease-in-out' : 'swing')]
					}, 
					{
						previous: [{'top': '0%', 'display': 'none'}]
					}
				]
			}, 
			'scroll-down': {
				steps: [
					{
						next: [{'top': '0%', 'display': 'block'}], 
						previous: [{'top': '100%'}], 
						container: [{'top': '-100%'}, {'top': '0%'}, 667, ($.transit && $.support.transition ? 'ease-in-out' : 'swing')]
					}, 
					{
						previous: [{'top': '0%', 'display': 'none'}]
					}
				]
			}, 
			'stack-left': {
				steps: [
					{
						next: [{'left': '100%', 'z-index': '1', 'display': 'block'}, {'left': '0%'}, 667, ($.transit && $.support.transition ? 'ease-out' : 'swing')], 
						previous: [{'z-index': '0'}]
					}, 
					{
						previous: [{'display': 'none'}]
					}
				]
			}, 
			'stack-right': {
				steps: [
					{
						next: [{'left': '-100%', 'z-index': '1', 'display': 'block'}, {'left': '0%'}, 667, ($.transit && $.support.transition ? 'ease-out' : 'swing')], 
						previous: [{'z-index': '0'}]
					}, 
					{
						previous: [{'display': 'none'}]
					}
				]
			}, 
			'stack-up': {
				steps: [
					{
						next: [{'top': '100%', 'z-index': '1', 'display': 'block'}, {'top': '0%'}, 667, ($.transit && $.support.transition ? 'ease-out' : 'swing')], 
						previous: [{'z-index': '0'}]
					}, 
					{
						previous: [{'display': 'none'}]
					}
				]
			}, 
			'stack-down': {
				steps: [
					{
						next: [{'top': '-100%', 'z-index': '1', 'display': 'block'}, {'top': '0%'}, 667, ($.transit && $.support.transition ? 'ease-out' : 'swing')], 
						previous: [{'z-index': '0'}]
					}, 
					{
						previous: [{'display': 'none'}]
					}
				]
			}
		}, 
		*/
		
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
			// Index
			index: 0, 
			// Playing
			playing: false, 
			// Paused
			paused: false
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
		name: 'WFF Carousel', 
		
		// Plugin's jQuery function name
		functionName: 'carousel', 
		
		// Standalone (instances are not tied to a certain element)
		standalone: false, 
		
		// Singleton (only single instance allowed per element, or globally if a standalone plugin)
		singleton: true, 
		
		// Default settings
		defaultSettings: defaultSettings, 
		
		// Default effects
		defaultEffects: defaultEffects, 
		
		// Returns the index of the current slide
		getIndex: function () {
			// Return the index of the current slide
			return this.status.index;
		}, 
		
		/*
		// Creates plugin
		_create: function () {
			// If debug mode, start performance test timer
			var startTime = this.debug ? new Date().getTime() : undefined;
			// Set settings, merge defaults and given settings
			var settings = this.settings = $.extend(true, {}, this.defaults, this.settings);
			// Add class to element
			this.$element.addClass(settings.className);
			// Apply CSS changes
			var styles = settings.styles;
			this.$element.css(styles.carousel);
			this.$viewport.css(styles.viewport);
			this.$slides.css(styles.slides);
			this.$slide.css(styles.slide);
			// TODO: ...
			var maxHeight = 0;
			this.$slide.each(function () {
				var height = $(this).outerHeight();
				maxHeight = Math.max(height, maxHeight);
			});
			this.$viewport.height(maxHeight);
			// Log debugging information
			this.debug && $.log(this.name, 'maximum slide height is', maxHeight);
			// TODO: ...
			this._bind();
			// TODO: ...
			this.reset(this._index);
			this.free();
			// Log debugging information + performance test timer value
			this.debug && $.log(this.name, 'created in ' + (new Date().getTime() - startTime) + ' ms');
		}, 
		*/
		
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
		
		/*
		
		// Resets carousel to the index defined in settings (instant change)
		reset: function (event, index) {
			// If triggered custom event allows to proceed
			if (this._trigger('reset', event)) {
				if (this.reserve()) {
					index = (index === undefined || index >= 0 || index < this.size() ? 0 : index);
					this._index = index;
					this.$slide.eq(index).css({'display': 'block', 'z-index': '1'});
					this.$slide.not(this.$slide.eq(index)).css({'display': 'none', 'z-index': '0'});
					this.free();
					this.debug && $.log(this.name, 'reset to', index);
					return true;
				}
				return false;
			}
		}, 
		
		// Changes slide
		change: function (event, index, backward) {
			// If triggered custom event allows to proceed
			if (this._trigger('change', event, [this, index, this._index, backward])) {
				if (index !== undefined && index != this._index && this.size() > 1) {
					if (this.reserve()) {
						var effect = this.settings.effects[(backward ? this.settings.backwardEffect : this.settings.forwardEffect)];
						this._animate(event, index, this._index, backward, effect);
						this._index = index;
						this.debug && $.log(this.name, 'changed to', index);
					}
				}
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Displays next slide
		next: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('next', event, [this])) {
				// Change slide
				this.change(event, (this._index + 1 >= this.size() ? 0 : this._index + 1), false);
				// Log debugging information + performance test timer value
				this.debug && $.log(this.name, 'changed to next');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Displays previous slide
		previous: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('previous', event, [this])) {
				// Change slide
				this.change(event, (this._index - 1 < 0 ? this.size() - 1 : this._index - 1), true);
				// Log debugging information + performance test timer value
				this.debug && $.log(this.name, 'changed to previous');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Displays first slide
		first: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('first', event, [this])) {
				// Change slide
				this.change(event, 0, true);
				// Log debugging information + performance test timer value
				this.debug && $.log(this.name, 'changed to first');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Displays last slide
		last: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('last', event, [this])) {
				// Change slide
				this.change(event, this.size() - 1, false);
				// Log debugging information + performance test timer value
				this.debug && $.log(this.name, 'changed to last');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Plays carousel
		play: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('play', event, [this])) {
				this.settings.play = true;
				this.autoplayOn();
				this.debug && $.log(this.name, 'playing');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Pauses carousel
		pause: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('pause', event, [this])) {
				this.settings.play = false;
				this.autoplayOff();
				this.debug && $.log(this.name, 'paused');
			}
			// Prevent original default action
			event.preventDefault();
		}, 
		
		// Stops carousel
		stop: function (event) {
			// If triggered custom event allows to proceed
			if (this._trigger('stop', event, [this])) {
				this.settings.play = false;
				this.autoplayOff();
				this.reset(event);
				this.debug && $.log(this.name, 'stopped');
			}
			// Prevent original default action
			event.preventDefault();
		}, 

		// Returns slide count
		size: function () {
			return this.$slide.length;
		}, 
		
		// Returns carousel status (true if ready, false if not ready)
		// TODO: Is this needed?
		ready: function () {
			return !this._busy;
		}, 
		
		// Reserves carousel (prevents conflicting actions)
		reserve: function () {
			if (!this._busy) {
				this.autoplayOff();
				this._busy = true;
				return true;
			}
			return false;
		}, 
		
		// Frees carousel (prevents conflicting actions)
		free: function () {
			this._busy = false;
			this.autoplayOn();
		}, 
		
		// ...
		autoplayOn: function () {
			if (!this.busy && !this._timeout && this.settings.play) {
				this._timer();
				this.debug && $.log(this.name, 'timer started');
			}
		}, 
		
		// ...
		autoplayOff: function () {
			if (this._timeout) {
				clearTimeout(this._timeout);
				this._timeout = undefined;
				this.debug && $.log(this.name, 'timer stopped');
			}
		}, 
		*/
		
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
						// Switch for key
						switch (key) {
							// Key is 'slides'
							case 'slides':
								// Set context to default context
								context = $elements['viewport'];
							break;
							// Key is 'slide'
							case 'slide':
								// Set context to default context
								context = $elements['slides'];
							break;
							// Key is 'page'
							case 'page':
								// Set context to default context
								context = $elements['pager'];
							break;
							// Otherwise
							case default:
								// Set context to default context
								context = $elements['target'];
							break;
						}
					}
					// Set the balloon jQuery element (search from the context)
					$elements[key] = $(selector, $(context));
				}
			}
			// Go through the selectors
			for (key in selectors) {
				// Check if the element is attached into DOM
				if (!!$elements[key].closest('html').length) {
					// Switch for key
					switch (key) {
						// Key is 'slides'
						case 'slides':
							// Attach the element in DOM
							$elements['viewport'].append($elements['slides']);
						break;
						// Key is 'slide'
						case 'slide':
							// Attach the element in DOM
							$elements['slides'].append($elements['slide']);
						break;
						// Key is 'page'
						case 'page':
							// Attach the element in DOM
							$elements['pager'].append($elements['page']);
						break;
						// Otherwise
						case default:
							// Attach the element in DOM
							$elements['target'].append($elements[key]);
						break;
					}
				}
			}
			// TODO: Tähän jäin!!! Tee sama kuin yläpuolella, testaa slide, slides ja viewport(?)
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
		
		
		/*
		// Animates slide changes
		_animate: function (event, nextIndex, previousIndex, backward, effect, stepIndex) {
			// If debug mode, start performance test timer
			var startTime = this.debug ? new Date().getTime() : undefined;
			// TODO: Add comments
			stepIndex = (stepIndex ? stepIndex : 0);
			var method = this.settings.animationMethod;
			var $next = this.$slide.eq(nextIndex);
			var $previous = this.$slide.eq(previousIndex);
			var $container = this.$slides;
			var $all = $().add($container).add($next).add($previous);
			// ...
			if (effect.steps[stepIndex]) {
				var step = effect.steps[stepIndex];
				if (step.next) {
					$next.css(step.next[0]);
					step.next.length > 1 && $next[method](step.next[1], step.next[2], step.next[3]);
				}
				if (step.previous) {
					$previous.css(step.previous[0]);
					step.previous.length > 1 && $previous[method](step.previous[1], step.previous[2], step.previous[3]);
				}
				if (step.container) {
					$container.css(step.container[0]);
					step.container.length > 1 && $container[method](step.container[1], step.container[2], step.container[3]);
				}
				$all.promise().done($.proxy(function () {
					this._animate(event, nextIndex, previousIndex, backward, effect, stepIndex + 1);
				}, this));
			}
			else {
				this.free();
				// Log debugging information + performance test timer value
				this.debug && $.log(this.name, 'animated in ' + (new Date().getTime() - startTime) + ' ms');
				// Trigger custom event
				this._trigger('afterChange', event, [this, nextIndex, previousIndex, backward]);
				// Execute callback
				//callback && $.proxy(this.settings.callbacks.afterChange, this);
			}
		}, 
		
		// ...
		_timer: function () {
			var base = this;
			this._timeout = setTimeout(function () {
				base.next();
				base._timer();
				base.debug && $.log(base.name, 'timeout occured', base._timeout);
			}, this.settings.delay);
		}, 
		
		// ...
		_bind: function () {
			// TODO: ...
			var settings = this.settings;
			var controls = settings.controls;
			var bind = settings.bind;
			this.$next.bind(bind.next, $.proxy(this.next, this));
			this.$previous.bind(bind.previous, $.proxy(this.previous, this));
			this.$first.bind(bind.first, $.proxy(this.first, this));
			this.$last.bind(bind.last, $.proxy(this.last, this));
			this.$play.bind(bind.play, $.proxy(this.play, this));
			this.$pause.bind(bind.pause, $.proxy(this.pause, this));
			this.$stop.bind(bind.stop, $.proxy(this.stop, this));
			this.$reset.bind(bind.reset, $.proxy(this.reset, this));
			// TODO: Prevent automatic changes when focus is on carousel or any of its elements
			if (controls.hoverPause) {
				this.$slides.bind(bind.hoverPause, $.proxy(this.autoplayOff, this));
				this.$slides.bind(bind.hoverResume, $.proxy(this.autoplayOn, this));
			}
			// TODO: Display slides when hovering over pager items
			if (controls.hoverDisplay) {
				this.$slides.bind(bind.hoverDisplay, $.proxy(this.showSlide, this));
				this.$slides.bind(bind.hoverHide, $.proxy(this.hideSlide, this));
			}
			// TODO: ...
			if (controls.keyboard) {
				this.$element.attr('tabindex', '0');
				this.$element.bind('keydown', $.proxy(this._keyboard, this));
			}
			if (controls.mouseClick) {
				this.$viewport.bind('click', $.proxy(function (event) {
					if (event.which === 1) {
						this.next(event);
						event.preventDefault();
						//this.debug && $.log(this.name, 'mouse left click', event);
					}
				}, this));
			}
			if (controls.mouseDrag) {
				this.$viewport.bind('mousedown', $.proxy(function (event) {
					if (event.which === 1) {
						this.mousedownX = event.pageX;
						this.mousedownY = event.pageY;
						event.preventDefault();
						//this.debug && $.log(this.name, 'mouse down', event);
					}
				}, this));
				this.$viewport.bind('mousemove', $.proxy(function (event) {
					if (event.which === 1) {
						if (Math.abs(event.pageX - this.mousedownX) > Math.abs(event.pageY - this.mousedownY)) {
							if (event.clientX < this.mousedownX - 20) {
								this.mousedownX = event.pageX;
								this.mousedownY = event.pageY;
								this.next(event);
							}
							else if (event.clientX > this.mousedownX + 20) {
								this.mousedownX = event.pageX;
								this.mousedownY = event.pageY;
								this.previous(event);
							}
							event.preventDefault();
						}
						//this.debug && $.log(this.name, 'mouse move', event);
					}
				}, this));
			}
			if (controls.mouseWheel) {
				this.$viewport.bind('mousewheel', $.proxy(function (event) {
					if (event.originalEvent.wheelDeltaY < 0) {
						this.next(event);
					}
					else if (event.originalEvent.wheelDeltaY > 0) {
						this.previous(event);
					}
					event.preventDefault();
					//this.debug && $.log(this.name, 'mouse wheel', event);
				}, this));
			}
			if (controls.touchDrag) {
				this.$viewport.bind('touchstart', $.proxy(function (event) {
					this.touchstartX = event.originalEvent.touches[0].pageX;
					this.touchstartY = event.originalEvent.touches[0].pageY;
					//this.debug && $.log(this.name, 'touch start', event);
				}, this));
				this.$viewport.bind('touchmove', $.proxy(function (event) {
					if (Math.abs(event.originalEvent.touches[0].pageY - this.touchstartY) < 50) {
						if (event.originalEvent.touches[0].pageX < this.touchstartX - 50) {
							this.touchstartX = event.originalEvent.touches[0].pageX;
							this.touchstartY = event.originalEvent.touches[0].pageY;
							this.next(event);
							event.preventDefault();
						}
						else if (event.originalEvent.touches[0].pageX > this.touchstartX + 50) {
							this.touchstartX = event.originalEvent.touches[0].pageX;
							this.touchstartY = event.originalEvent.touches[0].pageY;
							this.previous(event);
							event.preventDefault();
						}
						//event.preventDefault();
					}
					//this.debug && $.log(this.name, 'touch move', event);
				}, this));
			}
		}, 
		
		// ...
		_trigger: function (name, originalEvent, data) {
			// Set callbacks
			var callbacks = $.Callbacks();
			// Add callback from settings
			callbacks.add(this.settings.callbacks[name]);
			this.debug && $.log(this.name, 'callbacks are', callbacks);
			// Trigger callbacks
			callbacks.fireWith(this.$element[0], data);
			// Set event name
			var eventName = name + '.' + this.functionName;
			// Create event
			var event = jQuery.Event(eventName);
			// Set original event
			event.originalEvent = originalEvent;
			this.debug && $.log(this.name, 'Triggering event', eventName, event);
			// Trigger event
			this.$element.trigger(event, data);
			this.debug && $.log(this.name, 'Triggered event', event);
			return (event && event.isDefaultPrevented() === true ? false : true);
		}, 
		
		// ...
		_keyboard: function (event) {
			if (event.srcElement == this.$element.get(0)) {
				var keys = this.settings.controls.keys;
				var key = event.keyCode || event.which;
				var modifier = event.altKey || event.ctrlKey || event.shiftKey;
				switch (key) {
					case keys.next:
						modifier ? this.last(event) : this.next(event);
						event.preventDefault();
						this.debug && $.log(this.name, 'key pressed', event);
					break;
					case keys.previous:
						modifier ? this.first(event) : this.previous(event);
						event.preventDefault();
						this.debug && $.log(this.name, 'key pressed', event);
					break;
				}
			}
		}, 
		
		// ...
		_mouseControl: function (event) {
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

	/*
	// Create the plugin constructor
	var PluginConstructor = function (element, settings) {
		// Set settings
		this.settings = $.extend(true, {}, this.defaults, settings);
		// Set element
		this.element = element;
		// Set jQuery object
		this.$element = $(element);
		// Set viewport
		this.$viewport = $('<div class="viewport"></div>');
		// Set slides
		this.$slides = $(this.settings.elements.slides, this.$element);
		// Set slide
		this.$slide = $(this.settings.elements.slide, this.$element);
		// Set next button
		this.$next = $(this.settings.elements.next, this.$element);
		// Set previous button
		this.$previous = $(this.settings.elements.previous, this.$element);
		// Set first button
		this.$first = $(this.settings.elements.first, this.$element);
		// Set last button
		this.$last = $(this.settings.elements.last, this.$element);
		// Set play button
		this.$play = $(this.settings.elements.play, this.$element);
		// Set pause button
		this.$pause = $(this.settings.elements.pause, this.$element);
		// Set stop button
		this.$stop = $(this.settings.elements.stop, this.$element);
		// Set reset button
		this.$reset = $(this.settings.elements.reset, this.$element);
		// TODO: ...
		this.$viewport.prepend(this.$slides.detach());
		this.$element.prepend(this.$viewport);
		// TODO: Add all controls
		this.$controls = $().add(this.$next, this.$previous, this.$first, this.$last, this.$play, this.$pause, this.$stop, this.$reset);
		this.$area = $().add(this.$element).add(this.$controls);
		// TODO: ...
		this._index = this.settings.index;
		this._busy = true;
		this._timeout = null;
	};
	*/
	
	// Set the plugin's prototype
	PluginConstructor.prototype = $.extend(true, {}, $.wffComponentPrototype, PluginPrototype);
	
	// Register the plugin
	$.wffRegisterPlugin(PluginConstructor);

// Execute the protective wrapper
})(jQuery, window, document);
