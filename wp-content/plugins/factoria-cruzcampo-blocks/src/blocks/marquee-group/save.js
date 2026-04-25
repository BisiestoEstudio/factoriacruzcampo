import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { useBisiestoBlockPropsSave } from '../../hooks/useBisiestoBlockProps';


export default function save({ attributes }) {
	const { align } = attributes;
	const customProps = useBisiestoBlockPropsSave({
		className: `align${align}`,
	});

	return (
		<div { ...customProps }>
			<InnerBlocks.Content />
		</div>
	);
}
