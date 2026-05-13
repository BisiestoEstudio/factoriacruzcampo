import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { imageId } = attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! imageId ) return null;
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ imageId ]
	);

	const blockProps = useBisiestoBlockProps( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<MediaPicker
						mode="image-only"
						imageId={ imageId }
						onImageChange={ ( id ) =>
							setAttributes( { imageId: id } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="b-scroll-over__image-wrap">
					{ imageUrl ? (
						<img
							className="b-scroll-over__image"
							src={ imageUrl }
							alt=""
						/>
					) : (
						<div className="b-scroll-over__image-placeholder">
							<span>
								{ __(
									'Selecciona una imagen en el panel lateral',
									'factoria-cruzcampo-blocks'
								) }
							</span>
						</div>
					) }
				</div>
				<div className="b-scroll-over__content">
					<InnerBlocks
					allowedBlocks={ 
						[ 
							'bisiesto/layout-2-fotos',
							'bisiesto/spacer',
							'bisiesto/separator',
							'bisiesto/button',
						 ] }
					templateLock={ false }
					 />
				</div>
			</section>
		</>
	);
}
