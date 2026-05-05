import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, ToggleControl, TextControl } from '@wordpress/components';
import './MediaPicker.scss';

function ImageSelector( { imageId, onImageChange } ) {
	const imageUrl = useSelect(
		( select ) => {
			if ( ! imageId ) return null;
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ imageId ]
	);

	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ ( media ) => onImageChange( media.id ) }
				allowedTypes={ [ 'image' ] }
				value={ imageId }
				render={ ( { open } ) => (
					<div className="media-picker__selector">
						{ imageUrl && (
							<div className="media-picker__preview" onClick={ open }>
								<img src={ imageUrl } alt="" />
							</div>
						) }
						<Button onClick={ open } variant="secondary" style={ { width: '100%' } }>
							{ imageId
								? __( 'Cambiar imagen', 'factoria-cruzcampo-blocks' )
								: __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
						</Button>
						{ imageId > 0 && (
							<Button
								onClick={ ( e ) => {
									e.stopPropagation();
									onImageChange( 0 );
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
	);
}

function VideoSelector( { videoUrl, onVideoUrlChange, posterId, onPosterChange } ) {
	const posterUrl = useSelect(
		( select ) => {
			if ( ! posterId ) return null;
			return select( coreStore ).getMedia( posterId )?.source_url ?? null;
		},
		[ posterId ]
	);

	return (
		<div className="media-picker__video">
			<TextControl
				label={ __( 'URL del vídeo', 'factoria-cruzcampo-blocks' ) }
				value={ videoUrl }
				onChange={ onVideoUrlChange }
				placeholder="https://"
			/>
			<p className="media-picker__poster-label">
				{ __( 'Póster', 'factoria-cruzcampo-blocks' ) }
			</p>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( media ) => onPosterChange( media.id ) }
					allowedTypes={ [ 'image' ] }
					value={ posterId }
					render={ ( { open } ) => (
						<div className="media-picker__selector">
							{ posterUrl && (
								<div className="media-picker__preview" onClick={ open }>
									<img src={ posterUrl } alt="" />
								</div>
							) }
							<Button onClick={ open } variant="secondary" style={ { width: '100%' } }>
								{ posterId
									? __( 'Cambiar póster', 'factoria-cruzcampo-blocks' )
									: __( 'Seleccionar póster', 'factoria-cruzcampo-blocks' ) }
							</Button>
							{ posterId > 0 && (
								<Button
									onClick={ ( e ) => {
										e.stopPropagation();
										onPosterChange( 0 );
									} }
									variant="tertiary"
									isDestructive
									style={ { width: '100%', marginTop: '4px' } }
								>
									{ __( 'Eliminar póster', 'factoria-cruzcampo-blocks' ) }
								</Button>
							) }
						</div>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}

export default function MediaPicker( {
	mode = 'both',
	mediaType = 'image',
	onMediaTypeChange,
	imageId = 0,
	onImageChange,
	videoUrl = '',
	onVideoUrlChange,
	posterId = 0,
	onPosterChange,
} ) {
	const showToggle = mode === 'both';
	const showImage  = mode === 'image-only' || ( mode === 'both' && mediaType === 'image' );
	const showVideo  = mode === 'video-only' || ( mode === 'both' && mediaType === 'video' );

	return (
		<div className="media-picker">
			{ showToggle && (
				<ToggleControl
					label={ mediaType === 'image'
						? __( 'Imagen', 'factoria-cruzcampo-blocks' )
						: __( 'Vídeo', 'factoria-cruzcampo-blocks' ) }
					checked={ mediaType === 'video' }
					onChange={ ( val ) => onMediaTypeChange( val ? 'video' : 'image' ) }
				/>
			) }
			{ showImage && (
				<ImageSelector
					imageId={ imageId }
					onImageChange={ onImageChange }
				/>
			) }
			{ showVideo && (
				<VideoSelector
					videoUrl={ videoUrl }
					onVideoUrlChange={ onVideoUrlChange }
					posterId={ posterId }
					onPosterChange={ onPosterChange }
				/>
			) }
		</div>
	);
}
