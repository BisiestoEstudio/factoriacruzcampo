import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import './editor.scss';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Properties passed to the function.
 * @param {Object}   props.attributes    Available block attributes.
 * @param {Function} props.setAttributes Function that updates individual attributes.
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {

	const { align } = attributes;

	const blockProps = useBisiestoBlockProps({
		className: `align${align}`,
	});


	return (
		<>
			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={[
						'bisiesto/marquee',
					]}
					templateLock={ false }
				/>
			</div>
		</>
	);
}
