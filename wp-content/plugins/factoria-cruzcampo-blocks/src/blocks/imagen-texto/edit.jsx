import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
	BlockVerticalAlignmentControl,
} from '@wordpress/block-editor';
import { PanelBody, Button, ButtonGroup } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';

export default function Edit( { attributes, setAttributes } ) {
	const { image, verticalAlignment, imagePosition } = attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! image ) {
				return null;
			}
			return select( coreStore ).getMedia( image )?.source_url ?? null;
		},
		[ image ]
	);

	const blockProps = useBisiestoBlockProps( {
		// Match `render.php` which uses bis_get_block_prop($block, true, ...)
		className: `alignfull is-layout-constrained has-global-padding is-vertically-aligned-${ verticalAlignment } is-image-position-${ imagePosition }`,
	} );

	const variation =
		blockProps.className?.match( /\bis-style-([\w-]+)\b/ )?.[ 1 ] ?? null;
	let variationAlignClasses = 'alignwide';
	if ( variation === 'wide' ) {
		variationAlignClasses = 'alignfull';
	} else if ( variation === 'garabato' ) {
		variationAlignClasses = 'alignmedium';
	}

	return (
		<>
			<BlockControls group="block">
				<BlockVerticalAlignmentControl
					value={ verticalAlignment }
					onChange={ ( value ) =>
						setAttributes( { verticalAlignment: value } )
					}
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }
				>
					<p
						style={ {
							marginBottom: '6px',
							fontSize: '11px',
							fontWeight: 500,
							textTransform: 'uppercase',
							color: '#1e1e1e',
						} }
					>
						{ __(
							'Posición de la imagen',
							'factoria-cruzcampo-blocks'
						) }
					</p>
					<ButtonGroup
						style={ { marginBottom: '16px', width: '100%' } }
					>
						{ [
							{
								label: __(
									'Izquierda',
									'factoria-cruzcampo-blocks'
								),
								value: 'left',
							},
							{
								label: __(
									'Derecha',
									'factoria-cruzcampo-blocks'
								),
								value: 'right',
							},
						].map( ( { label, value } ) => (
							<Button
								key={ value }
								variant={
									imagePosition === value
										? 'primary'
										: 'secondary'
								}
								onClick={ () =>
									setAttributes( { imagePosition: value } )
								}
								style={ {
									width: '50%',
									justifyContent: 'center',
								} }
							>
								{ label }
							</Button>
						) ) }
					</ButtonGroup>

					<MediaPicker
						mode="image-only"
						imageId={ image }
						onImageChange={ ( id ) =>
							setAttributes( { image: id } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div
					className={ `b-imagen-texto__wrapper ${ variationAlignClasses }` }
				>
					<div className="b-imagen-texto__content-wrapper">
						<div className="b-imagen-texto__content is-prose">
							<InnerBlocks templateLock={ false } />
						</div>
					</div>

					<div className="b-imagen-texto__image">
						{ imageUrl ? (
							<img src={ imageUrl } alt="" />
						) : (
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) =>
										setAttributes( { image: media.id } )
									}
									allowedTypes={ [ 'image' ] }
									value={ image }
									render={ ( { open } ) => (
										<Button
											onClick={ open }
											variant="secondary"
											className="b-imagen-texto__placeholder"
										>
											{ __(
												'Seleccionar imagen',
												'factoria-cruzcampo-blocks'
											) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
						) }
					</div>
				</div>
			</div>
		</>
	);
}
