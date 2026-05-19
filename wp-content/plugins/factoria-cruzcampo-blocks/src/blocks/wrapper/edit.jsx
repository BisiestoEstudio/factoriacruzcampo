import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalUnitControl as UnitControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import { justifyLeft, justifyCenter, justifyRight } from '@wordpress/icons';
import { useEffect } from '@wordpress/element';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

const UNITS = [
	{ value: '%', label: '%', default: 0 },
	{ value: 'px', label: 'px', default: 0 },
	{ value: 'rem', label: 'rem', default: 0 },
	{ value: 'vw', label: 'vw', default: 0 },
];

export default function Edit( { attributes, setAttributes } ) {
	const { width, maxWidth, minWidth, justification, gap, style } = attributes;

	useEffect( () => {
		let newGap = gap ?? false;
		if ( style?.spacing?.blockGap ) {
			newGap = style.spacing.blockGap;
			if ( newGap.startsWith( 'var:' ) ) {
				newGap = newGap.split( '|' ).pop();
				newGap = 'var(--wp--preset--spacing--' + newGap + ')';
			}
		}
		setAttributes( { gap: newGap } );
	}, [ attributes ] );

	const inlineStyle = {};
	if ( width ) inlineStyle.width = width;
	if ( maxWidth ) inlineStyle.maxWidth = maxWidth;
	if ( minWidth ) inlineStyle.minWidth = minWidth;
	if ( gap ) inlineStyle[ '--wrapper-gap' ] = gap;

	const blockProps = useBisiestoBlockProps( {
		style: inlineStyle,
		'data-justification': justification,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Dimensiones', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<UnitControl
						label={ __( 'Ancho', 'factoria-cruzcampo-blocks' ) }
						value={ width }
						onChange={ ( value ) =>
							setAttributes( { width: value ?? '' } )
						}
						units={ UNITS }
					/>
					<UnitControl
						label={ __( 'Ancho máximo', 'factoria-cruzcampo-blocks' ) }
						value={ maxWidth }
						onChange={ ( value ) =>
							setAttributes( { maxWidth: value ?? '' } )
						}
						units={ UNITS }
					/>
					<UnitControl
						label={ __( 'Ancho mínimo', 'factoria-cruzcampo-blocks' ) }
						value={ minWidth }
						onChange={ ( value ) =>
							setAttributes( { minWidth: value ?? '' } )
						}
						units={ UNITS }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Alineación', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<ToggleGroupControl
						label={ __(
							'Justificación horizontal',
							'factoria-cruzcampo-blocks'
						) }
						value={ justification }
						onChange={ ( value ) =>
							value && setAttributes( { justification: value } )
						}
						isBlock
					>
						<ToggleGroupControlOptionIcon
							value="left"
							icon={ justifyLeft }
							label={ __( 'Izquierda', 'factoria-cruzcampo-blocks' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="center"
							icon={ justifyCenter }
							label={ __( 'Centro', 'factoria-cruzcampo-blocks' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="right"
							icon={ justifyRight }
							label={ __( 'Derecha', 'factoria-cruzcampo-blocks' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<InnerBlocks templateLock={ false } />
			</div>
		</>
	);
}
