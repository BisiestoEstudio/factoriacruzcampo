addEventListener( 'DOMContentLoaded', function () {
	document.querySelectorAll( '.b-experiences-carrusel' ).forEach( ( block ) => {
		new Swiper( block.querySelector( '.b-experiences-carrusel__swiper' ), {
			slidesPerView: 1.2,
			spaceBetween: 16,
			loop: true,
			navigation: {
				nextEl: block.querySelector( '.b-experiences-carrusel__btn--next' ),
				prevEl: block.querySelector( '.b-experiences-carrusel__btn--prev' ),
			},
			pagination: {
				el: block.querySelector( '.b-experiences-carrusel__pagination' ),
				clickable: true,
			},
			breakpoints: {
				768: {
					slidesPerView: 2,
					spaceBetween: 32,
				},
				1024: {
					slidesPerView: 3,
					spaceBetween: 40,
				},
			},
		} );
	} );
} );
