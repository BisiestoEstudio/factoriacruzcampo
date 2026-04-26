wp.domReady(() => {

    const buttonStyles = {
        small: 'Small',
        large: 'Large',
    }

    const listStyles = {
        'expanded': 'Margen amplio',
    }

    
    wp.blocks.unregisterBlockStyle('core/button', ['fill', 'outline']);
    bisRegisterBlockVariation('core/button', buttonStyles);

    bisRegisterBlockVariation('core/spacer', {
        hidden_mobile: 'Ocultar móvil',
        hidden_desktop: 'Ocultar escritorio',
    });

    bisRegisterBlockVariation('core/list', listStyles);
    bisRegisterBlockVariation('core/buttons', {
        movil_centered: 'Centrar móvil',
    });
});




function bisRegisterBlockVariation(blockName, data, isDefault = false) {
    Object.keys(data).forEach(key => {
        let blockData = {
            name: key,
            label: data[key]
        }

        if (isDefault) {
            blockData.default = true;
            isDefault = false;
        }
        wp.blocks.registerBlockStyle(blockName, blockData);
    });
}