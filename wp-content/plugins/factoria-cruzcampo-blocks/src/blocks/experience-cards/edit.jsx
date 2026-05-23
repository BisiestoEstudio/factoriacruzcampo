import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RadioControl,
	SelectControl,
	CheckboxControl,
	Spinner,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

export default function Edit( { attributes, setAttributes } ) {
	const { mode, clasification, selectedIds } = attributes;
	const blockProps = useBisiestoBlockProps( {} );

	const terms = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'clasification', {
			per_page: -1,
			hide_empty: false,
		} );
	}, [] );

	const experiences = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'postType', 'experience', {
			per_page: -1,
			status: 'publish',
			_fields: 'id,title',
		} );
	}, [] );

	const termOptions = [
		{ label: __( 'Todas', 'factoria-cruzcampo-blocks' ), value: 'all' },
		...( terms || [] ).map( ( term ) => ( {
			label: term.name,
			value: String( term.id ),
		} ) ),
	];

	function toggleId( id ) {
		const next = selectedIds.includes( id )
			? selectedIds.filter( ( i ) => i !== id )
			: [ ...selectedIds, id ];
		setAttributes( { selectedIds: next } );
	}

	const previewLabel =
		mode === 'manual'
			? selectedIds.length === 0
				? __( 'Ninguna seleccionada', 'factoria-cruzcampo-blocks' )
				: `${ selectedIds.length } ${ __( 'experiencia(s)', 'factoria-cruzcampo-blocks' ) }`
			: clasification === 'all'
			? __( 'Todas las experiencias', 'factoria-cruzcampo-blocks' )
			: termOptions.find( ( o ) => o.value === clasification )?.label ?? clasification;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Selección de experiencias', 'factoria-cruzcampo-blocks' ) }>
					<RadioControl
						label={ __( 'Modo', 'factoria-cruzcampo-blocks' ) }
						selected={ mode }
						options={ [
							{
								label: __( 'Por clasificación', 'factoria-cruzcampo-blocks' ),
								value: 'category',
							},
							{
								label: __( 'Selección manual', 'factoria-cruzcampo-blocks' ),
								value: 'manual',
							},
						] }
						onChange={ ( value ) => setAttributes( { mode: value } ) }
					/>
				</PanelBody>

				{ mode === 'category' && (
					<PanelBody title={ __( 'Filtrar por clasificación', 'factoria-cruzcampo-blocks' ) }>
						{ terms === null ? (
							<Spinner />
						) : (
							<SelectControl
								label={ __( 'Clasificación', 'factoria-cruzcampo-blocks' ) }
								value={ clasification }
								options={ termOptions }
								onChange={ ( value ) =>
									setAttributes( { clasification: value } )
								}
							/>
						) }
					</PanelBody>
				) }

				{ mode === 'manual' && (
					<PanelBody title={ __( 'Experiencias', 'factoria-cruzcampo-blocks' ) }>
						{ experiences === null ? (
							<Spinner />
						) : experiences.length === 0 ? (
							<p>
								{ __( 'No hay experiencias publicadas.', 'factoria-cruzcampo-blocks' ) }
							</p>
						) : (
							experiences.map( ( exp ) => (
								<CheckboxControl
									key={ exp.id }
									label={ exp.title?.rendered ?? `#${ exp.id }` }
									checked={ selectedIds.includes( exp.id ) }
									onChange={ () => toggleId( exp.id ) }
								/>
							) )
						) }
					</PanelBody>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<p className="b-experience-cards__placeholder">
					{ __( 'Experience Cards', 'factoria-cruzcampo-blocks' ) }{ ' ' }
					&mdash; { previewLabel }
				</p>
			</div>
		</>
	);
}
