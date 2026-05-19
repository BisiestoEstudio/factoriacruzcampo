import { getFluidValue } from '../../utils/getFluidValue';

export const computeSpacerHeight = ( attributes ) => {
	const {
		mode = 'interpolate',
		height1 = 0,
		height2 = 0,
		viewport1 = 500,
		viewport2 = 1200,
		fixedValue = 0,
		fixedUnit = 'px',
		useMinMax = false,
		minValue = 0,
		minUnit = 'px',
		maxValue = 0,
		maxUnit = 'px',
	} = attributes;

	if ( mode === 'value' ) {
		const val = `${ fixedValue }${ fixedUnit }`;
		if ( useMinMax ) {
			return `clamp(${ minValue }${ minUnit }, ${ val }, ${ maxValue }${ maxUnit })`;
		}
		return val;
	}

	return getFluidValue( height1, height2, viewport1, viewport2 );
};
