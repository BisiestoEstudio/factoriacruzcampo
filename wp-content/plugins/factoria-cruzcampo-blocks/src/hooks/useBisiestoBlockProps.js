/**
 * Custom hook to replace WordPress block class naming with Bisiesto naming convention
 * Returns a customBlockProps object that can be spread directly into components
 * Automatically detects the block name from the current block context
 * 
 * @param {Object} extraProps - Additional props to pass to useBlockProps
 * @returns {Object} - Custom block props with transformed className
 */

import { useBlockProps } from '@wordpress/block-editor';

export function useBisiestoBlockProps(extraProps = {}) {
	
	const blockProps = useBlockProps(extraProps);
	const { className, ...otherProps } = blockProps;
	
	const customClassName = customizeClassName(className);
	
	return {
		...otherProps,
		className: customClassName
	};
}

/**
 * Save function that works like useBlockProps.save() but with Bisiesto naming
 * Replaces WordPress block class naming with Bisiesto naming convention
 * 
 * @param {Object} props - Props object with className and other properties
 * @returns {Object} - Custom block props with transformed className
 */
export function useBisiestoBlockPropsSave(extraProps = {}) {
	const { className, ...otherProps } = useBlockProps.save(extraProps);
	const customClassName = customizeClassName(className);
	
	return {
		...otherProps,
		className: customClassName
	};
}


function customizeClassName(className) {
	const namespaceMatch = className?.match(/wp-block-([^-]+)-/);
	const blockNamespace = namespaceMatch ? namespaceMatch[1] : 'bisiesto';
	const blockNameMatch = className?.match(new RegExp(`wp-block-${blockNamespace}-(.+?)(?:\\s|$)`));
	const blockName = blockNameMatch ? blockNameMatch[1] : '';
	const wpBlockClass = `wp-block-${blockNamespace}-${blockName}`;
	const bisiestoClass = `b-${blockNamespace} b-${blockName}`;
	
	const customClassName = className?.replace(wpBlockClass, bisiestoClass);
	
	return customClassName;
}


