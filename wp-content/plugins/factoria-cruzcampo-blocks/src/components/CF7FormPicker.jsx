import { __ } from '@wordpress/i18n';
import { SelectControl, PanelRow } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * CF7FormPicker Component
 * 
 * A reusable component for selecting Contact Form 7 forms in block editors.
 * 
 * @param {Object} props
 * @param {number} props.value - The selected form ID
 * @param {Function} props.onChange - Callback when form selection changes
 * @param {string} props.label - Label for the select control
 * @param {string} props.help - Help text for the select control
 * @param {boolean} props.disabled - Whether the control is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The form picker component
 */
export default function CF7FormPicker({
	value = 0,
	onChange,
	label = __('Formulario de contacto', 'unico-blocks'),
	help = __('Selecciona un formulario de Contact Form 7', 'unico-blocks'),
	disabled = false,
	className = ''
}) {
	// State for CF7 forms
	const [cf7Forms, setCf7Forms] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch CF7 forms using CF7 API
	useEffect(() => {
		const fetchForms = async () => {
			try {
				setIsLoading(true);

				const forms = await apiFetch({
					path: '/contact-form-7/v1/contact-forms'
				});

				setCf7Forms(forms || []);
			} catch (error) {
				console.error('Error fetching CF7 forms:', error);
				setCf7Forms([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchForms();
	}, []);

	// Prepare form options for SelectControl
	const formOptions = [
		{ label: __('Seleccionar formulario...', 'unico-blocks'), value: 0 }
	];

	if (cf7Forms && Array.isArray(cf7Forms)) {
		cf7Forms.forEach(form => {
			formOptions.push({
				label: form.title?.rendered || form.title || `Formulario ${form.id}`,
				value: form.id
			});
		});
	}

	return (
		<PanelRow className={className}>
			<SelectControl
				label={label}
				value={value}
				options={formOptions}
				onChange={(newValue) => onChange(parseInt(newValue))}
				disabled={disabled || isLoading}
				help={isLoading ? __('Cargando formularios...', 'unico-blocks') : help}
			/>
		</PanelRow>
	);
}
