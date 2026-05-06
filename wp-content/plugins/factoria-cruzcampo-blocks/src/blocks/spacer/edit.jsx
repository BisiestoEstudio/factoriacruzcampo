import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	PanelRow,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import './editor.scss';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

export default function Edit( { attributes, setAttributes } ) {
	const { heightMobile, heightDesktop } = attributes;
	const blockProps = useBisiestoBlockProps( {
		style: {
			height: heightDesktop + 'px',
			minHeight: '30px',
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Responsive Height Settings',
						'responsive-spacer-block-wp'
					) }
					initialOpen={ true }
				>
					<PanelRow>
						<NumberControl
							label={ __( 'Height Mobile (px)', 'unico-blocks' ) }
							value={ heightMobile }
							onChange={ ( value ) =>
								setAttributes( {
									heightMobile: parseInt( value ) || 0,
								} )
							}
							min={ 0 }
							max={ 1000 }
							step={ 1 }
							help={ __(
								'Height for mobile devices',
								'unico-blocks'
							) }
						/>
					</PanelRow>
					<PanelRow>
						<NumberControl
							label={ __(
								'Height Desktop (px)',
								'unico-blocks'
							) }
							value={ heightDesktop }
							onChange={ ( value ) =>
								setAttributes( {
									heightDesktop: parseInt( value ) || 0,
								} )
							}
							min={ 0 }
							max={ 1000 }
							step={ 1 }
							help={ __(
								'Height for desktop devices',
								'unico-blocks'
							) }
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }></div>
		</>
	);
}
