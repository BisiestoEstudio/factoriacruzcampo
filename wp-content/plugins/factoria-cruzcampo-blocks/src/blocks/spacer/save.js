import { useBisiestoBlockPropsSave } from '../../hooks/useBisiestoBlockProps';
import { getFluidValue } from '../../utils/getFluidValue';


export default function save( { attributes } ) {
	const { heightMobile, heightDesktop } = attributes;
	const height = getFluidValue(heightMobile, heightDesktop);

	const customProps = useBisiestoBlockPropsSave({
		style: {
			height: height,
			width: '100%',
			margin: '0 !important',
		}
	});

	


	return (
		<div { ...customProps }>
		</div>
	);
}