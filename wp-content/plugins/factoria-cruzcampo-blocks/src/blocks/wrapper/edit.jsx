import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalUnitControl as UnitControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

const UNITS = [
	{ value: '%', label: '%', default: 0 },
	{ value: 'px', label: 'px', default: 0 },
	{ value: 'rem', label: 'rem', default: 0 },
	{ value: 'vw', label: 'vw', default: 0 },
];

export default function Edit( { attributes, setAttributes } ) {
	const { width, maxWidth, minWidth, justification } = attributes;

	const inlineStyle = {};
	if ( width ) inlineStyle.width = width;
	if ( maxWidth ) inlineStyle.maxWidth = maxWidth;
	if ( minWidth ) inlineStyle.minWidth = minWidth;

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
							icon={ alignLeft }
							label={ __( 'Izquierda', 'factoria-cruzcampo-blocks' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="center"
							icon={ alignCenter }
							label={ __( 'Centro', 'factoria-cruzcampo-blocks' ) }
						/>
						<ToggleGroupControlOptionIcon
							value="right"
							icon={ alignRight }
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
