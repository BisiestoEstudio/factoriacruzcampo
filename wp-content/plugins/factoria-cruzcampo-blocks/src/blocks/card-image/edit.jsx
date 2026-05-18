import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody, Button } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import LinkPicker from '../../components/LinkPicker';

const ALLOWED_BLOCKS = [ 'core/heading', 'core/paragraph' ];

export default function Edit( { attributes, setAttributes } ) {
	const { image, link } = attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! image ) return null;
			return select( coreStore ).getMedia( image )?.source_url ?? null;
		},
		[ image ]
	);

	const blockProps = useBisiestoBlockProps( {
		className: link?.url ? 'has-link' : '',
	} );

	return (
		<>
			<LinkPicker
				link={ link }
				onLinkChange={ ( value ) => setAttributes( { link: value } ) }
				placement="toolbar"
				addLabel={ __( 'Añadir enlace', 'factoria-cruzcampo-blocks' ) }
				editLabel={ __( 'Editar enlace', 'factoria-cruzcampo-blocks' ) }
				removeLabel={ __( 'Eliminar enlace', 'factoria-cruzcampo-blocks' ) }
			/>

			<InspectorControls>
				<PanelBody title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }>
					{ imageUrl && (
						<img
							src={ imageUrl }
							alt=""
							style={ { width: '100%', marginBottom: '8px', borderRadius: '4px' } }
						/>
					) }
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { image: media.id } ) }
							allowedTypes={ [ 'image' ] }
							value={ image }
							render={ ( { open } ) => (
								<Button
									onClick={ open }
									variant="secondary"
									style={ { width: '100%', justifyContent: 'center' } }
								>
									{ image
										? __( 'Cambiar imagen', 'factoria-cruzcampo-blocks' )
										: __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					{ image && (
						<Button
							variant="tertiary"
							isDestructive
							onClick={ () => setAttributes( { image: 0 } ) }
							style={ { marginTop: '8px', width: '100%', justifyContent: 'center' } }
						>
							{ __( 'Eliminar imagen', 'factoria-cruzcampo-blocks' ) }
						</Button>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ imageUrl ? (
					<div className="b-card-image__image">
						<img src={ imageUrl } alt="" />
					</div>
				) : (
					<div className="b-card-image__image b-card-image__image--placeholder">
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => setAttributes( { image: media.id } ) }
								allowedTypes={ [ 'image' ] }
								value={ image }
								render={ ( { open } ) => (
									<Button onClick={ open } variant="secondary">
										{ __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					</div>
				) }

				<div className="b-card-image__content">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						templateLock={ false }
						template={ [
							[ 'core/heading', { level: 3, placeholder: __( 'Título de la card', 'factoria-cruzcampo-blocks' ) } ],
							[ 'core/paragraph', { placeholder: __( 'Descripción…', 'factoria-cruzcampo-blocks' ) } ],
						] }
					/>
				</div>
			</div>
		</>
	);
}
