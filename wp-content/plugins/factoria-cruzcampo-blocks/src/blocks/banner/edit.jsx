import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import './editor.scss';

const ALLOWED_BLOCKS = [
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/spacer',
	'bisiesto/spacer',
];

export default function Edit( { attributes, setAttributes } ) {
	const { image } = attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! image ) return null;
			return select( coreStore ).getMedia( image )?.source_url ?? null;
		},
		[ image ]
	);

	const blockProps = useBisiestoBlockProps( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }>
					<MediaPicker
						mode="image-only"
						imageId={ image }
						onImageChange={ ( id ) => setAttributes( { image: id } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-banner__content">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						templateLock={ false }
					/>
				</div>
				<div className="b-banner__image">
					{ imageUrl ? (
						<img src={ imageUrl } alt="" />
					) : (
						<div className="b-banner__placeholder">
							{ __( 'Selecciona una imagen desde el panel lateral', 'factoria-cruzcampo-blocks' ) }
						</div>
					) }
				</div>
			</div>
		</>
	);
}
