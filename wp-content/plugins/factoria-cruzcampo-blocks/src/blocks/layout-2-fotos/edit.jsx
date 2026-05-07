import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import './editor.scss';

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
				className="b-layout-2-fotos__preview-media"
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
				className="b-layout-2-fotos__preview-media"
				src={ imageUrl }
				alt=""
			/>
		);
	}

	return (
		<div className="b-layout-2-fotos__placeholder">
			{ __( 'Selecciona un medio', 'factoria-cruzcampo-blocks' ) }
		</div>
	);
}

function IconPreview( { imageId } ) {
	const imageUrl = useImageUrl( imageId || 0 );
	if ( imageUrl ) {
		return (
			<img
				className="b-layout-2-fotos__preview-icon"
				src={ imageUrl }
				alt=""
			/>
		);
	}
	return <div className="b-layout-2-fotos__placeholder-icon" />;
}

export default function Edit( { attributes, setAttributes } ) {
	const { center1, center2, iconLeft, iconRight } = attributes;

	const blockProps = useBisiestoBlockProps( {
		className: 'alignfull',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Medios centrales', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<p className="b-layout-2-fotos__inspector-label">
						{ __( 'Centro izquierda', 'factoria-cruzcampo-blocks' ) }
					</p>
					<MediaPicker
						mode="both"
						mediaType={ center1?.mediaType || 'image' }
						onMediaTypeChange={ ( mediaType ) =>
							setAttributes( {
								center1: {
									...center1,
									mediaType,
								},
							} )
						}
						imageId={ center1?.imageId || 0 }
						onImageChange={ ( imageId ) =>
							setAttributes( {
								center1: {
									...center1,
									imageId,
								},
							} )
						}
						videoUrl={ center1?.videoUrl || '' }
						onVideoUrlChange={ ( videoUrl ) =>
							setAttributes( {
								center1: {
									...center1,
									videoUrl,
								},
							} )
						}
						posterId={ center1?.posterId || 0 }
						onPosterChange={ ( posterId ) =>
							setAttributes( {
								center1: {
									...center1,
									posterId,
								},
							} )
						}
					/>

					<p className="b-layout-2-fotos__inspector-label">
						{ __( 'Centro derecha', 'factoria-cruzcampo-blocks' ) }
					</p>
					<MediaPicker
						mode="both"
						mediaType={ center2?.mediaType || 'image' }
						onMediaTypeChange={ ( mediaType ) =>
							setAttributes( {
								center2: {
									...center2,
									mediaType,
								},
							} )
						}
						imageId={ center2?.imageId || 0 }
						onImageChange={ ( imageId ) =>
							setAttributes( {
								center2: {
									...center2,
									imageId,
								},
							} )
						}
						videoUrl={ center2?.videoUrl || '' }
						onVideoUrlChange={ ( videoUrl ) =>
							setAttributes( {
								center2: {
									...center2,
									videoUrl,
								},
							} )
						}
						posterId={ center2?.posterId || 0 }
						onPosterChange={ ( posterId ) =>
							setAttributes( {
								center2: {
									...center2,
									posterId,
								},
							} )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Iconos laterales', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ false }
				>
					<p className="b-layout-2-fotos__inspector-label">
						{ __( 'Icono izquierdo', 'factoria-cruzcampo-blocks' ) }
					</p>
					<MediaPicker
						mode="image-only"
						imageId={ iconLeft || 0 }
						onImageChange={ ( imageId ) =>
							setAttributes( { iconLeft: imageId } )
						}
					/>

					<p className="b-layout-2-fotos__inspector-label">
						{ __( 'Icono derecho', 'factoria-cruzcampo-blocks' ) }
					</p>
					<MediaPicker
						mode="image-only"
						imageId={ iconRight || 0 }
						onImageChange={ ( imageId ) =>
							setAttributes( { iconRight: imageId } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-layout-2-fotos">
					<div className="b-layout-2-fotos__grid">
						<div className="b-layout-2-fotos__icon b-layout-2-fotos__icon--left">
							<IconPreview imageId={ iconLeft } />
						</div>

						<div className="b-layout-2-fotos__media b-layout-2-fotos__media--1">
							<MediaPreview media={ center1 } />
						</div>

						<div className="b-layout-2-fotos__media b-layout-2-fotos__media--2">
							<MediaPreview media={ center2 } />
						</div>

						<div className="b-layout-2-fotos__icon b-layout-2-fotos__icon--right">
							<IconPreview imageId={ iconRight } />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

