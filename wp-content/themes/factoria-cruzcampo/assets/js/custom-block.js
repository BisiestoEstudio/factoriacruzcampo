wp.domReady(() => {

    const buttonStyles = {
        small: 'Small',
        large: 'Large',
    }

    const listStyles = {
        'expanded': 'Margen amplio',
    }

    const columnsStyles = {
        'text-button': 'Texto-Botón',
    }

    
    wp.blocks.unregisterBlockStyle('core/button', ['fill', 'outline']);
    bisRegisterBlockVariation('core/button', buttonStyles);

    bisRegisterBlockVariation('core/spacer', {
        only_mobile: 'Solo móvil',
        only_desktop: 'Solo escritorio',
    });

    bisRegisterBlockVariation('core/list', listStyles);
    bisRegisterBlockVariation('core/buttons', {
        movil_centered: 'Centrar móvil',
    });

    bisRegisterBlockVariation('core/columns', columnsStyles);
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