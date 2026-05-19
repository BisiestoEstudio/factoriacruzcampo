import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	RadioControl,
	ToggleControl,
	SelectControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import './editor.scss';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import { computeSpacerHeight } from './computeSpacerHeight';

const UNIT_OPTIONS = [
	{ label: 'px', value: 'px' },
	{ label: '%', value: '%' },
	{ label: 'vw', value: 'vw' },
	{ label: 'vh', value: 'vh' },
];

const ValueUnitRow = ( { numberLabel, value, unit, onChangeValue, onChangeUnit } ) => (
	<PanelRow>
		<div style={ { display: 'flex', gap: '8px', alignItems: 'flex-end', width: '100%' } }>
			<div style={ { flex: 2 } }>
				<NumberControl
					label={ numberLabel }
					value={ value }
					onChange={ ( v ) => onChangeValue( parseFloat( v ) || 0 ) }
					min={ 0 }
					step={ 1 }
				/>
			</div>
			<div style={ { flex: 1 } }>
				<SelectControl
					label={ __( 'Unidad', 'unico-blocks' ) }
					value={ unit }
					options={ UNIT_OPTIONS }
					onChange={ onChangeUnit }
				/>
			</div>
		</div>
	</PanelRow>
);

export default function Edit( { attributes, setAttributes } ) {
	const {
		mode,
		height1,
		height2,
		viewport1,
		viewport2,
		fixedValue,
		fixedUnit,
		useMinMax,
		minValue,
		minUnit,
		maxValue,
		maxUnit,
	} = attributes;

	const computed = computeSpacerHeight( attributes );
	const previewHeight = mode === 'value' ? `${ fixedValue }${ fixedUnit }` : `${ height2 }px`;

	const blockProps = useBisiestoBlockProps( {
		style: {
			height: previewHeight,
			minHeight: '30px',
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Altura', 'unico-blocks' ) } initialOpen={ true }>
					<PanelRow>
						<RadioControl
							label={ __( 'Modo', 'unico-blocks' ) }
							selected={ mode }
							options={ [
								{ label: __( 'Valor', 'unico-blocks' ), value: 'value' },
								{ label: __( 'Interpolación', 'unico-blocks' ), value: 'interpolate' },
							] }
							onChange={ ( value ) => setAttributes( { mode: value } ) }
						/>
					</PanelRow>

					{ mode === 'value' && (
						<>
							<ValueUnitRow
								numberLabel={ __( 'Valor', 'unico-blocks' ) }
								value={ fixedValue }
								unit={ fixedUnit }
								onChangeValue={ ( v ) => setAttributes( { fixedValue: v } ) }
								onChangeUnit={ ( v ) => setAttributes( { fixedUnit: v } ) }
							/>
							<PanelRow>
								<ToggleControl
									label={ __( 'Usar mínimo / máximo', 'unico-blocks' ) }
									checked={ useMinMax }
									onChange={ ( v ) => setAttributes( { useMinMax: v } ) }
								/>
							</PanelRow>
							{ useMinMax && (
								<>
									<ValueUnitRow
										numberLabel={ __( 'Mínimo', 'unico-blocks' ) }
										value={ minValue }
										unit={ minUnit }
										onChangeValue={ ( v ) => setAttributes( { minValue: v } ) }
										onChangeUnit={ ( v ) => setAttributes( { minUnit: v } ) }
									/>
									<ValueUnitRow
										numberLabel={ __( 'Máximo', 'unico-blocks' ) }
										value={ maxValue }
										unit={ maxUnit }
										onChangeValue={ ( v ) => setAttributes( { maxValue: v } ) }
										onChangeUnit={ ( v ) => setAttributes( { maxUnit: v } ) }
									/>
								</>
							) }
						</>
					) }

					{ mode === 'interpolate' && (
						<>
							<PanelRow>
								<div style={ { display: 'flex', gap: '8px', width: '100%' } }>
									<NumberControl
										label={ __( 'Altura 1 (px)', 'unico-blocks' ) }
										value={ height1 }
										onChange={ ( v ) => setAttributes( { height1: parseInt( v ) || 0 } ) }
										min={ 0 }
										step={ 1 }
									/>
									<NumberControl
										label={ __( 'Viewport 1 (px)', 'unico-blocks' ) }
										value={ viewport1 }
										onChange={ ( v ) => setAttributes( { viewport1: parseInt( v ) || 500 } ) }
										min={ 1 }
										step={ 1 }
									/>
								</div>
							</PanelRow>
							<PanelRow>
								<div style={ { display: 'flex', gap: '8px', width: '100%' } }>
									<NumberControl
										label={ __( 'Altura 2 (px)', 'unico-blocks' ) }
										value={ height2 }
										onChange={ ( v ) => setAttributes( { height2: parseInt( v ) || 0 } ) }
										min={ 0 }
										step={ 1 }
									/>
									<NumberControl
										label={ __( 'Viewport 2 (px)', 'unico-blocks' ) }
										value={ viewport2 }
										onChange={ ( v ) => setAttributes( { viewport2: parseInt( v ) || 1200 } ) }
										min={ 1 }
										step={ 1 }
									/>
								</div>
							</PanelRow>
						</>
					) }

					<PanelRow>
						<p style={ { color: '#757575', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 } }>
							{ computed }
						</p>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }></div>
		</>
	);
}
