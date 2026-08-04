document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '[data-fcc-horas-rows]' ).forEach( ( rowsEl ) => {
		const addBtn = rowsEl.parentElement.querySelector( '[data-fcc-horas-add]' );

		function createRow() {
			const row = document.createElement( 'div' );
			row.className = 'fcc-horas-row';
			row.style.display = 'flex';
			row.style.gap = '6px';
			row.style.alignItems = 'center';

			const input = document.createElement( 'input' );
			input.type = 'time';
			input.name = 'fcc_horas[]';
			input.style.flex = '1';

			const removeBtn = document.createElement( 'button' );
			removeBtn.type = 'button';
			removeBtn.className = 'button fcc-horas-remove';
			removeBtn.setAttribute( 'aria-label', 'Eliminar hora' );
			removeBtn.textContent = '×';

			row.append( input, removeBtn );
			return row;
		}

		if ( addBtn ) {
			addBtn.addEventListener( 'click', () => {
				const row = createRow();
				rowsEl.appendChild( row );
				row.querySelector( 'input' ).focus();
			} );
		}

		rowsEl.addEventListener( 'click', ( e ) => {
			const removeBtn = e.target.closest( '.fcc-horas-remove' );
			if ( ! removeBtn ) return;
			removeBtn.closest( '.fcc-horas-row' )?.remove();
		} );
	} );
} );
