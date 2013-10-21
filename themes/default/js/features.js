/* Feature-specific jQuery code (sub theme: overwrite or keep the file) */

// This file is not in use, but kept as a storage for code snippets until they are moved into separate scripts

// Protection
;(function ($, window, document, undefined) {
	
	// Print debug information
	$.log('Script', 'Protosite theme / features.js');

	// Execute on page load
	$(document).ready(function () {
		
		// Enable grid row fix on any .view-grid element
		$('.view-grid .view-content, .view-grid .view-attachment').gridRowFix({refresh: true});
		
		// Enable grid row fix on any .grid element
		//$('.carousel .view-content').carousel();
	
		/* Dropdown menus: Create menus */
		createDropdownMenus('.main-menu .menu'); /* Todo: move first selector into file site.js */
	
		/* Switchable content triggers: Create switchable content triggers */
		createSwitchableContentTriggers();
		
		/* Switchable tabs: Create tabs */
		createSwitchableTabs();
	
		/* Switchable accordion: Create accordions */
		createSwitchableAccordions();
		
		/* Popup speech balloons: Create balloons */
		createPopupSpeechBalloons();
	
		/* Products: Removes any non-existing product filters from the url based on product category  */
		// Unbind default protosite click function
		// $('.product-categories-menu .menu a').unbind('click');
		// Add click event handler for product category links
		/* Products: Add category  */
		$('.product-categories-menu .menu a').click(function (e) {
		   	var categoryId = this.href.split('/');
			categoryId = categoryId[categoryId.length - 1];
			console.log(categoryId);
			$('#edit-field-product-category-tid-i18n').val(categoryId);
			e.preventDefault();
			$('#edit-submit-products').click();
		});
	
		/* Zoom: Create zoomable images */
		createZoomableImages();
		
		/* Carousel: Change carousel pause icon into play icon after clicking */
		$('.views-slideshow-controls-text-pause').click(function () {
			$(this).toggleClass('active');
		});
		
	});

	/* Add zoom functionality to content images based on a class name
		Usage:
		- selector: jQuery object or jQuery selector string
	*/
	function createZoomableImages(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.field-name-body img.zoom, .zoom img';
		}
		// Gather the images
		$(selector).each(function (i) {
			var src = $(this).attr('src');
			src = src.replace(/styles\/[^\/]*\/public/, 'styles/cols-12/public');
			$(this).wrap('<a class="image-zoom" href="' + src + '"></a>');
		});
	}

	/* Creates dropdown menus (Rapala version)
	
		Usage:
		- selector: jQuery object or jQuery selector string
	*/
	function createDropdownMenus(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.menu-bar-dropdown, .menu-column-dropdown';
		}
		// Gather the menu items
		$(selector).find('li').each(function () {
			// Add mouse enter functionality
			$(this).mouseenter(function () {
				// Put this dropdown over earlier dropdowns
				$(this).children('ul').css('z-index', '500');
				// Stop fading animation (if any) and show this dropdown
				$(this).find('ul').stop(true, true).hide();
				$(this).children('ul').fadeIn(250);
			});
			// Add mouse leave functionality
			$(this).mouseleave(function () {
				// Put this dropdown under latest dropdown
				$(this).children('ul').css('z-index', '250');
				// Animate fade out
				$(this).children('ul').fadeOut(250).find('ul').stop(true, true).hide();
			});
		});
	}

	/* Creates dropdown menus 
	
		Usage:
		- selector: jQuery object or jQuery selector string
	*/
	function createDropdownMenus(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.menu-bar-dropdown, .menu-column-dropdown';
		}
		// Gather the menu items
		$(selector).find('li').each(function () {
			// Add mouse enter functionality
			$(this).mouseenter(function () {
				// Put this dropdown over earlier dropdowns
				$(this).children('ul').css('z-index', '500');
				// Stop fading animation (if any) and show this dropdown
				$(this).find('ul').stop(true, true).hide();
				$(this).children('ul').stop(true, true).slideDown(250);
			});
			// Add mouse leave functionality
			$(this).mouseleave(function () {
				// Put this dropdown under latest dropdown
				$(this).children('ul').css('z-index', '250');
				// Animate fade out
				$(this).children('ul').stop(true, true).slideUp(250).find('ul').stop(true, true).hide();
			});
		});
	}
	
	/* Creates switchable content triggers

	Usage:
	- selector: jQuery object or jQuery selector string
	*/
	function createSwitchableContentTriggers(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.switchable-content-triggers a[href^="#"]';
		}
		// Get the current hash from the url
		var urlHash = '';
		if (typeof window.location.hash != 'undefined' && window.location.hash.length > 0) {
			if (window.location.hash != '' && window.location.hash != '#') {
				urlHash = window.location.hash;
			}
		}
		// Gather the trigger links
		$(selector).each(function () {
			// Add click functionality
			$(this).click(function (e) {
				if (this.hash != '' && this.hash != '#' && this.hash == $(this).attr('href')) {
					var currentHash = this.hash;
					// Hide other content
					$(selector).each(function () {
						if (this.hash != currentHash) {
							$(this).parent().removeClass('active');
							$(this.hash).removeClass('active').hide();
						}
					});
					// Show selected content
					$(this).parent().addClass('active');
					$(currentHash).addClass('active').show();
					e.preventDefault();
				}
			});
		});
		// Display the active content item on page load, if it's referenced in the url
		if (urlHash != '') {
			$(selector).filter('a[href="' + urlHash + '"]').click();
		}
		// Else display the first content item
		else {
			$(selector).eq(0).click();
		}
	}

	/* Creates switchable tabs
	
		Usage:
		- selector: jQuery object or jQuery selector string
	*/
	function createSwitchableTabs(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.tabs-switchable';
		}
		// Get the current hash from the url
		var urlHash = '';
		if (typeof window.location.hash != 'undefined' && window.location.hash.length > 0) {
			if (window.location.hash != '' && window.location.hash != '#') {
				urlHash = window.location.hash;
			}
		}
		// Gather the tabs
		$(selector).find('a').each(function () {
			// Add click functionality
			$(this).click(function (e) {
				if (this.hash != '' && this.hash != '#' && this.hash == $(this).attr('href')) {
					var currentHash = this.hash;
					$(this).parent().parent().find('a').each(function () {
						if (this.hash != currentHash) {
							$(this).parent().removeClass('active');
							$(this.hash).removeClass('active');
						}
					});
					$(this).parent().addClass('active');
					$(currentHash).addClass('active');
					e.preventDefault();
				}
			});
			// Display the active tab on page load, if it's referenced in the url
			if (this.hash != '' && this.hash == urlHash) {
				$(this).click();
			}
		});
	}

	/* Creates switchable accordions

		Usage:
		- selector: jQuery object or jQuery selector string
	*/
	function createSwitchableAccordions(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selector
			selector = '.accordion-switchable';
		}
		// Get the current hash from the url
		var urlHash = '';
		if (typeof window.location.hash != 'undefined' && window.location.hash.length > 0) {
			if (window.location.hash != '' && window.location.hash != '#') {
				urlHash = window.location.hash;
			}
		}
		// Gather the accordion titles
		$(selector).find('.accordion-title a').each(function () {
			// Add click functionality
			$(this).click(function (e) {
				if (this.hash != '' && this.hash != '#' && this.hash == $(this).attr('href')) {
					var currentHash = this.hash;
					$(this).parent().parent().find('a').each(function () {
						if (this.hash != currentHash) {
							$(this).parent().removeClass('active');
							$(this.hash).removeClass('active');
						}
					});
					$(this).parent().addClass('active');
					$(currentHash).addClass('active');
					e.preventDefault();
				}
			});
			// Display the active accordion on page load, if it's referenced in the url
			if (this.hash != '' && this.hash == urlHash) {
				$(this).click();
			}
		});
	}

	/* Creates popup speech balloons

		Usage:
		- selector: jQuery object or jQuery selector string
	 */
	function createPopupSpeechBalloons(selector) {
		// If no selector given
		if (selector == null) {
			// Use default selectors
			selector = '.speech-balloon-popup';
		}
		// Set speech balloon selector
		var speechBalloonSelector = '.speech-balloon, .speech-balloon-top, .speech-balloon-right, .speech-balloon-bottom, .speech-balloon-left';
		// Gather the balloon targets
		$(selector).each(function () {
			// Add mouse enter functionality
			$(this).mouseenter(function (e) {
				var speechBalloons = $(this).find(speechBalloonSelector);
				speechBalloons.stop(true, true).fadeIn(250);
			});
			// Add mouse leave functionality
			$(this).mouseleave(function (e) {
				var speechBalloons = $(this).find(speechBalloonSelector);
				speechBalloons.stop(true, true).fadeOut(250);
			});
		});
	}
	
})(jQuery, window, document);