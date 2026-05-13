const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins,
		new CopyPlugin( {
			patterns: [
				{
					from: '**/*.php',
					to: path.resolve( __dirname, 'build/blocks/[path][name][ext]' ),
					context: path.resolve( __dirname, 'src/blocks' ),
					noErrorOnMissing: true,
				},
			],
		} ),
	],
};
