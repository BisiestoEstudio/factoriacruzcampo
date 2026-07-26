document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.b-agenda' ).forEach( ( block ) => {
		const filters = block.querySelectorAll( '.b-agenda__filter' );
		const days = block.querySelectorAll( '.b-agenda__day' );

		if ( ! filters.length ) {
			return;
		}

		function applyFilter( month ) {
			days.forEach( ( day ) => {
				day.hidden = !! month && day.dataset.month !== month;
			} );

			filters.forEach( ( button ) => {
				button.setAttribute(
					'aria-pressed',
					button.dataset.month === month ? 'true' : 'false'
				);
			} );
		}

		let activeMonth = null;
		applyFilter( activeMonth );

		filters.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				activeMonth = activeMonth === button.dataset.month ? null : button.dataset.month;
				applyFilter( activeMonth );
			} );
		} );
	} );
} );
