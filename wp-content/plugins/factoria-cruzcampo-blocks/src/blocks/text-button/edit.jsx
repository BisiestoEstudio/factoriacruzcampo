import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import LinkPicker from '../../components/LinkPicker';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { link } = attributes;

	const blockProps = useBisiestoBlockProps( {} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Botón', 'factoria-cruzcampo-blocks' ) }>
					<LinkPicker
						link={ link }
						onLinkChange={ ( newLink ) => setAttributes( { link: newLink } ) }
						placement="inspector"
						removeLabel={ __( 'Eliminar enlace', 'factoria-cruzcampo-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="b-text-button__content">
					<InnerBlocks templateLock={ false } />
				</div>

				<div className="b-text-button__button">
					{ link?.url ? (
						<span className="b-text-button__link">
							{ link.title || link.url }
						</span>
					) : (
						<span className="b-text-button__placeholder">
							{ __( 'Añadir enlace desde la barra de herramientas ↑', 'factoria-cruzcampo-blocks' ) }
						</span>
					) }
				</div>
			</div>
		</>
	);
}
