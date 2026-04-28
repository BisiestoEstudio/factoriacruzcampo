import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { useBisiestoBlockPropsSave } from '../../hooks/useBisiestoBlockProps';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

function Save({ attributes }) {
	const { verticalAlignment, imagePosition } = attributes;
	const blockProps = useBisiestoBlockPropsSave( {
		className: `is-vertically-aligned-${ verticalAlignment } is-image-position-${ imagePosition }`,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
} );
