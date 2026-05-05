/**
 * Get the fluid value for the given size and viewport
 * All values are in pixels
 * 
 * @param {number} size1 - The size at the smaller viewport
 * @param {number} size2 - The size at the larger viewport
 * @param {number} viewport1 - The smaller viewport
 * @param {number} viewport2 - The larger viewport
 * @returns {string} The fluid value
 */
export const getFluidValue = (size1, size2, viewport1 = 540, viewport2 = 1100 ) => {
    if(size1 === size2) return size1 + 'px';
    
    const s1 = size1 / 16;
	const s2 = size2 / 16;
	const c = ( size2 - size1 ) / ( viewport2 - viewport1 );
	const a = ( size2 - viewport2 * c ) / 16;
	const b = Math.round( ( 100 * c ) * 10000 ) / 10000;

	return `clamp(${ s1 }rem, ${ a }rem + ${ b }vw, ${ s2 }rem)`;
};