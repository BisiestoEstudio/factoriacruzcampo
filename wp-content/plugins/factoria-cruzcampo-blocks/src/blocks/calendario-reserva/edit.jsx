import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'b-bisiesto b-calendario-reserva alignfull is-layout-constrained',
	} );

	const today = new Date();
	const year  = today.getFullYear();
	const month = today.getMonth();

	const MONTH_NAMES = [
		'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
		'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
	];

	// Generate a static preview grid with placeholder cells
	const daysInMonth = new Date( year, month + 1, 0 ).getDate();
	const startDow    = ( new Date( year, month, 1 ).getDay() + 6 ) % 7;
	const cells       = [];

	for ( let i = 0; i < startDow; i++ ) {
		cells.push( <div key={ `e-${ i }` } className="b-calendario-reserva__day b-calendario-reserva__day--empty" /> );
	}
	for ( let d = 1; d <= daysInMonth; d++ ) {
		cells.push(
			<div key={ d } className="b-calendario-reserva__day b-calendario-reserva__day--disabled">
				<span>{ d }</span>
			</div>
		);
	}

	return (
		<section { ...blockProps }>
			<div className="b-calendario-reserva__nav">
				<button className="b-calendario-reserva__nav-prev" disabled>←</button>
				<span className="b-calendario-reserva__nav-month">{ MONTH_NAMES[ month ] }</span>
				<button className="b-calendario-reserva__nav-next">→</button>
			</div>
			<div className="b-calendario-reserva__calendar">
				<div className="b-calendario-reserva__grid">
					{ cells }
				</div>
			</div>
			<p style={ { marginTop: '12px', opacity: 0.5, fontSize: '13px' } }>
				{ __( 'La disponibilidad real se carga desde CoverManager en el frontend.', 'factoria-cruzcampo-blocks' ) }
			</p>
		</section>
	);
}
