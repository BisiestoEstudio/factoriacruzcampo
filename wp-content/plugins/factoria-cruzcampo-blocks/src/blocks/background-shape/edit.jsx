import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	__experimentalUnitControl as UnitControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import MediaPicker from '../../components/MediaPicker';
import './editor.scss';

const SIZE_UNITS = [
	{ value: 'px', label: 'px' },
	{ value: '%', label: '%' },
];

const OFFSET_UNITS = [ 'px', '%', 'vh', 'vw' ];

const OFFSET_RANGES = {
	px: { min: -300, max: 300 },
	'%': { min: -100, max: 100 },
	vh: { min: -100, max: 100 },
	vw: { min: -100, max: 100 },
};

const ANCHOR_POINTS = [
	'top-left',
	'top-center',
	'top-right',
	'middle-left',
	'middle-center',
	'middle-right',
	'bottom-left',
	'bottom-center',
	'bottom-right',
];

function AnchorPicker( { value, onChange } ) {
	return (
		<div className="bs-anchor-picker">
			{ ANCHOR_POINTS.map( ( point ) => (
				<button
					key={ point }
					type="button"
					className={ `bs-anchor-picker__dot${
						value === point ? ' is-active' : ''
					}` }
					onClick={ () => onChange( point ) }
					aria-label={ point }
					aria-pressed={ value === point }
				/>
			) ) }
		</div>
	);
}

function OffsetControl( { label, value, onChange } ) {
	const { value: numVal, unit } = value;
	const range = OFFSET_RANGES[ unit ] || OFFSET_RANGES.px;

	return (
		<div className="bs-offset-control">
			<div className="bs-offset-control__header">
				<span className="bs-offset-control__label">{ label }</span>
				<div className="bs-offset-control__units">
					{ OFFSET_UNITS.map( ( u ) => (
						<button
							key={ u }
							type="button"
							className={ `bs-offset-control__unit-btn${
								unit === u ? ' is-active' : ''
							}` }
							onClick={ () => onChange( { value: 0, unit: u } ) }
						>
							{ u }
						</button>
					) ) }
				</div>
			</div>
			<RangeControl
				value={ numVal }
				onChange={ ( val ) => onChange( { value: val, unit } ) }
				min={ range.min }
				max={ range.max }
				step={ 1 }
				allowReset
				resetFallbackValue={ 0 }
				withInputField={ true }
			/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { imageId, width, maxWidth, maxHeight, anchor, offsetX, offsetY, rotation } =
		attributes;

	const imageUrl = useSelect(
		( select ) => {
			if ( ! imageId ) return null;
			return select( coreStore ).getMedia( imageId )?.source_url ?? null;
		},
		[ imageId ]
	);

	const blockProps = useBisiestoBlockProps( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ true }
				>
					<MediaPicker
						mode="image-only"
						imageId={ imageId }
						onImageChange={ ( id ) =>
							setAttributes( { imageId: id } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Posición', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ false }
				>
					<p className="bs-anchor-picker__label">
						{ __(
							'Punto de anclaje',
							'factoria-cruzcampo-blocks'
						) }
					</p>
					<AnchorPicker
						value={ anchor }
						onChange={ ( val ) =>
							setAttributes( { anchor: val } )
						}
					/>
					<OffsetControl
						label={ __(
							'Desplazamiento horizontal',
							'factoria-cruzcampo-blocks'
						) }
						value={ offsetX }
						onChange={ ( val ) =>
							setAttributes( { offsetX: val } )
						}
					/>
					<OffsetControl
						label={ __(
							'Desplazamiento vertical',
							'factoria-cruzcampo-blocks'
						) }
						value={ offsetY }
						onChange={ ( val ) =>
							setAttributes( { offsetY: val } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Tamaño', 'factoria-cruzcampo-blocks' ) }
					initialOpen={ false }
				>
					<UnitControl
						label={ __( 'Ancho', 'factoria-cruzcampo-blocks' ) }
						value={ width }
						onChange={ ( val ) =>
							setAttributes( { width: val ?? '' } )
						}
						units={ SIZE_UNITS }
					/>
					<UnitControl
						label={ __(
							'Ancho máximo',
							'factoria-cruzcampo-blocks'
						) }
						value={ maxWidth }
						onChange={ ( val ) =>
							setAttributes( { maxWidth: val ?? '' } )
						}
						units={ SIZE_UNITS }
					/>
					<UnitControl
						label={ __(
							'Alto máximo',
							'factoria-cruzcampo-blocks'
						) }
						value={ maxHeight }
						onChange={ ( val ) =>
							setAttributes( { maxHeight: val ?? '' } )
						}
						units={ SIZE_UNITS }
					/>
				</PanelBody>

				<PanelBody
					title={ __(
						'Transformación',
						'factoria-cruzcampo-blocks'
					) }
					initialOpen={ false }
				>
					<NumberControl
						label={ __(
							'Rotación (deg)',
							'factoria-cruzcampo-blocks'
						) }
						value={ rotation }
						onChange={ ( val ) =>
							setAttributes( {
								rotation:
									val !== '' ? parseInt( val, 10 ) : 0,
							} )
						}
						min={ -360 }
						max={ 360 }
						step={ 1 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ imageUrl ? (
					<img src={ imageUrl } alt="" />
				) : (
					<div className="b-background-shape__placeholder">
						<span>
							{ __(
								'Background Shape',
								'factoria-cruzcampo-blocks'
							) }
						</span>
						<p>
							{ __(
								'Selecciona una imagen desde el panel lateral',
								'factoria-cruzcampo-blocks'
							) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
