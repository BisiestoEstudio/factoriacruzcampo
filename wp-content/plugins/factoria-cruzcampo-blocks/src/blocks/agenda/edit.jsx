import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export default function Edit( { attributes, setAttributes } ) {
	const { title, daysPerPage } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Título', 'factoria-cruzcampo-blocks' ) }>
					<TextControl
						label={ __( 'Título', 'factoria-cruzcampo-blocks' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Paginación', 'factoria-cruzcampo-blocks' ) }>
					<NumberControl
						label={ __( 'Número de días mostrados', 'factoria-cruzcampo-blocks' ) }
						help={ __( 'Vacío para mostrar todos los días de una vez.', 'factoria-cruzcampo-blocks' ) }
						min={ 0 }
						value={ daysPerPage || '' }
						onChange={ ( value ) =>
							setAttributes( { daysPerPage: value ? parseInt( value, 10 ) : 0 } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<ServerSideRender
					block="bisiesto/agenda"
					attributes={ attributes }
				/>
			</div>
		</>
	);
}
