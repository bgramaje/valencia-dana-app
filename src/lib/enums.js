
export const INITIAL_VIEW_STATE = {
    longitude: -0.3763,
    latitude: 39.4699,
    zoom: 12,
    pitch: 0,
    bearing: 0
}

export const ASSISTANCE_TYPES = {
    WATER: { color: [0, 0, 255], label: 'Agua', iconMap: 'https://api.iconify.design/mdi/water.svg', icon: 'mdi:water' },
    FOOD: { color: [0, 255, 0], label: 'Comida', iconMap: 'https://api.iconify.design/mdi/food.svg', icon: 'mdi:food' },
    MEDICAL: { color: [255, 0, 0], label: 'Asistencia Médica', iconMap: 'https://api.iconify.design/mdi/medical-bag.svg', icon: 'mdi:medical-bag' },
    OTHER: { color: [165, 3, 252], label: 'Otros', iconMap: 'https://api.iconify.design/bxs/shopping-bags.svg', icon: 'bxs:shopping-bags' }
}
