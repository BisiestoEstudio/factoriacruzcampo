import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import './editor.scss';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

function normalizeMapUrl( value ) {
	if ( ! value ) return '';

	// If the user pasted a full iframe snippet, extract src.
	if ( value.includes( '<iframe' ) ) {
		const match = value.match( /src=["']([^"']+)["']/i );
		return match?.[ 1 ] ? match[ 1 ].trim() : '';
	}

	return value.trim();
}

const DEFAULT_TEMPLATE = [
	[
		'core/heading',
		{
			level: 2,
			content: __( 'LOCALIZACIÓN', 'factoria-cruzcampo-blocks' ),
		},
	],
	[
		'core/paragraph',
		{
			content: __(
				'AVENIDA ANDALUCÍA 1 C.P. 41007 · SEVILLA',
				'factoria-cruzcampo-blocks'
			),
		},
	],
	[
		'core/buttons',
		{},
		[
			[
				'core/button',
				{
					text: __( 'VER EN MAPS', 'factoria-cruzcampo-blocks' ),
				},
			],
		],
	],
];

export default function Edit( { attributes, setAttributes } ) {
	const { mapUrl } = attributes;

	const blockProps = useBisiestoBlockProps();

	const iframeProps = useMemo( () => {
		if ( ! mapUrl ) return null;

		return {
			src: mapUrl,
			loading: 'lazy',
			referrerPolicy: 'no-referrer-when-downgrade',
			allowFullScreen: true,
			title: __( 'Mapa', 'factoria-cruzcampo-blocks' ),
		};
	}, [ mapUrl ] );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Mapa', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'URL del iframe (Google Maps)', 'factoria-cruzcampo-blocks' ) }
						help={ __(
							'Pega la URL del embed o el código <iframe> completo; se extraerá el src automáticamente.',
							'factoria-cruzcampo-blocks'
						) }
						value={ mapUrl }
						onChange={ ( value ) =>
							setAttributes( { mapUrl: normalizeMapUrl( value ) } )
						}
						placeholder="https://www.google.com/maps/embed?..."
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-maps__grid">
					<div className="b-maps__content">
						<InnerBlocks
							template={ DEFAULT_TEMPLATE }
							templateLock={ false }
							allowedBlocks={ [
								'core/heading',
								'core/paragraph',
								'core/buttons',
								'core/button',
								'core/list',
								'core/separator',
								'core/spacer',
							] }
						/>
					</div>
					<div className="b-maps__map">
						{ iframeProps ? (
							<iframe className="b-maps__iframe" { ...iframeProps } />
						) : (
							<div className="b-maps__placeholder">
								{ __(
									'Añade la URL del iframe de Google Maps en el panel de configuración.',
									'factoria-cruzcampo-blocks'
								) }
							</div>
						) }
					</div>
				</div>
			</div>
		</>
	);
}

