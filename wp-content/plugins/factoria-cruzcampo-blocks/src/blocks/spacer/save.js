import { useBisiestoBlockPropsSave } from '../../hooks/useBisiestoBlockProps';
import { computeSpacerHeight } from './computeSpacerHeight';

export default function save( { attributes } ) {
	const height = computeSpacerHeight( attributes );

	const customProps = useBisiestoBlockPropsSave( {
		style: {
			height,
			width: '100%',
			margin: '0 !important',
		},
	} );

	return <div { ...customProps }></div>;
}
