import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	withColors,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	__experimentalNumberControl as NumberControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import LinkPicker from '../../components/LinkPicker';
import PaintImage from '../../utils/PaintImage';
import './editor.scss';

function buildClaimFontSize( sizeVw, minPx, maxPx ) {
	if ( minPx && maxPx ) return `clamp(${ minPx }px, ${ sizeVw }vw, ${ maxPx }px)`;
	if ( minPx ) return `max(${ minPx }px, ${ sizeVw }vw)`;
	if ( maxPx ) return `min(${ sizeVw }vw, ${ maxPx }px)`;
	return `${ sizeVw }vw`;
}

function Edit( { attributes, setAttributes, clientId, overlayColor, setOverlayColor } ) {
	const { claim, link, menuId, media, dimRatio, claimFontSize, claimFontSizeMin, claimFontSizeMax } = attributes;
	const blockProps = useBisiestoBlockProps( { className: 'alignfull' } );
	const colorGradientSettings = useMultipleOriginColorsAndGradients();

	const menus = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'root', 'menu', { per_page: -1 } ) ?? [];
	}, [] );

	const selectedMenu = menus?.find( ( m ) => m.id === menuId );

	const menuOptions = [
		{ label: __( '— Sin menú —', 'factoria-cruzcampo-blocks' ), value: 0 },
		...( menus || [] ).map( ( menu ) => ( { label: menu.name, value: menu.id } ) ),
	];

	const isVideo = media?.mediaType === 'video';
	const hasBackground = isVideo ? !! media?.videoUrl : !! media?.imageId;
	const hasOverlay = !! overlayColor?.color;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Fondo', 'factoria-cruzcampo-blocks' ) }>
					<MediaPicker
						mode="both"
						mediaType={ media?.mediaType ?? 'image' }
						onMediaTypeChange={ ( val ) => setAttributes( { media: { ...media, mediaType: val } } ) }
						imageId={ media?.imageId ?? 0 }
						onImageChange={ ( id ) => setAttributes( { media: { ...media, imageId: id } } ) }
						videoUrl={ media?.videoUrl ?? '' }
						onVideoUrlChange={ ( url ) => setAttributes( { media: { ...media, videoUrl: url } } ) }
						posterId={ media?.posterId ?? 0 }
						onPosterChange={ ( id ) => setAttributes( { media: { ...media, posterId: id } } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Botón CTA', 'factoria-cruzcampo-blocks' ) }>
					<LinkPicker
						link={ link }
						onLinkChange={ ( val ) => setAttributes( { link: val } ) }
						placement="inspector"
					/>
				</PanelBody>
				<PanelBody title={ __( 'Menú', 'factoria-cruzcampo-blocks' ) }>
					<SelectControl
						label={ __( 'Seleccionar menú', 'factoria-cruzcampo-blocks' ) }
						value={ menuId }
						options={ menuOptions }
						onChange={ ( val ) => setAttributes( { menuId: parseInt( val, 10 ) } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Tipografía del claim', 'factoria-cruzcampo-blocks' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Tamaño (vw)', 'factoria-cruzcampo-blocks' ) }
						value={ claimFontSize ?? 11 }
						onChange={ ( val ) => setAttributes( { claimFontSize: val } ) }
						min={ 1 }
						max={ 30 }
						step={ 0.5 }
						__next40pxDefaultSize
					/>
					<NumberControl
						label={ __( 'Mínimo (px)', 'factoria-cruzcampo-blocks' ) }
						value={ claimFontSizeMin ?? '' }
						onChange={ ( val ) => {
							const n = parseInt( val, 10 );
							setAttributes( { claimFontSizeMin: isNaN( n ) ? undefined : n } );
						} }
						min={ 8 }
						step={ 4 }
						__next40pxDefaultSize
					/>
					<NumberControl
						label={ __( 'Máximo (px)', 'factoria-cruzcampo-blocks' ) }
						value={ claimFontSizeMax ?? '' }
						onChange={ ( val ) => {
							const n = parseInt( val, 10 );
							setAttributes( { claimFontSizeMax: isNaN( n ) ? undefined : n } );
						} }
						min={ 32 }
						step={ 4 }
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>

			{ colorGradientSettings.hasColorsOrGradients && (
				<InspectorControls group="color">
					<ColorGradientSettingsDropdown
						__experimentalIsRenderedInSidebar
						settings={ [ {
							colorValue: overlayColor?.color,
							label: __( 'Overlay', 'factoria-cruzcampo-blocks' ),
							onColorChange: setOverlayColor,
							isShownByDefault: true,
							resetAllFilter: () => ( {
								overlayColor: undefined,
								customOverlayColor: undefined,
							} ),
							clearable: true,
						} ] }
						panelId={ clientId }
						{ ...colorGradientSettings }
					/>
					<ToolsPanelItem
						hasValue={ () => dimRatio !== undefined && dimRatio !== 50 }
						label={ __( 'Overlay opacity', 'factoria-cruzcampo-blocks' ) }
						onDeselect={ () => setAttributes( { dimRatio: 50 } ) }
						resetAllFilter={ () => ( { dimRatio: 50 } ) }
						isShownByDefault
						panelId={ clientId }
					>
						<RangeControl
							label={ __( 'Overlay opacity', 'factoria-cruzcampo-blocks' ) }
							value={ dimRatio ?? 50 }
							onChange={ ( val ) => setAttributes( { dimRatio: val } ) }
							min={ 0 }
							max={ 100 }
							step={ 10 }
							__next40pxDefaultSize
						/>
					</ToolsPanelItem>
				</InspectorControls>
			) }

			<section { ...blockProps }>
				<div className="b-hero__bg">
					{ isVideo && media?.videoUrl ? (
						<video
							className="b-hero__bg-video"
							src={ media.videoUrl }
							muted
							loop
							autoPlay
							playsInline
						/>
					) : (
						<PaintImage image={ media?.imageId ?? 0 } className="b-hero__bg-img" />
					) }
					{ ! hasBackground && (
						<div className="b-hero__bg-placeholder">
							{ __( 'Selecciona un fondo desde el panel lateral', 'factoria-cruzcampo-blocks' ) }
						</div>
					) }
					{ hasOverlay && (
						<div
							className="b-hero__overlay"
							style={ {
								backgroundColor: overlayColor.color,
								opacity: ( dimRatio ?? 50 ) / 100,
							} }
						/>
					) }
				</div>

				<div className="b-hero__content alignexpand">
					<RichText
						tagName="h1"
						className="b-hero__claim"
						style={ { fontSize: buildClaimFontSize( claimFontSize ?? 11, claimFontSizeMin, claimFontSizeMax ) } }
						value={ claim }
						onChange={ ( val ) => setAttributes( { claim: val } ) }
						placeholder={ __( 'Escribe el claim…', 'factoria-cruzcampo-blocks' ) }
						allowedFormats={ [] }
					/>
				</div>

				<div className="b-hero__bottom">
					{ link?.url ? (
						<span className="b-hero__cta">
							<span>{ link.title || __( 'Reserva ahora', 'factoria-cruzcampo-blocks' ) }</span>
							<span aria-hidden="true">↗</span>
						</span>
					) : (
						<span className="b-hero__cta b-hero__cta--empty">
							{ __( 'Añade un enlace CTA', 'factoria-cruzcampo-blocks' ) }
						</span>
					) }
					<div className="b-hero__nav-preview">
						{ selectedMenu ? (
							<span className="b-hero__nav-label">
								{ __( 'Menú:', 'factoria-cruzcampo-blocks' ) }{ ' ' }
								<em>{ selectedMenu.name }</em>
							</span>
						) : (
							<span className="b-hero__nav-empty">
								{ __( 'Selecciona un menú en el panel lateral', 'factoria-cruzcampo-blocks' ) }
							</span>
						) }
					</div>
				</div>
			</section>
		</>
	);
}

export default withColors( { overlayColor: 'background-color' } )( Edit );
