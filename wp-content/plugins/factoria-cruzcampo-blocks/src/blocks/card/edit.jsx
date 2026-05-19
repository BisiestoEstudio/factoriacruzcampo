import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls, MediaUpload, MediaUploadCheck, RichText } from '@wordpress/block-editor';
import { PanelBody, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import LinkPicker from '../../components/LinkPicker/LinkPicker';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'core/paragraph', 'core/heading', 'core/image' ];

const TEMPLATE = [
	[ 'core/paragraph', { placeholder: __( 'Inserte texto...', 'factoria-cruzcampo-blocks' ) } ],
];

export default function Edit( { attributes, setAttributes, context } ) {
	const { image, link, cardTitle } = attributes;
	const cardType = context[ 'bisiesto/cardType' ] ?? 'card-image';
	const showImage = cardType === 'card-image';
	const showTitle = cardType === 'card-square';
	const blockProps = useBisiestoBlockProps( {} );

	const imageUrl = useSelect(
		( select ) =>
			image ? select( coreStore ).getMedia( image )?.source_url : null,
		[ image ]
	);

	return (
		<>
			<LinkPicker
				link={ link }
				onLinkChange={ ( value ) => setAttributes( { link: value } ) }
			/>

			{ showImage && (
				<InspectorControls>
					<PanelBody title={ __( 'Imagen', 'factoria-cruzcampo-blocks' ) }>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => setAttributes( { image: media.id } ) }
								allowedTypes={ [ 'image' ] }
								value={ image }
								render={ ( { open } ) => (
									<div className="b-card__inspector-image">
										{ imageUrl ? (
											<>
												<img
													src={ imageUrl }
													alt=""
													className="b-card__inspector-preview"
													onClick={ open }
												/>
												<Button onClick={ open } variant="secondary">
													{ __( 'Cambiar imagen', 'factoria-cruzcampo-blocks' ) }
												</Button>
											</>
										) : (
											<Button onClick={ open } variant="secondary">
												{ __( 'Seleccionar imagen', 'factoria-cruzcampo-blocks' ) }
											</Button>
										) }
									</div>
								) }
							/>
						</MediaUploadCheck>
						{ image > 0 && (
							<Button
								onClick={ () => setAttributes( { image: 0 } ) }
								variant="tertiary"
								isDestructive
								className="b-card__inspector-remove"
							>
								{ __( 'Eliminar imagen', 'factoria-cruzcampo-blocks' ) }
							</Button>
						) }
					</PanelBody>
				</InspectorControls>
			) }

			<div { ...blockProps }>
				{ showImage && (
					<div className={ `b-card__image${ ! imageUrl ? ' b-card__image--empty' : '' }` }>
						{ imageUrl ? (
							<img src={ imageUrl } alt="" />
						) : (
							<span>{ __( 'Seleccionar imagen en el panel lateral', 'factoria-cruzcampo-blocks' ) }</span>
						) }
					</div>
				) }

				{ showTitle && (
					<RichText
						tagName="h3"
						className="b-card__title"
						value={ cardTitle }
						onChange={ ( value ) => setAttributes( { cardTitle: value } ) }
						placeholder={ __( 'Título', 'factoria-cruzcampo-blocks' ) }
						allowedFormats={ [] }
					/>
				) }

				<div className="b-card__content">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ TEMPLATE }
						templateLock={ false }
					/>
				</div>
			</div>
		</>
	);
}
