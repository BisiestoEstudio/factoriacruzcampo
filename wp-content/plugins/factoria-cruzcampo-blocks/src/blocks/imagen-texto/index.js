import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { useBisiestoBlockPropsSave } from '../../hooks/useBisiestoBlockProps';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

function Save() {
	return <InnerBlocks.Content />;
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
} );
