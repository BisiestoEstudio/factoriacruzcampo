addEventListener( 'DOMContentLoaded', function () {
	const menu = document.querySelector( '.b-offset-menu' );
	if ( ! menu ) return;

	const toggle = menu.querySelector( '.b-offset-menu__toggle' );
	const panel  = menu.querySelector( '.b-offset-menu__panel' );
	if ( ! toggle || ! panel ) return;

	// --- Scroll hide / show / transparent-at-top ---
	// $dur-bar en SCSS es 0.35s — el delay iguala esa duración para que
	// el color cambie mientras la barra ya está fuera de pantalla.
	const BAR_HIDE_THRESHOLD = 80;
	const BAR_ANIM_MS        = 350;

	let lastScrollY      = window.scrollY;
	let ticking          = false;
	let scrolledTimer    = null;

	function onScroll() {
		const currentY = window.scrollY;

		// No hacer nada mientras el panel está abierto
		if ( menu.classList.contains( 'is-open' ) ) {
			lastScrollY = currentY;
			ticking = false;
			return;
		}

		const delta = currentY - lastScrollY;

		// Ocultar barra: solo cuando hay movimiento hacia abajo real (delta > 0)
		if ( delta > 0 && currentY > BAR_HIDE_THRESHOLD ) {
			menu.classList.add( 'is-scrolled-down' );

			// Programar el cambio a rojo para cuando la barra ya esté oculta
			if ( ! menu.classList.contains( 'is-scrolled' ) && ! scrolledTimer ) {
				scrolledTimer = setTimeout( () => {
					menu.classList.add( 'is-scrolled' );
					scrolledTimer = null;
				}, BAR_ANIM_MS );
			}
		} else if ( delta < 0 || currentY <= BAR_HIDE_THRESHOLD ) {
			// Mostrar barra: solo cuando hay movimiento hacia arriba real (delta < 0)
			// o hemos vuelto al top
			menu.classList.remove( 'is-scrolled-down' );

			// Cancelar si el usuario sube antes de que dispare el timer
			if ( scrolledTimer ) {
				clearTimeout( scrolledTimer );
				scrolledTimer = null;
			}
		}
		// delta === 0 → Lenis todavía interpolando sin avance real, no hacer nada

		// Quitar el fondo rojo al volver al top
		if ( currentY <= BAR_HIDE_THRESHOLD ) {
			menu.classList.remove( 'is-scrolled' );
		}

		lastScrollY = currentY;
		ticking = false;
	}

	// Estado inicial según posición de scroll al cargar
	if ( window.scrollY > BAR_HIDE_THRESHOLD ) {
		menu.classList.add( 'is-scrolled' );
	}

	window.addEventListener( 'scroll', () => {
		if ( ! ticking ) {
			requestAnimationFrame( onScroll );
			ticking = true;
		}
	}, { passive: true } );

	// --- Toggle open / close ---
	function openMenu() {
		menu.classList.add( 'is-open' );
		menu.classList.remove( 'is-scrolled-down' );
		toggle.setAttribute( 'aria-expanded', 'true' );
		toggle.setAttribute( 'aria-label', toggle.dataset.labelClose || 'Cerrar menú' );
		panel.setAttribute( 'aria-hidden', 'false' );
		document.body.classList.add( 'menu-is-open' );
		window.lenis?.stop();
	}

	function closeMenu() {
		menu.classList.remove( 'is-open' );
		toggle.setAttribute( 'aria-expanded', 'false' );
		toggle.setAttribute( 'aria-label', toggle.dataset.labelOpen || 'Abrir menú' );
		panel.setAttribute( 'aria-hidden', 'true' );
		document.body.classList.remove( 'menu-is-open' );
		window.lenis?.start();
	}

	toggle.dataset.labelOpen  = toggle.getAttribute( 'aria-label' ) || 'Abrir menú';
	toggle.dataset.labelClose = 'Cerrar menú';

	toggle.addEventListener( 'click', () => {
		if ( menu.classList.contains( 'is-open' ) ) {
			closeMenu();
		} else {
			openMenu();
		}
	} );

	// Cerrar al hacer clic en cualquier enlace del panel
	panel.querySelectorAll( 'a' ).forEach( ( link ) => {
		link.addEventListener( 'click', closeMenu );
	} );

	// Cerrar con Escape
	document.addEventListener( 'keydown', ( e ) => {
		if ( e.key === 'Escape' && menu.classList.contains( 'is-open' ) ) {
			closeMenu();
			toggle.focus();
		}
	} );
} );
