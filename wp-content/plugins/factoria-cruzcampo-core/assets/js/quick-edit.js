( function ( $ ) {
	var CHECKBOX_FIELDS = [ 'active_in_calendar', 'booking_engine_disabled' ];
	var TEXT_FIELDS     = [ 'product_id' ];

	function fccPopulateQuickEdit( postId ) {
		var id = parseInt( postId, 10 );

		if ( ! id ) {
			return;
		}

		var row     = $( '#post-' + id );
		var editRow = $( '#edit-' + id );

		CHECKBOX_FIELDS.forEach( function ( field ) {
			var value = row.find( '.fcc-quick-edit-value[data-field="' + field + '"]' ).data( 'value' );

			editRow.find( 'input[name="fcc_' + field + '"]' ).prop( 'checked', '1' === String( value ) );
		} );

		TEXT_FIELDS.forEach( function ( field ) {
			var value = row.find( '.fcc-quick-edit-value[data-field="' + field + '"]' ).data( 'value' );

			editRow.find( 'input[name="fcc_' + field + '"]' ).val( value || '' );
		} );
	}

	$( function () {
		if ( typeof inlineEditPost === 'undefined' ) {
			return;
		}

		var wpInlineEdit = inlineEditPost.edit;

		inlineEditPost.edit = function ( id ) {
			wpInlineEdit.apply( this, arguments );

			var postId = ( 'object' === typeof id ) ? this.getId( id ) : id;

			fccPopulateQuickEdit( postId );
		};
	} );
} )( jQuery );
