addEventListener( 'DOMContentLoaded', function () {
	document.querySelectorAll( '.b-experiences-carrusel' ).forEach( ( block ) => {
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
					if ( window.innerWidth < 768 ) return;
					const baseY = window.innerWidth >= 1024 ? [ 0, 64, 32 ] : [ 0, 48 ];
					swiper.slides.forEach( ( slide, i ) => {
						const item = slide.querySelector( '.b-experiences-carrusel__item' );
						item.style.transform = `translateY(${ baseY[ i % baseY.length ] }px)`;
					} );
				},
				setTranslate( swiper, translate ) {
					if ( window.innerWidth < 768 ) return;
					const baseY = window.innerWidth >= 1024 ? [ 0, 64, 32 ] : [ 0, 48 ];
					const amplitude = window.innerWidth >= 1024 ? 20 : 12;
					swiper.slides.forEach( ( slide, i ) => {
						const item = slide.querySelector( '.b-experiences-carrusel__item' );
						const wave = Math.sin( ( translate / swiper.width + i ) * Math.PI ) * amplitude;
						item.style.transform = `translateY(${ baseY[ i % baseY.length ] + wave }px)`;
					} );
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
