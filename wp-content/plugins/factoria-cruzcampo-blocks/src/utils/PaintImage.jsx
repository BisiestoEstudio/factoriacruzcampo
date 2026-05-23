import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Renders an <img> from a media library ID or a fallback URL string.
 *
 * @param {number|string} image     - Attachment ID or direct URL.
 * @param {string}        className - Optional CSS class for the <img>.
 */
export default function PaintImage( { image, className = '' } ) {
	const previewUrl = useSelect(
		( select ) => {
			const id = typeof image === 'number' ? image : 0;
			if ( ! id ) return null;
			return select( coreStore ).getMedia( id )?.source_url ?? null;
		},
		[ image ]
	);

	const src =
		previewUrl ||
		( typeof image === 'string' && image ? image : null );

	if ( ! src ) return null;

	return <img src={ src } alt="" className={ className } />;
}
