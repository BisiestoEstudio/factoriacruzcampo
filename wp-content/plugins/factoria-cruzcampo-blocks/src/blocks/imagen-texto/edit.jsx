import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { InnerBlocks, InspectorControls, MediaUpload, MediaUploadCheck, BlockControls, BlockVerticalAlignmentControl } from '@wordpress/block-editor';
import { PanelBody, Button, ButtonGroup } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { image, verticalAlignment, imagePosition } = attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! image ) return null;
			const media = select( coreStore ).getMedia( image );
			return media?.source_url ?? null;
		},
		[ image ]
	);

	const blockProps = useBisiestoBlockProps( {
		className: `is-vertically-aligned-${ verticalAlignment } is-image-position-${ imagePosition }`,
	} );

	return (
		<>
			<BlockControls group="block">
				<BlockVerticalAlignmentControl
					value={ verticalAlignment }
					onChange={ ( value ) => setAttributes( { verticalAlignment: value } ) }
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }>
					<p style={ { marginBottom: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Posición de la imagen', 'factoria-cruzcampo-blocks' ) }
					</p>
					<ButtonGroup style={ { marginBottom: '16px', width: '100%' } }>
						{ [ { label: __( 'Izquierda', 'factoria-cruzcampo-blocks' ), value: 'left' },
							{ label: __( 'Derecha', 'factoria-cruzcampo-blocks' ), value: 'right' } ].map( ( { label, value } ) => (
							<Button
								key={ value }
								variant={ imagePosition === value ? 'primary' : 'secondary' }
								onClick={ () => setAttributes( { imagePosition: value } ) }
								style={ { width: '50%', justifyContent: 'center' } }
							>
								{ label }
							</Button>
						) ) }
					</ButtonGroup>

					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { image: media.id } ) }
							allowedTypes={ [ 'image' ] }
							value={ image }
							render={ ( { open } ) => (
								<div className="imagen-texto-inspector">
									{ imageUrl && (
										<div className="imagen-texto-inspector__preview" onClick={ open }>
											<img src={ imageUrl } alt="" />
										</div>
									) }
									<Button onClick={ open } variant="secondary" style={ { width: '100%' } }>
										{ image
											? __( 'Cambiar imagen', 'factoria-cruzcampo-blocks' )
											: __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
									</Button>
									{ image > 0 && (
										<Button
											onClick={ ( e ) => {
												e.stopPropagation();
												setAttributes( { image: 0 } );
											} }
											variant="tertiary"
											isDestructive
											style={ { width: '100%', marginTop: '4px' } }
										>
											{ __( 'Eliminar imagen', 'factoria-cruzcampo-blocks' ) }
										</Button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-imagen-texto__image">
					{ imageUrl ? (
						<img src={ imageUrl } alt="" />
					) : (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => setAttributes( { image: media.id } ) }
								allowedTypes={ [ 'image' ] }
								value={ image }
								render={ ( { open } ) => (
									<Button
										onClick={ open }
										variant="secondary"
										className="b-imagen-texto__placeholder"
									>
										{ __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					) }
				</div>
				<div className="b-imagen-texto__content">
					<InnerBlocks templateLock={ false } />
				</div>
			</div>
		</>
	);
}
