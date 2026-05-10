/**
 * Function to provide link attributes.
 *
 * @param {Object} link - The link object containing url, target, title, and rel properties
 * @return {string} - HTML attributes string
 */
export function getLinkAttributes(link) {
    const attributes = {};
    attributes.href = link?.url || '#';
    if (link?.target) {
        attributes.target = link?.target;
    }
    if (link?.title) {
        attributes.title = link?.title;
    }
    if (link?.rel) {
        attributes.rel = link?.rel;
    }

    return attributes;
}
