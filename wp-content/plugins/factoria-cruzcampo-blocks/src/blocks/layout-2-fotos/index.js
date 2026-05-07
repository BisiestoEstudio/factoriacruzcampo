import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

function Save() {
	return null;
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
} );

