import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import CF7FormPicker from '../../components/CF7FormPicker';

const ALLOWED_BLOCKS = [ 'core/heading', 'core/paragraph', 'core/spacer' ];

const TEMPLATE = [
	[ 'core/heading', { level: 2, placeholder: __( 'Título', 'factoria-cruzcampo-blocks' ) } ],
	[ 'core/paragraph', { placeholder: __( 'Escribe aquí el contenido...', 'factoria-cruzcampo-blocks' ) } ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { formId } = attributes;

	const blockProps = useBisiestoBlockProps( {
		className: 'alignfull is-layout-constrained',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Formulario', 'factoria-cruzcampo-blocks' ) }>
					<CF7FormPicker
						value={ formId }
						onChange={ ( value ) => setAttributes( { formId: value } ) }
						label={ __( 'Formulario de contacto', 'factoria-cruzcampo-blocks' ) }
						help={ __( 'Selecciona el formulario CF7 que aparecerá en la columna derecha', 'factoria-cruzcampo-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-text-form__wrapper alignwide">
					<div className="b-text-form__content">
						<InnerBlocks
							allowedBlocks={ ALLOWED_BLOCKS }
							template={ TEMPLATE }
							templateLock={ false }
						/>
					</div>
					<div className="b-text-form__form">
						{ formId ? (
							<p className="b-text-form__form-preview">
								{ __( 'Formulario CF7 ID:', 'factoria-cruzcampo-blocks' ) }{ ' ' }
								<strong>{ formId }</strong>
							</p>
						) : (
							<p className="b-text-form__form-placeholder">
								{ __( 'Selecciona un formulario en el panel lateral', 'factoria-cruzcampo-blocks' ) }
							</p>
						) }
					</div>
				</div>
			</div>
		</>
	);
}
