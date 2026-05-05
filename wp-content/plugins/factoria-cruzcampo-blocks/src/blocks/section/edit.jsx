import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import './editor.scss';
import { useEffect } from '@wordpress/element';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';

const CONTENT_SIZE_OPTIONS = [
	{ value: 'expand', label: __('Extra wide', 'factoria-cruzcampo-blocks') },
	{ value: 'wide', label: __('Wide', 'factoria-cruzcampo-blocks') },
	{ value: 'medium', label: __('Medium', 'factoria-cruzcampo-blocks') },
	{ value: 'content', label: __('Content', 'factoria-cruzcampo-blocks') },
];

export default function Edit( { attributes, setAttributes } ) {
	const { align, gap, style, contentSize, backgroundVideo } = attributes;

	const blockProps = useBisiestoBlockProps( {
		className: `align${ align } is-layout-constrained`,
	} );

	const contentClass = `align${contentSize}`;

	useEffect(() => {
		let newBlockGap = gap ?? false;
		if (style?.spacing?.blockGap) {
			newBlockGap = style.spacing.blockGap;
			if (newBlockGap.startsWith('var:')) {
				newBlockGap = newBlockGap.split('|').pop();
				newBlockGap = "var(--wp--preset--spacing--" + newBlockGap + ")";
			}
		}
		setAttributes({ gap: newBlockGap });
	}, [attributes]);

	return (
		<>
			<InspectorControls group="styles">
				<PanelBody title={ __( 'Layout', 'factoria-cruzcampo-blocks' ) } initialOpen={ true }>
					<ToggleGroupControl
						label={ __( 'Content width', 'factoria-cruzcampo-blocks' ) }
						value={ contentSize }
						onChange={ ( value ) => value && setAttributes( { contentSize: value } ) }
						isBlock
					>
						{ CONTENT_SIZE_OPTIONS.map( ( opt ) => (
							<ToggleGroupControlOption
								key={ opt.value }
								value={ opt.value }
								label={ opt.label }
							/>
						) ) }
					</ToggleGroupControl>
				</PanelBody>

				<PanelBody title={ __( 'Vídeo de fondo', 'factoria-cruzcampo-blocks' ) } initialOpen={ false }>
					<MediaPicker
						mode="video-only"
						videoUrl={ backgroundVideo?.url || '' }
						onVideoUrlChange={ ( url ) =>
							setAttributes( { backgroundVideo: { url, posterId: backgroundVideo?.posterId || 0 } } )
						}
						posterId={ backgroundVideo?.posterId || 0 }
						onPosterChange={ ( posterId ) =>
							setAttributes( { backgroundVideo: { url: backgroundVideo?.url || '', posterId } } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ backgroundVideo?.url && (
					<video
						className="b-section__video"
						src={ backgroundVideo.url }
						autoPlay
						muted
						loop
						playsInline
					/>
				) }
				<div
					className={ `b-section__content ${ contentClass }` }
					style={ gap ? { '--section-gap': gap } : undefined }
				>
					<InnerBlocks
						allowedBlocks={[
							'bisiesto/list-item',
							'core/group',
							'core/paragraph',
							'core/heading',
							'bisiesto/cards',
							'bisiesto/card-link',
							'bisiesto/icon-list',
							'core/buttons',
							'core/spacer',
							'core/image',
							'core/gallery',
							'bisiesto/spacer',
							'contact-form-7/contact-form-selector',
							'bisiesto/post-grid',
							'bisiesto/columns',
							'bisiesto/card-carrusel',
							'core/list',
							'core/separator',
							'core/accordion',
							'bisiesto/maps',
							'bisiesto/banner',
						]}
						templateLock={false}
					/>
				</div>
			</div>
		</>
	);
}
