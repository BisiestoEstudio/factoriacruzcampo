import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';
import PaintImage from '../../utils/PaintImage';
import ExperiencePicker from '../../components/ExperiencePicker';

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBisiestoBlockProps( {} );

	return (
		<ExperiencePicker attributes={ attributes } setAttributes={ setAttributes }>
			{ ( { previewExperiences, mode, selectedIds } ) => (
				<div { ...blockProps }>
					{ previewExperiences === null ? (
						<Spinner />
					) : previewExperiences.length === 0 ? (
						<p className="b-experiences-carrusel__empty">
							{ mode === 'manual' && selectedIds.length === 0
								? __( 'Selecciona experiencias en el panel lateral.', 'factoria-cruzcampo-blocks' )
								: __( 'No hay experiencias disponibles.', 'factoria-cruzcampo-blocks' )
							}
						</p>
					) : (
						<div className="b-experiences-carrusel__preview">
							{ previewExperiences.map( ( exp ) => (
								<div key={ exp.id } className="b-experiences-carrusel__item">
									{ !! exp.featured_media && (
										<div className="b-experiences-carrusel__image">
											<PaintImage
												image={ exp.featured_media }
												className="b-experiences-carrusel__img"
											/>
										</div>
									) }
									<h3
										className="b-experiences-carrusel__title has-display-xs-font-size"
										dangerouslySetInnerHTML={ { __html: exp.title?.rendered } }
									/>
								</div>
							) ) }
						</div>
					) }
				</div>
			) }
		</ExperiencePicker>
	);
}
