document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.b-agenda' ).forEach( ( block ) => {
		const filters = block.querySelectorAll( '.b-agenda__filter' );
		const days = Array.from( block.querySelectorAll( '.b-agenda__day' ) );
		const loadMoreButton = block.querySelector( '.b-agenda__load-more' );
		const daysPerPage = parseInt( block.dataset.daysPerPage, 10 ) || 0;

		if ( ! days.length ) {
			return;
		}

		let activeMonth = null;
		let revealCount = daysPerPage || Infinity;

		function matchingDays() {
			return activeMonth
				? days.filter( ( day ) => day.dataset.month === activeMonth )
				: days;
		}

		function render() {
			const candidates = matchingDays();

			days.forEach( ( day ) => {
				day.hidden = true;
			} );

			candidates.slice( 0, revealCount ).forEach( ( day ) => {
				day.hidden = false;
			} );

			if ( loadMoreButton ) {
				loadMoreButton.hidden = candidates.length <= revealCount;
			}

			filters.forEach( ( button ) => {
				button.setAttribute(
					'aria-pressed',
					button.dataset.month === activeMonth ? 'true' : 'false'
				);
			} );
		}

		filters.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				activeMonth = activeMonth === button.dataset.month ? null : button.dataset.month;
				revealCount = daysPerPage || Infinity;
				render();
			} );
		} );

		if ( loadMoreButton ) {
			loadMoreButton.addEventListener( 'click', () => {
				revealCount += daysPerPage;
				render();
			} );
		}

		render();
	} );
} );
