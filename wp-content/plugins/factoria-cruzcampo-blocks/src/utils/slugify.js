/**
 * Generates a slug from a string: lowercase, no whitespace, standard alphanumeric characters.
 *
 * @param {string} text - The string to slugify (e.g. a text).
 * @return {string} The slug.
 */
export function slugify( text ) {
	if ( ! text || typeof text !== 'string' ) {
		return '';
	}
	return text
		.toLowerCase()
		.normalize( 'NFD' )
		.replace( /[\u0300-\u036f]/g, '' )
		.replace( /\s+/g, '' )
		.replace( /[^a-z0-9]/g, '' );
}
