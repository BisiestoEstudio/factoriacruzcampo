addEventListener( 'DOMContentLoaded', function () {
	const menu = document.querySelector( '.b-offset-menu' );
	if ( ! menu ) return;

	const toggle = menu.querySelector( '.b-offset-menu__toggle' );
	const panel  = menu.querySelector( '.b-offset-menu__panel' );
	const bar    = menu.querySelector( '.b-offset-menu__bar' );
	if ( ! toggle || ! panel || ! bar ) return;

	// $dur-bar en SCSS es 0.35s
	const BAR_ANIM_MS = 350;

	let lastScrollY   = window.scrollY;
	let ticking       = false;
	let scrolledTimer = null;
	let isRetractable = false; // true una vez que el menú ha salido de pantalla por primera vez

	// --- Lógica de scroll ---

	function onScroll() {
		const currentY   = window.scrollY;
		const menuHeight = bar.offsetHeight;

		// No hacer nada mientras el panel está abierto
		if ( menu.classList.contains( 'is-open' ) ) {
			lastScrollY = currentY;
			ticking = false;
			return;
		}

		const delta = currentY - lastScrollY;

		if ( currentY <= 0 ) {
			// De vuelta al top — reset completo
			isRetractable = false;
			bar.style.transition = '';
			bar.style.transform  = '';
			menu.classList.remove( 'is-scrolled', 'is-scrolled-down' );
			if ( scrolledTimer ) { clearTimeout( scrolledTimer ); scrolledTimer = null; }

		} else if ( ! isRetractable ) {
			// Fase 1: scroll natural — el menú sigue la página como si no fuera fixed
			if ( currentY < menuHeight ) {
				bar.style.transition = 'none';
				bar.style.transform  = `translateY(-${ currentY }px)`;
				menu.classList.remove( 'is-scrolled', 'is-scrolled-down' );
			} else {
				// El menú acaba de salir de pantalla — activar modo retráctil
				isRetractable = true;
				bar.style.transition = '';
				bar.style.transform  = '';
				menu.classList.add( 'is-scrolled-down', 'is-scrolled' );
			}

		} else {
			// Fase 2: modo retráctil
			if ( delta > 0 ) {
				// Bajando → ocultar barra
				menu.classList.add( 'is-scrolled-down' );
				if ( ! menu.classList.contains( 'is-scrolled' ) && ! scrolledTimer ) {
					scrolledTimer = setTimeout( () => {
						menu.classList.add( 'is-scrolled' );
						scrolledTimer = null;
					}, BAR_ANIM_MS );
				}
			} else if ( delta < 0 ) {
				// Subiendo → mostrar barra
				menu.classList.remove( 'is-scrolled-down' );
				if ( scrolledTimer ) { clearTimeout( scrolledTimer ); scrolledTimer = null; }
				// Quitar el fondo rojo al entrar en la zona natural (antes de llegar al top)
				if ( currentY >= menuHeight ) {
					menu.classList.add( 'is-scrolled' );
				} else {
					menu.classList.remove( 'is-scrolled' );
				}
			}
			// delta === 0 → Lenis todavía interpolando sin avance real, no hacer nada
		}

		lastScrollY = currentY;
		ticking = false;
	}

	// Estado inicial si la página carga con scroll > 0 (p.ej. historial del navegador)
	if ( window.scrollY > 0 ) {
		const initH = bar.offsetHeight;
		if ( window.scrollY >= initH ) {
			isRetractable = true;
			menu.classList.add( 'is-scrolled' );
		} else {
			bar.style.transition = 'none';
			bar.style.transform  = `translateY(-${ window.scrollY }px)`;
		}
	}

	window.addEventListener( 'scroll', () => {
		if ( ! ticking ) {
			requestAnimationFrame( onScroll );
			ticking = true;
		}
	}, { passive: true } );

	// --- Toggle abrir / cerrar ---
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
