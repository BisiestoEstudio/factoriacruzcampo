import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import LinkPicker from '../../components/LinkPicker';
import PaintImage from '../../utils/PaintImage';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { claim, link, menuId, media } = attributes;
	const blockProps = useBisiestoBlockProps( { className: 'alignfull' } );

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
			</InspectorControls>

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
				</div>

				<div className="b-hero__content">
					<RichText
						tagName="h1"
						className="b-hero__claim"
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
