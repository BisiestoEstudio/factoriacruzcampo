import { __ } from '@wordpress/i18n';
import { InspectorControls} from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextareaControl } from '@wordpress/components';
import './editor.scss';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';


export default function Edit( { attributes, setAttributes } ) {
	const { marqueeText, speed, invertDirection } = attributes;
	
	// Calculate speed logic similar to render.php
	const letterCount = marqueeText ? marqueeText.length : 0;
	const repeatText = letterCount > 35 ? 3 : 2;
	
	let calculatedSpeed = letterCount * repeatText * 250;
	
	if (speed !== 0) {
		calculatedSpeed = speed > 0 ? calculatedSpeed / speed : calculatedSpeed * speed * -1;
		calculatedSpeed = Math.floor(calculatedSpeed);
	}
	
	const animationDuration = `animation-duration: ${calculatedSpeed}ms`;
	const directionClass = invertDirection ? ' b-marquee--invert' : '';
	
	const customBlockProps = useBisiestoBlockProps({
		className: directionClass
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Content', 'dual-marquee-block-wp')}>
					<TextareaControl
						label={__('Top Marquee Text', 'dual-marquee-block-wp')}
						value={marqueeText} 
						onChange={(value) => {
							const sanitizedValue = value.replace(/<[^>]*>/g, '');
							setAttributes({ marqueeText: sanitizedValue });
						}}
						rows={3}
					/>
				</PanelBody>
				<PanelBody title={__('Marquee Settings', 'dual-marquee-block-wp')}>
					<RangeControl
						label={__('Animation Speed', 'dual-marquee-block-wp')}
						value={speed}
						onChange={(value) => setAttributes({ speed: value })}
						min={-5}
						max={5}
						step={1}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...customBlockProps }>		
				{Array.from({ length: repeatText }, (_, i) => (
					<div 
						key={i} 
						className="b-marquee__item"
						style={{ animationDuration: `${calculatedSpeed}ms` }}
					>
						<span className="b-marquee__text is-style-display_xl">
							{marqueeText}
						</span>
					</div>
				))}
			</div>
		</>
	);
}
