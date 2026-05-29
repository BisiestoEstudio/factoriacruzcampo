import { __ } from '@wordpress/i18n';
import { InnerBlocks } from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBisiestoBlockProps } from '../../hooks/useBisiestoBlockProps';

export default function Edit() {
	const blockProps = useBisiestoBlockProps( { className: 'alignwide' } );

	const [ title ] = useEntityProp( 'postType', 'experience', 'title' );
	const [ featuredImageId ] = useEntityProp( 'postType', 'experience', 'featured_media' );
	const [ meta ] = useEntityProp( 'postType', 'experience', 'meta' );
	const allowedBlocks = [ 'core/heading', 'core/paragraph', 'core/spacer', 'bisiesto/spacer', 'core/buttons', 'core/columns' ];

	const featuredImageUrl = useSelect(
		( select ) => {
			if ( ! featuredImageId ) return '';
			const media = select( coreStore ).getMedia( featuredImageId );
			return media?.source_url ?? '';
		},
		[ featuredImageId ]
	);

	const precio = meta?.precio ?? '';
	const dias = meta?.dias ?? '';
	const duracion = meta?.duracion ?? '';

	return (
		<section { ...blockProps }>

			<h1 className="b-experience-header__title has-display-l-font-size">
				{ title || __( 'Título de la experiencia', 'factoria-cruzcampo-blocks' ) }
			</h1>

			<div className="b-experience-header__body">

				<div className="b-experience-header__image">
					{ featuredImageUrl ? (
						<img
							src={ featuredImageUrl }
							alt=""
							className="b-experience-header__img"
						/>
					) : (
						<div className="b-experience-header__image-placeholder">
							{ __( 'Imagen destacada', 'factoria-cruzcampo-blocks' ) }
						</div>
					) }
				</div>

				<div className="b-experience-header__content">

					<div className="b-experience-header__details has-red-color">
						<div className="b-experience-header__detail">
							<span
								className="b-experience-header__icon b-experience-header__icon--money"
								aria-hidden="true"
							/>
							<span className="b-experience-header__detail-text has-display-xs-font-size">
								{ precio ? `${ precio }€` : '—' }
							</span>
						</div>
						<div className="b-experience-header__detail">
							<span
								className="b-experience-header__icon b-experience-header__icon--calendar"
								aria-hidden="true"
							/>
							<span className="b-experience-header__detail-text has-display-xs-font-size">
								{ dias || '—' }
							</span>
						</div>
						<div className="b-experience-header__detail">
							<span
								className="b-experience-header__icon b-experience-header__icon--time"
								aria-hidden="true"
							/>
							<span className="b-experience-header__detail-text has-display-xs-font-size">
								{ duracion || '—' }
							</span>
						</div>
					</div>

					<div className="b-experience-header__content-inner is-prose">
						<InnerBlocks
							allowedBlocks={ allowedBlocks }
							templateLock={ false }
						/>
					</div>

				</div>
			</div>
		</section>
	);
}
