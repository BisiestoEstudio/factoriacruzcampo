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

const CONTENT_SIZE_OPTIONS = [
	{ value: 'expand', label: __('Expand', 'factoria-cruzcampo-blocks') },
	{ value: 'wide', label: __('Wide', 'factoria-cruzcampo-blocks') },
	{ value: 'medium', label: __('Medium', 'factoria-cruzcampo-blocks') },
	{ value: 'content', label: __('Content', 'factoria-cruzcampo-blocks') },
];

export default function Edit( { attributes, setAttributes } ) {
	const { align, gap, style, contentSize } = attributes;

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
			</InspectorControls>
			<div { ...blockProps }>
				<div
					className={ `b-section__content ${ contentClass }` }
					style={ gap ? { '--section-gap': gap } : undefined }
				>
					<InnerBlocks
						templateLock={false}
					/>
				</div>
			</div>
		</>
	);
}
