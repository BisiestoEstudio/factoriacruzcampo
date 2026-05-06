import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

const StarIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 64 64"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M32 0L32.5144 1.39018C37.6738 15.3331 48.6669 26.3262 62.6098 31.4856L64 32L62.6098 32.5144C48.6669 37.6738 37.6738 48.6669 32.5144 62.6098L32 64L31.4856 62.6098C26.3262 48.6669 15.3331 37.6738 1.39018 32.5144L0 32L1.39018 31.4856C15.3331 26.3262 26.3262 15.3331 31.4856 1.39018L32 0Z"
			fill="#D71920"
		/>
	</svg>
);

export default function Edit( { attributes, setAttributes } ) {
	const { variation, title, antetitulo } = attributes;

	const blockProps = useBisiestoBlockProps( {
		'data-variation': variation,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Variación', 'factoria-cruzcampo-blocks' ) }
				>
					<SelectControl
						label={ __(
							'Tipo de título',
							'factoria-cruzcampo-blocks'
						) }
						value={ variation }
						options={ [
							{
								label: __(
									'Título con embellecedor',
									'factoria-cruzcampo-blocks'
								),
								value: 'embellecedor',
							},
							{
								label: __(
									'Título con antetítulo',
									'factoria-cruzcampo-blocks'
								),
								value: 'antetitulo',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { variation: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ variation === 'embellecedor' && (
					<div className="b-custom-title__inner b-custom-title__inner--embellecedor">
						<RichText
							tagName="p"
							className="b-custom-title__title"
							value={ title }
							onChange={ ( value ) =>
								setAttributes( { title: value } )
							}
							placeholder={ __(
								'Escribe el título…',
								'factoria-cruzcampo-blocks'
							) }
							allowedFormats={ [] }
						/>
						<div
							className="b-custom-title__star"
							aria-hidden="true"
						>
							<StarIcon />
						</div>
					</div>
				) }
				{ variation === 'antetitulo' && (
					<div className="b-custom-title__inner b-custom-title__inner--antetitulo">
						<RichText
							tagName="p"
							className="b-custom-title__antetitulo"
							value={ antetitulo }
							onChange={ ( value ) =>
								setAttributes( { antetitulo: value } )
							}
							placeholder={ __(
								'Antetítulo…',
								'factoria-cruzcampo-blocks'
							) }
							allowedFormats={ [] }
						/>
						<RichText
							tagName="h2"
							className="b-custom-title__title"
							value={ title }
							onChange={ ( value ) =>
								setAttributes( { title: value } )
							}
							placeholder={ __(
								'Escribe el título…',
								'factoria-cruzcampo-blocks'
							) }
							allowedFormats={ [] }
						/>
					</div>
				) }
			</div>
		</>
	);
}
