/**
 * Custom alignment sizes for the block editor.
 *
 * HOW TO ADD A NEW SIZE
 * ─────────────────────
 * Add an entry to CUSTOM_ALIGNMENTS below. Each entry needs:
 *
 *   name   – slug used as the align attribute value and CSS class prefix
 *            (e.g. 'medium' → align="medium" → class "alignmedium")
 *   title  – label shown in the dropdown
 *   icon   – 24×24 SVG element
 *   info   – (optional) sub-label, e.g. 'Max 1720px wide'
 *
 * The dropdown will show: None → Wide width → [CUSTOM_ALIGNMENTS in order] → Full width
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { BlockControls, useSettings } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __, _x, sprintf } from '@wordpress/i18n';
import { getBlockSupport } from '@wordpress/blocks';
import { alignNone, stretchWide, stretchFullWidth } from '@wordpress/icons';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — edit here to add or remove custom alignment sizes
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOM_ALIGNMENTS = [
	{
		name: 'medium',
		title: __( 'Medium width', 'factoria-cruzcampo-blocks' ),
		info: 'Max 1720px wide',
		icon: (
			<svg
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				aria-hidden="true"
				focusable="false"
			>
				<path d="M3 5h18v2H3V5zM5 9h14v6H5V9zM3 17h18v2H3v-2z" />
			</svg>
		),
	},
	// Example — uncomment to enable:
	// {
	// 	name: 'extrawide',
	// 	title: __( 'Extra wide', 'factoria-cruzcampo-blocks' ),
	// 	info: 'Max 1440px wide',
	// 	icon: (
	// 		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden focusable="false">
	// 			<path d="M3 5h18v2H3V5zM4 9h16v6H4V9zM3 17h18v2H3v-2z" />
	// 		</svg>
	// 	),
	// },
];

// ─────────────────────────────────────────────────────────────────────────────
// Infrastructure — no need to edit below
// ─────────────────────────────────────────────────────────────────────────────

/** Names of the custom aligns we're registering. */
const CUSTOM_NAMES = CUSTOM_ALIGNMENTS.map( ( a ) => a.name );

/** Map from custom align name to its config. */
const CUSTOM_BY_NAME = Object.fromEntries(
	CUSTOM_ALIGNMENTS.map( ( a ) => [ a.name, a ] )
);

/**
 * Per-block-type registry.
 * Populated in the blocks.registerBlockType filter.
 * Value: ordered list of align names shown in the dropdown.
 */
const blocksWithCustomAlign = {};

// ── Step 1 – blocks.registerBlockType ────────────────────────────────────────
// For every block that supports wide/full alignment:
//   • record it in the registry so we know to render our dropdown
//   • set supports.align = CUSTOM_NAMES so ALL_ALIGNMENTS filtering in
//     WordPress core returns [] → the native dropdown will not render
//   • widen the align attribute enum so custom values pass validation
addFilter(
	'blocks.registerBlockType',
	'bisiesto/custom-align-support',
	( settings ) => {
		const originalAlign = getBlockSupport( settings, 'align' );
		if ( ! originalAlign ) return settings;

		const aligns =
			originalAlign === true
				? [ 'left', 'center', 'right', 'wide', 'full' ]
				: Array.isArray( originalAlign )
				? originalAlign
				: [];

		const hasWide = aligns.includes( 'wide' );
		const hasFull = aligns.includes( 'full' );
		if ( ! hasWide && ! hasFull ) return settings;

		// Dropdown order: None → Wide → [custom sizes] → Full
		const dropdownOptions = [
			'none',
			...( hasWide ? [ 'wide' ] : [] ),
			...CUSTOM_NAMES,
			...( hasFull ? [ 'full' ] : [] ),
		];

		blocksWithCustomAlign[ settings.name ] = dropdownOptions;

		return {
			...settings,
			supports: {
				...settings.supports,
				// CUSTOM_NAMES are not in WordPress's internal ALL_ALIGNMENTS
				// → getValidAlignments(CUSTOM_NAMES) returns [] → native dropdown hidden
				align: CUSTOM_NAMES,
			},
			attributes: {
				...settings.attributes,
				align: {
					type: 'string',
					enum: [ '', ...aligns, ...CUSTOM_NAMES ],
				},
			},
		};
	}
);

// ── Step 2 – editor.BlockListBlock ───────────────────────────────────────────
// Core's addAssignedAlign skips our blocks (supports.align no longer matches).
// We re-add data-align and alignXxx class for the editor view.
addFilter(
	'editor.BlockListBlock',
	'bisiesto/custom-align-editor',
	createHigherOrderComponent(
		( BlockListBlock ) =>
			( props ) => {
				if ( ! blocksWithCustomAlign[ props.name ] ) {
					return <BlockListBlock { ...props } />;
				}
				const align = props.attributes?.align;
				if ( ! align ) return <BlockListBlock { ...props } />;

				const existing = props.wrapperProps?.className ?? '';
				const wrapperProps = {
					...props.wrapperProps,
					'data-align': align,
					className: [ existing, `align${ align }` ]
						.filter( Boolean )
						.join( ' ' ),
				};
				return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
			},
		'withCustomAlignEditor'
	)
);

// ── Step 3 – blocks.getSaveContent.extraProps ─────────────────────────────────
// Add alignXxx class to the saved HTML for static (non-dynamic) blocks.
addFilter(
	'blocks.getSaveContent.extraProps',
	'bisiesto/custom-align-save',
	( props, blockType, attributes ) => {
		if ( ! blocksWithCustomAlign[ blockType.name ] ) return props;
		const align = attributes?.align;
		if ( ! align ) return props;

		const existing = props.className ?? '';
		return {
			...props,
			className: [ existing, `align${ align }` ]
				.filter( Boolean )
				.join( ' ' ),
		};
	}
);

// ── Dropdown component ────────────────────────────────────────────────────────
function CustomAlignmentControl( { value, options, onChange } ) {
	const [ contentSize ] = useSettings( 'layout.contentSize' );
	const [ wideSize ] = useSettings( 'layout.wideSize' );

	// Native controls (icon + title + optional info from theme.json)
	const NATIVE_CONTROLS = {
		none: {
			icon: alignNone,
			title: _x( 'None', 'Alignment option' ),
			info: contentSize
				? sprintf( __( 'Max %s wide' ), contentSize )
				: undefined,
		},
		wide: {
			icon: stretchWide,
			title: __( 'Wide width' ),
			info: wideSize ? sprintf( __( 'Max %s wide' ), wideSize ) : undefined,
		},
		full: {
			icon: stretchFullWidth,
			title: __( 'Full width' ),
		},
	};

	const ALL_CONTROLS = { ...NATIVE_CONTROLS, ...CUSTOM_BY_NAME };

	const activeKey = value || 'none';
	const activeControl = ALL_CONTROLS[ activeKey ] ?? NATIVE_CONTROLS.none;

	return (
		<ToolbarDropdownMenu
			icon={ activeControl.icon }
			label={ __( 'Align' ) }
			toggleProps={ { description: __( 'Change alignment' ) } }
		>
			{ ( { onClose } ) => (
				<MenuGroup className="block-editor-block-alignment-control__menu-group">
					{ options.map( ( name ) => {
						const control = ALL_CONTROLS[ name ];
						if ( ! control ) return null;

						const isActive =
							name === activeKey ||
							( name === 'none' && ! value );

						return (
							<MenuItem
								key={ name }
								icon={ control.icon }
								iconPosition="left"
								className={ [
									'components-dropdown-menu__menu-item',
									isActive && 'is-active',
								]
									.filter( Boolean )
									.join( ' ' ) }
								isSelected={ isActive }
								info={ control.info }
								role="menuitemradio"
								onClick={ () => {
									onChange( name === 'none' ? undefined : name );
									onClose();
								} }
							>
								{ control.title }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }
		</ToolbarDropdownMenu>
	);
}

// ── Step 4 – editor.BlockEdit ─────────────────────────────────────────────────
// Inject the custom dropdown into the block toolbar for every affected block.
addFilter(
	'editor.BlockEdit',
	'bisiesto/custom-align-control',
	createHigherOrderComponent(
		( BlockEdit ) =>
			( props ) => {
				const { name, attributes, setAttributes, isSelected } = props;

				if ( ! isSelected ) return <BlockEdit { ...props } />;

				const options = blocksWithCustomAlign[ name ];
				if ( ! options ) return <BlockEdit { ...props } />;

				return (
					<Fragment>
						<BlockControls group="block">
							<CustomAlignmentControl
								value={ attributes.align || '' }
								options={ options }
								onChange={ ( align ) => setAttributes( { align } ) }
							/>
						</BlockControls>
						<BlockEdit { ...props } />
					</Fragment>
				);
			},
		'withCustomAlignControl'
	)
);
