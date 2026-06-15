import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { ToggleControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

const SUPPORTED_POST_TYPES = [ 'page', 'post', 'experience' ];
const META_KEY = '_header_color_white';

function HeaderColorPanel() {
	const { postType, metaValue } = useSelect( ( select ) => {
		const { getCurrentPostType, getEditedPostAttribute } = select( editorStore );
		return {
			postType:  getCurrentPostType(),
			metaValue: getEditedPostAttribute( 'meta' )?.[ META_KEY ] ?? false,
		};
	}, [] );

	const { editPost } = useDispatch( editorStore );

	if ( ! SUPPORTED_POST_TYPES.includes( postType ) ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name="fcb-header-color-panel"
			title={ __( 'Barra de menú', 'factoria-cruzcampo-blocks' ) }
			icon="admin-appearance"
		>
			<ToggleControl
				label={ __( 'Menú blanco', 'factoria-cruzcampo-blocks' ) }
				help={ __( 'Muestra el icono y texto del menú en blanco cuando la barra está en el top de la página.', 'factoria-cruzcampo-blocks' ) }
				checked={ !! metaValue }
				onChange={ ( val ) => editPost( { meta: { [ META_KEY ]: val } } ) }
			/>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'fcb-header-color', { render: HeaderColorPanel } );
