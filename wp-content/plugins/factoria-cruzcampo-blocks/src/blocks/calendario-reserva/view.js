const MONTH_NAMES = [
	'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
	'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function buildGrid( year, month, dates, today ) {
	const firstDay   = new Date( year, month - 1, 1 );
	const daysInMonth = new Date( year, month, 0 ).getDate();
	// getDay(): 0=Sun…6=Sat → convert to Mon-based offset
	const startDow = ( firstDay.getDay() + 6 ) % 7;

	let html = '<div class="b-calendario-reserva__grid" role="grid">';

	for ( let i = 0; i < startDow; i++ ) {
		html += '<div class="b-calendario-reserva__day b-calendario-reserva__day--empty" role="gridcell" aria-hidden="true"></div>';
	}

	for ( let day = 1; day <= daysInMonth; day++ ) {
		const mm      = String( month ).padStart( 2, '0' );
		const dd      = String( day ).padStart( 2, '0' );
		const dateStr = `${ year }-${ mm }-${ dd }`;
		const isPast  = dateStr < today;
		const value   = dates[ dateStr ];

		let state;
		if ( isPast || value === undefined ) {
			state = 'disabled';
		} else if ( value === 1 ) {
			state = 'available';
		} else {
			state = 'full';
		}

		const cls   = `b-calendario-reserva__day b-calendario-reserva__day--${ state }`;
		const extra = state === 'available'
			? `tabindex="0" aria-label="${ day } de ${ MONTH_NAMES[ month - 1 ] }"`
			: 'aria-disabled="true"';

		html += `<button class="${ cls }" role="gridcell" data-date="${ dateStr }" ${ extra }><span>${ day }</span></button>`;
	}

	html += '</div>';
	return html;
}

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.b-calendario-reserva' ).forEach( ( block ) => {
		const raw  = block.dataset.calendar;
		if ( ! raw ) return;

		let state;
		try {
			state = JSON.parse( raw );
		} catch {
			return;
		}

		const gridEl    = block.querySelector( '.b-calendario-reserva__calendar' );
		const monthEl   = block.querySelector( '.b-calendario-reserva__nav-month' );
		const prevBtn   = block.querySelector( '.b-calendario-reserva__nav-prev' );
		const nextBtn   = block.querySelector( '.b-calendario-reserva__nav-next' );
		const today     = state.today;
		const restUrl   = state.restUrl;

		const todayDate = new Date( today + 'T00:00:00' );
		const todayYear = todayDate.getFullYear();
		const todayMonth = todayDate.getMonth() + 1;

		function render() {
			gridEl.innerHTML = buildGrid( state.year, state.month, state.dates, today );
			monthEl.textContent = MONTH_NAMES[ state.month - 1 ];
			prevBtn.disabled = ( state.year < todayYear ) ||
				( state.year === todayYear && state.month <= todayMonth );
		}

		async function navigate( year, month ) {
			prevBtn.disabled = true;
			nextBtn.disabled = true;
			gridEl.setAttribute( 'aria-busy', 'true' );

			try {
				const res  = await fetch( `${ restUrl }?year=${ year }&month=${ month }` );
				const data = await res.json();
				state.year   = data.year;
				state.month  = data.month;
				state.dates  = data.dates;
				render();
			} catch {
				// silently restore buttons on network error
				render();
			} finally {
				gridEl.removeAttribute( 'aria-busy' );
			}
		}

		prevBtn.addEventListener( 'click', () => {
			let { year, month } = state;
			month--;
			if ( month < 1 ) { month = 12; year--; }
			navigate( year, month );
		} );

		nextBtn.addEventListener( 'click', () => {
			let { year, month } = state;
			month++;
			if ( month > 12 ) { month = 1; year++; }
			navigate( year, month );
		} );

		gridEl.addEventListener( 'click', ( e ) => {
			const btn = e.target.closest( '.b-calendario-reserva__day--available' );
			if ( ! btn ) return;
			const date = btn.dataset.date;
			if ( ! date ) return;

			block.querySelectorAll( '.b-calendario-reserva__day--selected' )
				.forEach( ( el ) => el.classList.remove( 'b-calendario-reserva__day--selected' ) );
			btn.classList.add( 'b-calendario-reserva__day--selected' );

			document.dispatchEvent( new CustomEvent( 'fcb:date-selected', {
				bubbles: true,
				detail: { date },
			} ) );
		} );

		// Keyboard: Enter/Space on available day
		gridEl.addEventListener( 'keydown', ( e ) => {
			if ( e.key !== 'Enter' && e.key !== ' ' ) return;
			const btn = e.target.closest( '.b-calendario-reserva__day--available' );
			if ( btn ) btn.click();
		} );

		render();
	} );
} );
