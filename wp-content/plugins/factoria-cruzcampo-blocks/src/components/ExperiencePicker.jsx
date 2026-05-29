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

/**
 * Selector de experiencias reutilizable.
 *
 * Gestiona la carga de términos/posts y renderiza los paneles del inspector.
 * Expone los resultados al bloque padre mediante render prop:
 *
 * <ExperiencePicker attributes={attributes} setAttributes={setAttributes}>
 *   {({ previewExperiences }) => <div>...</div>}
 * </ExperiencePicker>
 */
export default function ExperiencePicker( { attributes, setAttributes, children } ) {
	const { mode, clasification, selectedIds } = attributes;

	const terms = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'clasification', {
			per_page: -1,
			hide_empty: false,
		} );
	}, [] );

	const allExperiences = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'postType', 'experience', {
			per_page: -1,
			status: 'publish',
			_fields: 'id,title',
		} );
	}, [] );

	const previewExperiences = useSelect(
		( select ) => {
			if ( mode === 'manual' && selectedIds.length === 0 ) {
				return [];
			}
			const query = {
				per_page: -1,
				status: 'publish',
				_fields: 'id,title,featured_media',
			};
			if ( mode === 'manual' ) {
				query.include = selectedIds;
				query.orderby = 'include';
			} else if ( clasification !== 'all' ) {
				query.clasification = parseInt( clasification, 10 );
			}
			return select( coreStore ).getEntityRecords( 'postType', 'experience', query );
		},
		[ mode, clasification, selectedIds.join( ',' ) ]
	);

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
						{ allExperiences === null ? (
							<Spinner />
						) : allExperiences.length === 0 ? (
							<p>
								{ __( 'No hay experiencias publicadas.', 'factoria-cruzcampo-blocks' ) }
							</p>
						) : (
							allExperiences.map( ( exp ) => (
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

			{ children( { previewExperiences, mode, selectedIds } ) }
		</>
	);
}
