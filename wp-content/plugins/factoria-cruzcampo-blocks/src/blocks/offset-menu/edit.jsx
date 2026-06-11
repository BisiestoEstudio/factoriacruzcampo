import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	Button,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import PaintImage from '../../utils/PaintImage';

export default function Edit( { attributes, setAttributes } ) {
	const { logoId, logoUrl, menuId, ctaButtons } = attributes;
	const blockProps = useBisiestoBlockProps( { className: 'alignfull' } );

	const menus = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'root', 'menu', { per_page: -1 } ) ?? [];
	}, [] );

	const menuOptions = [
		{ label: __( '— Sin menú —', 'factoria-cruzcampo-blocks' ), value: 0 },
		...( menus || [] ).map( ( menu ) => ( { label: menu.name, value: menu.id } ) ),
	];

	const selectedMenu = menus?.find( ( m ) => m.id === menuId );

	function updateCta( index, field, value ) {
		const updated = ctaButtons.map( ( btn, i ) =>
			i === index ? { ...btn, [ field ]: value } : btn
		);
		setAttributes( { ctaButtons: updated } );
	}

	function addCta() {
		if ( ctaButtons.length >= 3 ) return;
		setAttributes( { ctaButtons: [ ...ctaButtons, { label: '', url: '', target: '' } ] } );
	}

	function removeCta( index ) {
		setAttributes( { ctaButtons: ctaButtons.filter( ( _, i ) => i !== index ) } );
	}

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
								<Button onClick={ open } variant="secondary" style={ { marginBottom: '8px' } }>
									{ logoId
										? __( 'Cambiar logo', 'factoria-cruzcampo-blocks' )
										: __( 'Seleccionar logo', 'factoria-cruzcampo-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					<TextControl
						label={ __( 'URL del logo', 'factoria-cruzcampo-blocks' ) }
						value={ logoUrl }
						onChange={ ( val ) => setAttributes( { logoUrl: val } ) }
						placeholder="/"
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Menú de navegación', 'factoria-cruzcampo-blocks' ) }>
					<SelectControl
						label={ __( 'Seleccionar menú', 'factoria-cruzcampo-blocks' ) }
						value={ menuId }
						options={ menuOptions }
						onChange={ ( val ) => setAttributes( { menuId: parseInt( val, 10 ) } ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Botones CTA', 'factoria-cruzcampo-blocks' ) }>
					{ ctaButtons.map( ( btn, index ) => (
						<div key={ index } style={ { marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '12px' } }>
							<TextControl
								label={ __( 'Texto', 'factoria-cruzcampo-blocks' ) }
								value={ btn.label }
								onChange={ ( val ) => updateCta( index, 'label', val ) }
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'URL', 'factoria-cruzcampo-blocks' ) }
								value={ btn.url }
								onChange={ ( val ) => updateCta( index, 'url', val ) }
								__nextHasNoMarginBottom
							/>
							<ToggleControl
								label={ __( 'Abrir en nueva pestaña', 'factoria-cruzcampo-blocks' ) }
								checked={ btn.target === '_blank' }
								onChange={ ( val ) => updateCta( index, 'target', val ? '_blank' : '' ) }
								__nextHasNoMarginBottom
							/>
							{ ctaButtons.length > 1 && (
								<Button
									isDestructive
									variant="link"
									onClick={ () => removeCta( index ) }
									style={ { marginTop: '4px' } }
								>
									{ __( 'Eliminar', 'factoria-cruzcampo-blocks' ) }
								</Button>
							) }
						</div>
					) ) }
					{ ctaButtons.length < 3 && (
						<Button variant="secondary" onClick={ addCta }>
							{ __( 'Añadir botón', 'factoria-cruzcampo-blocks' ) }
						</Button>
					) }
				</PanelBody>
			</InspectorControls>

			<header { ...blockProps }>
				<div className="b-offset-menu__bar">
					<div className="b-offset-menu__logo-wrap">
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
						<nav className="b-offset-menu__nav">
							{ selectedMenu ? (
								<span className="b-offset-menu__nav-label">
									{ __( 'Menú:', 'factoria-cruzcampo-blocks' ) }{ ' ' }
									<em>{ selectedMenu.name }</em>
								</span>
							) : (
								<span className="b-offset-menu__nav-empty">
									{ __( 'Selecciona un menú en el panel lateral', 'factoria-cruzcampo-blocks' ) }
								</span>
							) }
						</nav>
						<div className="b-offset-menu__cta">
							{ ctaButtons.map( ( btn, i ) => (
								<span key={ i } className="b-offset-menu__cta-btn">
									{ btn.label || __( '(sin texto)', 'factoria-cruzcampo-blocks' ) }
									<span aria-hidden="true"> →</span>
								</span>
							) ) }
						</div>
					</div>
				</div>
			</header>
		</>
	);
}
