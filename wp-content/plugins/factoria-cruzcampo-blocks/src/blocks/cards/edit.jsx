import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/block-editor';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

const ALLOWED_BLOCKS = [ 'bisiesto/card-image' ];

export default function Edit() {
	const blockProps = useBisiestoBlockProps( {} );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				templateLock={ false }
				template={ [ [ 'bisiesto/card-image' ] ] }
				renderAppender={ InnerBlocks.ButtonBlockAppender }
			/>
		</div>
	);
}
