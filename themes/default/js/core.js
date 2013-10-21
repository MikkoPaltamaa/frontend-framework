/* Core Drupal jQuery code (keep the file) */

// Protection
;(function ($, window, document, undefined) {
	
	// Print debug information
	//$.log('Script', 'Protosite theme / core.js');
	
	// Execute when the document is ready
	$(document).ready(function () {

		/* Node: Hide editable node context menu on mouseleave event (fixes the missing functionality) */
		$('#region-content .tabs .contextual-links-wrapper').mouseleave(function () {
			var $this = $(this);
			if ($this.children('.contextual-links').is(':visible')) {
				$this.children('.contextual-links-trigger').click();
			}
		});
		
		/* Node: Highlight editable node area (fixes the missing functionality) */
		$('#region-content .tabs .contextual-links-trigger').mouseenter(function () {
			$('#region-content .node').addClass('highlight');
		});
		$('#region-content .tabs .contextual-links-trigger').mouseleave(function () {
			$('#region-content .node').removeClass('highlight');
		});
		
		/* Node: Allow disabling draft background by clicking the article */
		$('#block-system-main .node-unpublished').click(function () {
			$this.toggleClass('node-unpublished');
		});
		
		/* Media elements: Add margins for floated wysiwyg media elements */
		$('img.media-element, span.media-element').each(function () {
			var $this = $(this);
			if ($this.css('float') == 'left') {
				$this.addClass('float-left');
			}
			else if ($this.css('float') == 'right') {
				$this.addClass('float-right');
			}
		});
		
		// TODO: Check if this is already fixed or not
		/* Youtube embed fix: Put the video players under the administrative overlay
		The default url is http://www.youtube.com/embed/ysY9vwQQhCU
		We want to change it into http://www.youtube.com/embed/ysY9vwQQhCU?wmode=transparent
		*
		$('iframe[src *= "youtube.com/embed/"]').not('[src *= "?wmode=transparent"]').each(function () {
			//$(this).attr('src', $(this).attr('src') + '?wmode=transparent');
			$(this).attr('wmode', 'transparent');
		});
		*/

	});
	
})(jQuery, window, document);
