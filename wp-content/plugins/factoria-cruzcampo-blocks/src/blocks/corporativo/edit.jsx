import { __ } from '@wordpress/i18n';
import { useRef, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import starUrl from '../../../assets/images/corporative-star.svg';
import gifUrl from '../../../assets/images/gif_cerveza.gif';

function useImageUrl( imageId ) {
	return useSelect(
		( select ) => {
			if ( ! imageId ) return null;
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ imageId ]
	);
}

function Preview1() {
	return (
		<div className="b-corporativo-1__inner alignfull has-global-padding">
			<span>FACTORÍA</span>
			<img
				className="b-corporativo-1__star"
				src={ starUrl }
				alt=""
				aria-hidden="true"
			/>
			<span>CRUZCAMPO</span>
		</div>
	);
}

function Preview2() {
	return (
		<>
			<span>FACTORÍA</span>
			<img
				className="b-corporativo-2__image"
				src={ gifUrl }
				alt=""
				aria-hidden="true"
				width="347"
				height="286"
			/>
			<span>CRUZCAMPO</span>
		</>
	);
}

function Preview3( { media } ) {
	const canvasRef = useRef( null );
	const imageUrl  = useImageUrl( media?.imageId || 0 );
	const posterUrl = useImageUrl( media?.posterId || 0 );

	useEffect( () => {
		const canvas = canvasRef.current;
		if ( ! canvas ) return;

		const ctx = canvas.getContext( '2d' );
		const doc = canvas.ownerDocument;
		const red =
			getComputedStyle( doc.documentElement )
				.getPropertyValue( '--red' )
				.trim() || '#d71920';

		function getLayoutMargin() {
			const el = doc.createElement( 'div' );
			el.style.cssText =
				'position:absolute;visibility:hidden;width:var(--layout-margin)';
			doc.body.appendChild( el );
			const value = parseFloat( getComputedStyle( el ).width ) || 0;
			el.remove();
			return value;
		}

		function draw() {
			const dpr       = window.devicePixelRatio || 1;
			const cssWidth  = canvas.offsetWidth;
			const cssHeight = canvas.offsetHeight;
			if ( ! cssWidth || ! cssHeight ) return;

			canvas.width  = cssWidth * dpr;
			canvas.height = cssHeight * dpr;
			ctx.scale( dpr, dpr );

			ctx.fillStyle = red;
			ctx.fillRect( 0, 0, cssWidth, cssHeight );

			const margin     = getLayoutMargin();
			const availWidth = cssWidth - 2 * margin;
			ctx.font = '100px Gobold, sans-serif';
			const fontSize = Math.floor(
				( 100 * availWidth ) / ctx.measureText( 'FACTORÍA' ).width
			);

			ctx.globalCompositeOperation = 'destination-out';
			ctx.font         = `${ fontSize }px Gobold, sans-serif`;
			ctx.textAlign    = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle    = '#000';
			ctx.fillText( 'FACTORÍA', cssWidth / 2, cssHeight / 2 );
		}

		const observer = new ResizeObserver( draw );
		doc.fonts.ready.then( () => {
			draw();
			observer.observe( canvas );
		} );

		return () => observer.disconnect();
	}, [] );

	return (
		<>
			<div className="b-corporativo-3__media">
				{ media?.mediaType === 'video' && media?.videoUrl ? (
					<video
						className="c-media__item"
						src={ media.videoUrl }
						poster={ posterUrl || undefined }
						muted
						playsInline
						loop
						autoPlay
					/>
				) : imageUrl ? (
					<img className="c-media__item" src={ imageUrl } alt="" />
				) : null }
			</div>
			<canvas
				ref={ canvasRef }
				className="b-corporativo-3__mask"
				aria-hidden="true"
			/>
		</>
	);
}

const OPTION_CLASSES = {
	'1': 'b-corporativo-1 has-red-background-color alignfull has-white-color',
	'2': 'b-corporativo-2 alignwide has-global-padding has-red-color has-display-s-font-size',
	'3': 'b-corporativo-3 alignfull',
};

export default function Edit( { attributes, setAttributes } ) {
	const { option, media } = attributes;
	const blockProps = useBisiestoBlockProps( {
		className: OPTION_CLASSES[ option ] || OPTION_CLASSES[ '1' ],
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Variante', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __(
							'Tipo de contenido',
							'factoria-cruzcampo-blocks'
						) }
						value={ option }
						options={ [
							{
								label: __(
									'Opción 1',
									'factoria-cruzcampo-blocks'
								),
								value: '1',
							},
							{
								label: __(
									'Opción 2',
									'factoria-cruzcampo-blocks'
								),
								value: '2',
							},
							{
								label: __(
									'Opción 3',
									'factoria-cruzcampo-blocks'
								),
								value: '3',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { option: value } )
						}
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
									media: { ...media, mediaType },
								} )
							}
							imageId={ media?.imageId || 0 }
							onImageChange={ ( imageId ) =>
								setAttributes( {
									media: { ...media, imageId },
								} )
							}
							videoUrl={ media?.videoUrl || '' }
							onVideoUrlChange={ ( videoUrl ) =>
								setAttributes( {
									media: { ...media, videoUrl },
								} )
							}
							posterId={ media?.posterId || 0 }
							onPosterChange={ ( posterId ) =>
								setAttributes( {
									media: { ...media, posterId },
								} )
							}
						/>
					</PanelBody>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				{ option === '1' && <Preview1 /> }
				{ option === '2' && <Preview2 /> }
				{ option === '3' && <Preview3 media={ media } /> }
			</div>
		</>
	);
}
