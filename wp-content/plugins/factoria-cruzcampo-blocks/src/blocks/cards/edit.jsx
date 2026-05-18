import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

const CARD_TYPES = [
	{ label: __( 'Image Card', 'factoria-cruzcampo-blocks' ), value: 'card-image' },
	{ label: __( 'Square Card', 'factoria-cruzcampo-blocks' ), value: 'card-square' },
	{ label: __( 'Info Card', 'factoria-cruzcampo-blocks' ), value: 'card-info' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { cardType } = attributes;
	const blockProps = useBisiestoBlockProps( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Tipo de card', 'factoria-cruzcampo-blocks' ) }>
					<SelectControl
						label={ __( 'Tipo de card', 'factoria-cruzcampo-blocks' ) }
						value={ cardType }
						options={ CARD_TYPES }
						onChange={ ( value ) => setAttributes( { cardType: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'bisiesto/card' ] }
					templateLock={ false }
					template={ [ [ 'bisiesto/card' ] ] }
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>
			</div>
		</>
	);
}
