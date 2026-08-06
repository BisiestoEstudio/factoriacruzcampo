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

function formatPrice( euros ) {
	if ( ! euros ) return '';

	const decimals = Number.isInteger( euros ) ? 0 : 2;
	return `${ euros.toLocaleString( 'es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals } ) }€`;
}

function renderDayCards( cardsEl, cards, onSelect ) {
	cardsEl.innerHTML = '';

	if ( ! cards.length ) {
		cardsEl.innerHTML = '<p class="b-calendario-reserva__day-empty">No hay experiencias agendadas este día.</p>';
		return;
	}

	cards.forEach( ( card ) => {
		const cardEl = document.createElement( 'div' );
		cardEl.className = `b-calendario-reserva__card b-calendario-reserva__card--${ card.available ? 'available' : 'unavailable' }`;

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

		if ( card.hours && card.hours.length ) {
			const hoursEl = document.createElement( 'p' );
			hoursEl.className = 'b-calendario-reserva__card-hours u_bold';
			hoursEl.textContent = card.hours.join( ' · ' );
			bodyEl.appendChild( hoursEl );
		}

		const price = formatPrice( card.price );
		if ( price ) {
			const priceEl = document.createElement( 'p' );
			priceEl.className = 'b-calendario-reserva__card-price';
			priceEl.textContent = price;
			bodyEl.appendChild( priceEl );
		}
		cardEl.appendChild( bodyEl );

		if ( card.available ) {
			cardEl.setAttribute( 'role', 'button' );
			cardEl.setAttribute( 'tabindex', '0' );
			cardEl.addEventListener( 'click', () => onSelect( card ) );
			cardEl.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					onSelect( card );
				}
			} );
		} else {
			cardEl.setAttribute( 'aria-disabled', 'true' );
		}

		cardsEl.appendChild( cardEl );
	} );
}

function renderBookingPanel( panelEl, card, matrix, onBack, onSubmit ) {
	panelEl.innerHTML = '';

	const allPeople = Object.keys( matrix ).map( Number ).sort( ( a, b ) => a - b );
	const allHours  = [ ...new Set( Object.values( matrix ).flat() ) ].sort();

	let selectedPeople = null;
	let selectedHour   = null;

	const backBtn = document.createElement( 'button' );
	backBtn.type = 'button';
	backBtn.className = 'b-calendario-reserva__booking-back';
	backBtn.textContent = '← Volver';
	backBtn.addEventListener( 'click', onBack );

	const titleEl = document.createElement( 'h3' );
	titleEl.className = 'b-calendario-reserva__booking-title has-display-s-font-size';
	titleEl.textContent = card.title;

	panelEl.append( backBtn, titleEl );

	const price = formatPrice( card.price );
	if ( price ) {
		const priceEl = document.createElement( 'p' );
		priceEl.className = 'b-calendario-reserva__booking-price';
		priceEl.textContent = `${ price } / persona`;
		panelEl.appendChild( priceEl );
	}

	const peopleLabel = document.createElement( 'p' );
	peopleLabel.className = 'b-calendario-reserva__booking-label has-caption-font-size';
	peopleLabel.textContent = '¿Cuántos sois?';

	const peopleSelect = document.createElement( 'select' );
	peopleSelect.className = 'b-calendario-reserva__booking-people';

	const placeholderOption = document.createElement( 'option' );
	placeholderOption.value = '';
	placeholderOption.textContent = 'Personas';
	placeholderOption.disabled = true;

	peopleSelect.appendChild( placeholderOption );

	const hoursLabel = document.createElement( 'p' );
	hoursLabel.className = 'b-calendario-reserva__booking-label has-caption-font-size';
	hoursLabel.textContent = 'Elige la hora';

	const hoursGroup = document.createElement( 'div' );
	hoursGroup.className = 'b-calendario-reserva__booking-hours';

	const submitBtn = document.createElement( 'button' );
	submitBtn.type = 'button';
	submitBtn.className = 'btn b-calendario-reserva__booking-submit';
	submitBtn.textContent = 'Reserva ahora';
	submitBtn.disabled = true;

	panelEl.append( peopleLabel, peopleSelect, hoursLabel, hoursGroup, submitBtn );

	if ( ! allPeople.length || ! allHours.length ) {
		const emptyEl = document.createElement( 'p' );
		emptyEl.className = 'b-calendario-reserva__day-empty';
		emptyEl.textContent = 'No se ha podido consultar la disponibilidad para esta actividad.';
		panelEl.appendChild( emptyEl );
		peopleSelect.disabled = true;
		return;
	}

	function peopleValidForHour( hour ) {
		return allPeople.filter( ( people ) => ( matrix[ people ] || [] ).includes( hour ) );
	}

	function hoursValidForPeople( people ) {
		return matrix[ people ] || [];
	}

	function renderPeopleOptions() {
		const options = selectedHour ? peopleValidForHour( selectedHour ) : allPeople;

		peopleSelect.querySelectorAll( 'option:not([value=""])' ).forEach( ( opt ) => opt.remove() );

		options.forEach( ( people ) => {
			const opt = document.createElement( 'option' );
			opt.value = String( people );
			opt.textContent = `${ people } ${ people === 1 ? 'persona' : 'personas' }`;
			peopleSelect.appendChild( opt );
		} );

		peopleSelect.value = selectedPeople && options.includes( selectedPeople ) ? String( selectedPeople ) : '';
	}

	function renderHourButtons() {
		hoursGroup.innerHTML = '';
		const enabledHours = selectedPeople ? hoursValidForPeople( selectedPeople ) : allHours;

		allHours.forEach( ( hour ) => {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'b-calendario-reserva__booking-hour';
			btn.textContent = hour;
			btn.disabled = ! enabledHours.includes( hour );

			if ( hour === selectedHour ) {
				btn.classList.add( 'b-calendario-reserva__booking-hour--selected' );
			}

			btn.addEventListener( 'click', () => {
				selectedHour = selectedHour === hour ? null : hour;

				// Si la nueva hora no admite las personas ya elegidas, se resetean.
				if ( selectedHour && selectedPeople && ! hoursValidForPeople( selectedPeople ).includes( selectedHour ) ) {
					selectedPeople = null;
				}

				renderPeopleOptions();
				renderHourButtons();
				updateSubmit();
			} );

			hoursGroup.appendChild( btn );
		} );
	}

	function updateSubmit() {
		submitBtn.disabled = ! ( selectedPeople && selectedHour );
	}

	peopleSelect.addEventListener( 'change', () => {
		selectedPeople = peopleSelect.value ? Number( peopleSelect.value ) : null;

		// Si las personas dejan de admitir la hora ya elegida, se resetea.
		if ( selectedHour && selectedPeople && ! hoursValidForPeople( selectedPeople ).includes( selectedHour ) ) {
			selectedHour = null;
		}

		renderHourButtons();
		updateSubmit();
	} );

	submitBtn.addEventListener( 'click', () => {
		const detail = {
			productId: card.productId,
			people: selectedPeople,
			hour: selectedHour,
		};

		document.dispatchEvent( new CustomEvent( 'fcb:booking-selected', {
			bubbles: true,
			detail,
		} ) );

		onSubmit( detail );
	} );

	renderPeopleOptions();
	renderHourButtons();
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
		const bookingEl     = block.querySelector( '.b-calendario-reserva__booking' );
		const columnsEl     = block.querySelector( '.b-calendario-reserva__columns' );
		const formStepEl    = block.querySelector( '.b-calendario-reserva__form-step' );
		const formBackBtn   = block.querySelector( '.b-calendario-reserva__form-back' );
		const formTitleEl   = block.querySelector( '.b-calendario-reserva__form-title' );
		const formPriceEl   = formStepEl.querySelector( '[data-field="price"]' );
		const formHourEl    = formStepEl.querySelector( '[data-field="hour"]' );
		const formPeopleEl  = formStepEl.querySelector( '[data-field="people"]' );
		const formEl        = block.querySelector( '.b-calendario-reserva__form' );
		const formDebugEl   = block.querySelector( '.b-calendario-reserva__form-debug' );
		const formSubmitBtn = block.querySelector( '.b-calendario-reserva__form-submit' );
		const today         = state.today;
		const restUrl       = state.restUrl;
		const dayUrl        = state.dayUrl;
		const availabilityUrl = state.availabilityUrl;
		const bookingUrl      = state.bookingUrl;

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

		function showCardsStep() {
			bookingEl.hidden = true;
			bookingEl.innerHTML = '';
			dayCardsEl.hidden = false;
			daySubtitleEl.hidden = false;
			daySubtitleEl.textContent = 'Selecciona tu actividad';
		}

		async function selectExperience( date, card ) {
			dayCardsEl.hidden = true;
			daySubtitleEl.hidden = true;
			bookingEl.hidden = false;
			bookingEl.setAttribute( 'aria-busy', 'true' );
			bookingEl.innerHTML = '';

			try {
				const params = new URLSearchParams( { date, product_id: card.productId } );
				const res    = await fetch( `${ availabilityUrl }?${ params.toString() }` );
				const data   = await res.json();
				renderBookingPanel(
					bookingEl,
					card,
					data.matrix || {},
					showCardsStep,
					( booking ) => showFormStep( card, booking )
				);
			} catch {
				bookingEl.innerHTML = '<p class="b-calendario-reserva__day-empty">No se ha podido consultar la disponibilidad.</p>';
			} finally {
				bookingEl.removeAttribute( 'aria-busy' );
			}
		}

		function showBookingStep() {
			formStepEl.hidden = true;
			columnsEl.hidden = false;
		}

		function showFormStep( card, booking ) {
			columnsEl.hidden = true;
			formStepEl.hidden = false;

			formTitleEl.textContent = card.title;
			formPriceEl.textContent = formatPrice( card.price ) || 'Gratis';
			formHourEl.textContent = booking.hour;
			formPeopleEl.textContent = `${ booking.people } ${ booking.people === 1 ? 'persona' : 'personas' }`;

			formEl.dataset.productId = booking.productId;
			formEl.dataset.people = booking.people;
			formEl.dataset.hour = booking.hour;
			formEl.dataset.date = state.selectedDate || '';
			formEl.dataset.experienceTitle = card.title;
		}

		formBackBtn.addEventListener( 'click', showBookingStep );

		const allergyDetailEl = formEl.querySelector( '.b-calendario-reserva__form-allergy-detail' );
		const allergyTextarea = allergyDetailEl.querySelector( 'textarea' );

		function updateAllergyDetail() {
			const showDetail = formEl.querySelector( 'input[name="alergia"]:checked' )?.value === 'si';
			allergyDetailEl.hidden = ! showDetail;
			allergyTextarea.required = showDetail;
			if ( ! showDetail ) allergyTextarea.value = '';
		}

		formEl.querySelectorAll( 'input[name="alergia"]' ).forEach( ( radio ) => {
			radio.addEventListener( 'change', updateAllergyDetail );
		} );

		formEl.addEventListener( 'submit', async ( e ) => {
			e.preventDefault();

			if ( ! formEl.checkValidity() ) {
				formEl.reportValidity();
				return;
			}

			const formData = new FormData( formEl );
			const prefijo  = formData.get( 'prefijo' );
			const telefono = formData.get( 'telefono' );

			const booking = {
				date: formEl.dataset.date,
				hour: formEl.dataset.hour,
				people: formEl.dataset.people,
				experienceTitle: formEl.dataset.experienceTitle,
				nombre: formData.get( 'nombre' ),
				apellidos: formData.get( 'apellidos' ),
				email: formData.get( 'email' ),
				prefijo,
				telefono,
				alergia: formData.get( 'alergia' ),
				alergiaDetalle: formData.get( 'alergia_detalle' ),
			};

			document.dispatchEvent( new CustomEvent( 'fcb:reservation-submitted', {
				bubbles: true,
				detail: {
					...booking,
					productId: formEl.dataset.productId,
					telefono: `${ prefijo }${ telefono }`,
					fechaNacimiento: formData.get( 'fecha_nacimiento' ),
					consentimientoComercial: formData.get( 'consentimiento_comercial' ) === 'on',
				},
			} ) );

			formSubmitBtn.disabled = true;

			if ( formDebugEl ) {
				formDebugEl.hidden = true;
				formDebugEl.textContent = '';
			}

			try {
				const res  = await fetch( bookingUrl, {
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': state.nonce,
					},
					body: JSON.stringify( booking ),
				} );
				const data = await res.json();

				if ( state.debug && formDebugEl ) {
					formDebugEl.hidden = false;
					formDebugEl.textContent = JSON.stringify( data, null, 2 );
				}
			} catch ( err ) {
				if ( state.debug && formDebugEl ) {
					formDebugEl.hidden = false;
					formDebugEl.textContent = `Error de red: ${ err.message }`;
				}
			} finally {
				formSubmitBtn.disabled = false;
			}
		} );

		async function selectDay( date ) {
			state.selectedDate = date;
			dayTitleEl.textContent = formatDayLabel( date );
			showCardsStep();
			dayCardsEl.setAttribute( 'aria-busy', 'true' );

			try {
				const params = new URLSearchParams( { date } );
				if ( state.experience ) {
					params.set( 'product_id', state.productId );
				}

				const res  = await fetch( `${ dayUrl }?${ params.toString() }` );
				const data = await res.json();
				renderDayCards( dayCardsEl, data.cards || [], ( card ) => selectExperience( date, card ) );
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
