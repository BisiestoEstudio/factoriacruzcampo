import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';

function useImageUrl( imageId ) {
	return useSelect(
		( select ) => {
			if ( ! imageId ) {
				return null;
			}
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ imageId ]
	);
}

function MediaPreview( { media } ) {
	const imageUrl = useImageUrl( media?.imageId || 0 );
	const posterUrl = useImageUrl( media?.posterId || 0 );

	if ( media?.mediaType === 'video' && media?.videoUrl ) {
		return (
			<video
				className="b-corporativo__preview-media"
				src={ media.videoUrl }
				poster={ posterUrl || undefined }
				muted
				playsInline
				loop
				autoPlay
			/>
		);
	}

	if ( imageUrl ) {
		return (
			<img
				className="b-corporativo__preview-media"
				src={ imageUrl }
				alt=""
			/>
		);
	}

	return (
		<div className="b-corporativo__placeholder">
			{ __( 'Selecciona un medio en el panel lateral', 'factoria-cruzcampo-blocks' ) }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { option, media } = attributes;
	const blockProps = useBisiestoBlockProps( {
		className: `b-corporativo--option-${ option }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Variante', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Tipo de contenido', 'factoria-cruzcampo-blocks' ) }
						value={ option }
						options={ [
							{
								label: __( 'Opción 1', 'factoria-cruzcampo-blocks' ),
								value: '1',
							},
							{
								label: __( 'Opción 2', 'factoria-cruzcampo-blocks' ),
								value: '2',
							},
							{
								label: __( 'Opción 3', 'factoria-cruzcampo-blocks' ),
								value: '3',
							},
						] }
						onChange={ ( value ) => setAttributes( { option: value } ) }
					/>
				</PanelBody>

				{ option === '3' && (
					<PanelBody
						title={ __( 'Medio', 'factoria-cruzcampo-blocks' ) }
						initialOpen={ true }
					>
						<MediaPicker
							mode="both"
							mediaType={ media?.mediaType || 'image' }
							onMediaTypeChange={ ( mediaType ) =>
								setAttributes( {
									media: {
										...media,
										mediaType,
									},
								} )
							}
							imageId={ media?.imageId || 0 }
							onImageChange={ ( imageId ) =>
								setAttributes( {
									media: {
										...media,
										imageId,
									},
								} )
							}
							videoUrl={ media?.videoUrl || '' }
							onVideoUrlChange={ ( videoUrl ) =>
								setAttributes( {
									media: {
										...media,
										videoUrl,
									},
								} )
							}
							posterId={ media?.posterId || 0 }
							onPosterChange={ ( posterId ) =>
								setAttributes( {
									media: {
										...media,
										posterId,
									},
								} )
							}
						/>
					</PanelBody>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-corporativo__inner">
					{ option === '3' ? (
						<MediaPreview media={ media } />
					) : (
						<p className="b-corporativo__label">
							{ option === '1'
								? __( 'Opción 1 (contenido pendiente)', 'factoria-cruzcampo-blocks' )
								: __( 'Opción 2 (contenido pendiente)', 'factoria-cruzcampo-blocks' ) }
						</p>
					) }
				</div>
			</div>
		</>
	);
}
