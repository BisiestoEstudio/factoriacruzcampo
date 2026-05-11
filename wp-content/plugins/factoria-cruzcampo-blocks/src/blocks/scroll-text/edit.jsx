import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, RangeControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import './editor.scss';

const REPEAT = 5;
const SEP = ' · ';

function MediaPreview( { media } ) {
	const { mediaType, imageId, videoUrl, posterId } = media;

	const imageUrl = useSelect(
		( select ) => {
			if ( mediaType !== 'image' || ! imageId ) return null;
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ mediaType, imageId ]
	);

	const posterUrl = useSelect(
		( select ) => {
			if ( ! posterId ) return null;
			return select( coreStore ).getMedia( posterId )?.source_url ?? null;
		},
		[ posterId ]
	);

	if ( mediaType === 'video' && videoUrl ) {
		return (
			<video
				src={ videoUrl }
				poster={ posterUrl || undefined }
				muted
				loop
				autoPlay
				playsInline
			/>
		);
	}

	if ( imageUrl ) {
		return <img src={ imageUrl } alt="" />;
	}

	return null;
}

export default function Edit( { attributes, setAttributes } ) {
	const { text1, text2, text3, speed1, speed2, speed3, media1, media2 } = attributes;

	const blockProps = useBisiestoBlockProps( { className: 'alignfull' } );

	const bands = [
		{ text: text1 || __( 'Texto banda 1', 'factoria-cruzcampo-blocks' ), invert: false },
		{ text: text2 || __( 'Texto banda 2', 'factoria-cruzcampo-blocks' ), invert: true },
		{ text: text3 || __( 'Texto banda 3', 'factoria-cruzcampo-blocks' ), invert: false },
	];

	const hasMedia1 = media1.imageId || media1.videoUrl;
	const hasMedia2 = media2.imageId || media2.videoUrl;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Banda 1', 'factoria-cruzcampo-blocks' ) }>
					<TextControl
						label={ __( 'Texto', 'factoria-cruzcampo-blocks' ) }
						value={ text1 }
						onChange={ ( value ) => setAttributes( { text1: value } ) }
					/>
					<RangeControl
						label={ __( 'Velocidad', 'factoria-cruzcampo-blocks' ) }
						value={ speed1 }
						onChange={ ( value ) => setAttributes( { speed1: value } ) }
						min={ -5 }
						max={ 5 }
						step={ 1 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Banda 2', 'factoria-cruzcampo-blocks' ) }>
					<TextControl
						label={ __( 'Texto', 'factoria-cruzcampo-blocks' ) }
						value={ text2 }
						onChange={ ( value ) => setAttributes( { text2: value } ) }
					/>
					<RangeControl
						label={ __( 'Velocidad', 'factoria-cruzcampo-blocks' ) }
						value={ speed2 }
						onChange={ ( value ) => setAttributes( { speed2: value } ) }
						min={ -5 }
						max={ 5 }
						step={ 1 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Banda 3', 'factoria-cruzcampo-blocks' ) }>
					<TextControl
						label={ __( 'Texto', 'factoria-cruzcampo-blocks' ) }
						value={ text3 }
						onChange={ ( value ) => setAttributes( { text3: value } ) }
					/>
					<RangeControl
						label={ __( 'Velocidad', 'factoria-cruzcampo-blocks' ) }
						value={ speed3 }
						onChange={ ( value ) => setAttributes( { speed3: value } ) }
						min={ -5 }
						max={ 5 }
						step={ 1 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Media 1', 'factoria-cruzcampo-blocks' ) }>
					<MediaPicker
						mode="both"
						mediaType={ media1.mediaType }
						onMediaTypeChange={ ( val ) =>
							setAttributes( { media1: { ...media1, mediaType: val } } )
						}
						imageId={ media1.imageId }
						onImageChange={ ( id ) =>
							setAttributes( { media1: { ...media1, imageId: id } } )
						}
						videoUrl={ media1.videoUrl }
						onVideoUrlChange={ ( url ) =>
							setAttributes( { media1: { ...media1, videoUrl: url } } )
						}
						posterId={ media1.posterId }
						onPosterChange={ ( id ) =>
							setAttributes( { media1: { ...media1, posterId: id } } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Media 2', 'factoria-cruzcampo-blocks' ) }>
					<MediaPicker
						mode="both"
						mediaType={ media2.mediaType }
						onMediaTypeChange={ ( val ) =>
							setAttributes( { media2: { ...media2, mediaType: val } } )
						}
						imageId={ media2.imageId }
						onImageChange={ ( id ) =>
							setAttributes( { media2: { ...media2, imageId: id } } )
						}
						videoUrl={ media2.videoUrl }
						onVideoUrlChange={ ( url ) =>
							setAttributes( { media2: { ...media2, videoUrl: url } } )
						}
						posterId={ media2.posterId }
						onPosterChange={ ( id ) =>
							setAttributes( { media2: { ...media2, posterId: id } } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="b-scroll-text__bands">
					{ bands.map( ( { text, invert }, i ) => (
						<div
							key={ i }
							className={ `b-scroll-text__band${ invert ? ' b-scroll-text__band--invert' : '' }` }
						>
							{ Array.from( { length: REPEAT }, ( _, j ) => (
								<div key={ j } className="b-scroll-text__track">
									<span className="b-scroll-text__text">
										{ text }
									</span>
									<span
										className="b-scroll-text__sep"
										aria-hidden="true"
									>
										{ SEP }
									</span>
								</div>
							) ) }
						</div>
					) ) }
				</div>

				<div className="b-scroll-text__media b-scroll-text__media--1">
					{ hasMedia1 ? (
						<MediaPreview media={ media1 } />
					) : (
						<div className="b-scroll-text__placeholder">
							{ __( 'Media 1', 'factoria-cruzcampo-blocks' ) }
						</div>
					) }
				</div>

				<div className="b-scroll-text__media b-scroll-text__media--2">
					{ hasMedia2 ? (
						<MediaPreview media={ media2 } />
					) : (
						<div className="b-scroll-text__placeholder">
							{ __( 'Media 2', 'factoria-cruzcampo-blocks' ) }
						</div>
					) }
				</div>
			</section>
		</>
	);
}
