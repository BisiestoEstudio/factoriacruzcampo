import { __ } from '@wordpress/i18n';
import { BlockControls, LinkControl } from '@wordpress/block-editor';
import { ToolbarButton, Popover, Button } from '@wordpress/components';
import { link as linkIcon } from '@wordpress/icons';
import { useState, useRef } from '@wordpress/element';
import './LinkPicker.scss';

const LINK_SETTINGS = [
	{
		id: 'openInNewTab',
		title: __( 'Open in new tab', 'factoria-cruzcampo-blocks' ),
	},
	{
		id: 'isNoFollow',
		title: __( 'Add rel="nofollow" to the link', 'factoria-cruzcampo-blocks' ),
	},
];

function normalizeLinkData( linkData ) {
	const { openInNewTab, isNoFollow } = linkData;
	return {
		url: linkData.url ?? '#',
		title: linkData.title ?? null,
		target: openInNewTab ? '_blank' : null,
		rel: isNoFollow ? 'nofollow' : null,
	};
}

/**
 * LinkPicker Component
 *
 * A reusable link picker component that provides:
 * - LinkControl with URL input, suggestions, and text control
 * - "Open in new tab" and "No Follow" settings
 * - Two placement modes: 'toolbar' (popover from toolbar button) or 'inspector' (inline in sidebar)
 *
 * @param {Object}   props
 * @param {Object}   props.link             - Link object with url, target, title, rel
 * @param {Function} props.onLinkChange     - Callback when link changes
 * @param {string}   props.placement        - 'toolbar' (default) or 'inspector'
 * @param {string}   props.addLabel         - Label for add link button (toolbar mode)
 * @param {string}   props.editLabel        - Label for edit link button (toolbar mode)
 * @param {string}   props.removeLabel      - Label for remove link button (toolbar mode)
 * @param {boolean}  props.showRemoveButton - Whether to show remove button (toolbar mode)
 * @param {string}   props.className        - Additional CSS class
 */
export default function LinkPicker( {
	link = {},
	onLinkChange,
	placement = 'toolbar',
	addLabel = __( 'Add Link', 'factoria-cruzcampo-blocks' ),
	editLabel = __( 'Edit Link', 'factoria-cruzcampo-blocks' ),
	removeLabel = __( 'Remove Link', 'factoria-cruzcampo-blocks' ),
	showRemoveButton = true,
	className = '',
} ) {
	const handleLinkChange = ( linkData ) => {
		onLinkChange( normalizeLinkData( linkData ) );
	};

	const handleRemoveLink = () => {
		onLinkChange( { url: '', target: false, title: '', rel: '' } );
	};

	// ── Inspector mode: render LinkControl inline, no toolbar ──────────────
	if ( placement === 'inspector' ) {
		return (
			<div className={ `b-link-picker-inspector ${ className }` } style={ { minWidth: 0, width: '100%', boxSizing: 'border-box', '--wp-components-size-__unstable-large-dimension': '100%' } }>
				<LinkControl
					value={ link }
					onChange={ handleLinkChange }
					showInitialSuggestions={ true }
					withCreateSuggestion={ true }
					createSuggestionButtonText={ __( 'Create page', 'factoria-cruzcampo-blocks' ) }
					noDirectEntry={ false }
					noURLSuggestion={ false }
					hasTextControl={ true }
					settings={ LINK_SETTINGS }
				/>
				{ link?.url && showRemoveButton && (
					<Button
						variant="tertiary"
						isDestructive
						onClick={ handleRemoveLink }
						className="b-link-picker-inspector__remove"
					>
						{ removeLabel }
					</Button>
				) }
			</div>
		);
	}

	// ── Toolbar mode (default): popover from toolbar button ─────────────────
	return <LinkPickerToolbar
		link={ link }
		onLinkChange={ handleLinkChange }
		onRemoveLink={ handleRemoveLink }
		addLabel={ addLabel }
		editLabel={ editLabel }
		removeLabel={ removeLabel }
		showRemoveButton={ showRemoveButton }
		className={ className }
	/>;
}

function LinkPickerToolbar( {
	link,
	onLinkChange,
	onRemoveLink,
	addLabel,
	editLabel,
	removeLabel,
	showRemoveButton,
	className,
} ) {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const linkButtonRef = useRef( null );

	return (
		<BlockControls>
			<ToolbarButton
				ref={ linkButtonRef }
				icon={ linkIcon }
				label={ link?.url ? editLabel : addLabel }
				onClick={ () => setIsPopoverOpen( true ) }
				isPressed={ !! link?.url }
			/>
			{ link?.url && showRemoveButton && (
				<ToolbarButton
					icon="editor-unlink"
					label={ removeLabel }
					onClick={ onRemoveLink }
				/>
			) }

			{ isPopoverOpen && (
				<Popover
					anchor={ linkButtonRef.current }
					placement="bottom-start"
					onClose={ () => setIsPopoverOpen( false ) }
					className={ `b-link-picker-popover ${ className }` }
				>
					<div className="b-link-picker-popover__content">
						<LinkControl
							value={ link }
							onChange={ ( linkData ) => {
								onLinkChange( linkData );
								setIsPopoverOpen( false );
							} }
							showInitialSuggestions={ true }
							withCreateSuggestion={ true }
							createSuggestionButtonText={ __( 'Create page', 'factoria-cruzcampo-blocks' ) }
							noDirectEntry={ false }
							noURLSuggestion={ false }
							hasTextControl={ true }
							settings={ LINK_SETTINGS }
						/>
					</div>
				</Popover>
			) }
		</BlockControls>
	);
}
