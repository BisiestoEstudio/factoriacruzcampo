module.exports = {
	plugins: [
		require( '@lehoczky/postcss-fluid' )( {
			min: '1100px',
			max: '500px',
		} ),
		require( 'cssnano' )( {
			preset: 'default',
		} ),
	],
};
