( function ( $ ) {
	function fccPopulateQuickEdit( postId ) {
		var id = parseInt( postId, 10 );

		if ( ! id ) {
			return;
		}

		var row     = $( '#post-' + id );
		var editRow = $( '#edit-' + id );

		[ 'active_in_calendar', 'booking_engine_disabled' ].forEach( function ( field ) {
			var value = row.find( '.fcc-quick-edit-value[data-field="' + field + '"]' ).data( 'value' );

			editRow.find( 'input[name="fcc_' + field + '"]' ).prop( 'checked', '1' === String( value ) );
		} );
	}

	$( function () {
		if ( typeof inlineEditPost === 'undefined' ) {
			return;
		}

		var wpInlineEdit = inlineEditPost.edit;

		inlineEditPost.edit = function ( id ) {
			wpInlineEdit.apply( this, arguments );

			var postId = 0 === parseInt( id, 10 ) ? this.getId( id ) : id;

			fccPopulateQuickEdit( postId );
		};
	} );
} )( jQuery );
