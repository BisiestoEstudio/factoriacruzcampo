addEventListener( 'DOMContentLoaded', function () {
	const menu = document.querySelector( '.b-offset-menu' );
	if ( ! menu ) return;

	const toggle = menu.querySelector( '.b-offset-menu__toggle' );
	const panel  = menu.querySelector( '.b-offset-menu__panel' );
	if ( ! toggle || ! panel ) return;

	// --- Scroll hide / show ---
	let lastScrollY = window.scrollY;
	let ticking     = false;

	function onScroll() {
		const currentY = window.scrollY;
		if ( currentY > lastScrollY && currentY > 80 ) {
			menu.classList.add( 'is-scrolled-down' );
		} else {
			menu.classList.remove( 'is-scrolled-down' );
		}
		lastScrollY = currentY;
		ticking = false;
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
		toggle.setAttribute( 'aria-expanded', 'true' );
		toggle.setAttribute( 'aria-label', toggle.dataset.labelClose || 'Cerrar menú' );
		panel.setAttribute( 'aria-hidden', 'false' );
		document.body.classList.add( 'menu-is-open' );
	}

	function closeMenu() {
		menu.classList.remove( 'is-open' );
		toggle.setAttribute( 'aria-expanded', 'false' );
		toggle.setAttribute( 'aria-label', toggle.dataset.labelOpen || 'Abrir menú' );
		panel.setAttribute( 'aria-hidden', 'true' );
		document.body.classList.remove( 'menu-is-open' );
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
