import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody, Button } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import PaintImage from '../../utils/PaintImage';

export default function Edit( { attributes, setAttributes } ) {
	const { logoId } = attributes;
	const blockProps = useBisiestoBlockProps( { className: 'alignfull' } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Logo', 'factoria-cruzcampo-blocks' ) }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { logoId: media.id } ) }
							allowedTypes={ [ 'image' ] }
							value={ logoId }
							render={ ( { open } ) => (
								<Button onClick={ open } variant="secondary">
									{ logoId
										? __( 'Cambiar logo', 'factoria-cruzcampo-blocks' )
										: __( 'Seleccionar logo', 'factoria-cruzcampo-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<header { ...blockProps }>
				<div className="b-offset-menu__bar">
					<div className="b-offset-menu__logo">
						{ logoId ? (
							<PaintImage image={ logoId } className="b-offset-menu__logo-img" />
						) : (
							<span className="b-offset-menu__logo-placeholder">
								{ __( 'Logo', 'factoria-cruzcampo-blocks' ) }
							</span>
						) }
					</div>

					<div className="b-offset-menu__toggle is-preview">
						<span className="b-offset-menu__toggle-label">
							{ __( 'Menú', 'factoria-cruzcampo-blocks' ) }
						</span>
						<span className="b-offset-menu__toggle-icon" aria-hidden="true">
							<span></span>
							<span></span>
						</span>
					</div>
				</div>

				<div className="b-offset-menu__panel-preview">
					<div className="b-offset-menu__panel-inner">
						<InnerBlocks templateLock={ false } />
					</div>
				</div>
			</header>
		</>
	);
}
