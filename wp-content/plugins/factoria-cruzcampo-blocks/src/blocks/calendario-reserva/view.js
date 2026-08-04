const MONTH_NAMES = [
	'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
	'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Compara dos pares año-mes: negativo si a < b, positivo si a > b, 0 si son el mismo mes.
function compareYearMonth( yearA, monthA, yearB, monthB ) {
	return ( yearA - yearB ) * 12 + ( monthA - monthB );
}

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

		html += `<button class="${ cls }" role="gridcell" data-date="${ dateStr }" ${ extra }><span class="has-display-xs-font-size">${ day }</span></button>`;
	}

	html += '</div>';
	return html;
}

function formatDayLabel( dateStr ) {
	const [ , month, day ] = dateStr.split( '-' ).map( Number );
	return `${ day } de ${ MONTH_NAMES[ month - 1 ] }`;
}

function renderDayCards( cardsEl, cards ) {
	cardsEl.innerHTML = '';

	if ( ! cards.length ) {
		cardsEl.innerHTML = '<p class="b-calendario-reserva__day-empty">No hay experiencias agendadas este día.</p>';
		return;
	}

	cards.forEach( ( card ) => {
		const cardEl = document.createElement( 'div' );
		cardEl.className = 'b-calendario-reserva__card';

		if ( card.imageHtml ) {
			const imageEl = document.createElement( 'div' );
			imageEl.className = 'b-calendario-reserva__card-image';
			imageEl.innerHTML = card.imageHtml;
			cardEl.appendChild( imageEl );
		}

		const bodyEl = document.createElement( 'div' );
		bodyEl.className = 'b-calendario-reserva__card-body';

		const titleEl = document.createElement( 'h3' );
		titleEl.className = 'b-calendario-reserva__card-title has-display-xs-font-size';
		titleEl.textContent = card.title;

		bodyEl.appendChild( titleEl );

		if ( card.hours ) {
			const hoursEl = document.createElement( 'p' );
			hoursEl.className = 'b-calendario-reserva__card-hours u_bold';
			hoursEl.textContent = card.hours;
			bodyEl.appendChild( hoursEl );
		}

		if ( card.price ) {
			const priceEl = document.createElement( 'p' );
			priceEl.className = 'b-calendario-reserva__card-price';
			priceEl.textContent = card.price;
			bodyEl.appendChild( priceEl );
		}
		cardEl.appendChild( bodyEl );
		cardsEl.appendChild( cardEl );
	} );
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

		const gridEl        = block.querySelector( '.b-calendario-reserva__calendar' );
		const monthEl       = block.querySelector( '.b-calendario-reserva__nav-month' );
		const prevBtn       = block.querySelector( '.b-calendario-reserva__nav-prev' );
		const nextBtn       = block.querySelector( '.b-calendario-reserva__nav-next' );
		const dayTitleEl    = block.querySelector( '.b-calendario-reserva__day-title' );
		const daySubtitleEl = block.querySelector( '.b-calendario-reserva__day-subtitle' );
		const dayCardsEl    = block.querySelector( '.b-calendario-reserva__day-cards' );
		const today         = state.today;
		const restUrl       = state.restUrl;
		const dayUrl        = state.dayUrl;

		function render() {
			gridEl.innerHTML = buildGrid( state.year, state.month, state.dates, today );
			monthEl.textContent = MONTH_NAMES[ state.month - 1 ];

			if ( state.boundsMin && state.boundsMax ) {
				const [ minYear, minMonth ] = state.boundsMin.split( '-' ).map( Number );
				const [ maxYear, maxMonth ] = state.boundsMax.split( '-' ).map( Number );

				prevBtn.disabled = compareYearMonth( state.year, state.month, minYear, minMonth ) <= 0;
				nextBtn.disabled = compareYearMonth( state.year, state.month, maxYear, maxMonth ) >= 0;
			} else {
				// Sin disponibilidad en absoluto: no hay a dónde navegar.
				prevBtn.disabled = true;
				nextBtn.disabled = true;
			}
		}

		async function navigate( year, month ) {
			prevBtn.disabled = true;
			nextBtn.disabled = true;
			gridEl.setAttribute( 'aria-busy', 'true' );

			try {
				const params = new URLSearchParams( { year, month } );
				if ( state.experience ) {
					params.set( 'experience', '1' );
					params.set( 'product_id', state.productId );
				}

				const res  = await fetch( `${ restUrl }?${ params.toString() }` );
				const data = await res.json();
				state.year      = data.year;
				state.month     = data.month;
				state.dates     = data.dates;
				state.boundsMin = data.boundsMin;
				state.boundsMax = data.boundsMax;
				render();
			} catch {
				// silently restore buttons on network error
				render();
			} finally {
				gridEl.removeAttribute( 'aria-busy' );
			}
		}

		async function selectDay( date ) {
			dayTitleEl.textContent = formatDayLabel( date );
			daySubtitleEl.textContent = 'Selecciona tu actividad';
			dayCardsEl.setAttribute( 'aria-busy', 'true' );

			try {
				const params = new URLSearchParams( { date } );
				if ( state.experience ) {
					params.set( 'product_id', state.productId );
				}

				const res  = await fetch( `${ dayUrl }?${ params.toString() }` );
				const data = await res.json();
				renderDayCards( dayCardsEl, data.cards || [] );
			} catch {
				dayCardsEl.innerHTML = '<p class="b-calendario-reserva__day-empty">No se ha podido cargar la disponibilidad.</p>';
			} finally {
				dayCardsEl.removeAttribute( 'aria-busy' );
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

			selectDay( date );
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
