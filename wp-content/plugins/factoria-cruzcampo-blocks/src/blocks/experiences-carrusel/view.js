addEventListener( 'DOMContentLoaded', function () {
	document.querySelectorAll( '.b-experiences-carrusel' ).forEach( ( block ) => {
		function applyStagger( swiper, translate = 0 ) {
			if ( window.innerWidth < 768 ) {
				swiper.slides.forEach( ( slide ) => {
					slide.querySelector( '.b-experiences-carrusel__item' ).style.transform = '';
				} );
				return;
			}
			const baseY = window.innerWidth >= 1024 ? [ 0, 64, 32 ] : [ 0, 48 ];
			const amplitude = window.innerWidth >= 1024 ? 20 : 12;
			swiper.slides.forEach( ( slide, i ) => {
				const item = slide.querySelector( '.b-experiences-carrusel__item' );
				const wave = translate !== 0
					? Math.sin( ( translate / swiper.width + i ) * Math.PI ) * amplitude
					: 0;
				item.style.transform = `translateY(${ baseY[ i % baseY.length ] + wave }px)`;
			} );
		}

		new Swiper( block.querySelector( '.b-experiences-carrusel__swiper' ), {
			slidesPerView: 1.2,
			spaceBetween: 16,
			loop: false,
			breakpoints: {
				768: {
					slidesPerView: 2.2,
					spaceBetween: 32,
				},
				1024: {
					slidesPerView: 3.2,
					spaceBetween: 32,
				},
			},
			on: {
				afterInit( swiper ) {
					applyStagger( swiper );
				},
				breakpoint( swiper ) {
					applyStagger( swiper );
				},
				setTranslate( swiper, translate ) {
					applyStagger( swiper, translate );
				},
				setTransition( swiper, duration ) {
					swiper.slides.forEach( ( slide ) => {
						const item = slide.querySelector( '.b-experiences-carrusel__item' );
						item.style.transition = duration ? `transform ${ duration }ms ease` : '';
					} );
				},
			},
		} );
	} );
} );
