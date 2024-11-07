export const INITIAL_VIEW_STATE = {
  longitude: -0.3763,
  latitude: 39.4699,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

export const ASSISTANCE_TYPES = {
  WATER: {
    color: [44, 78, 245], label: 'Agua', iconMap: 'https://api.iconify.design/mdi/water.svg', icon: 'mdi:water',
  },
  FOOD: {
    color: [87, 240, 79], label: 'Comida', iconMap: 'https://api.iconify.design/mdi/food.svg', icon: 'mdi:food',
  },
  MEDICAL: {
    color: [240, 95, 79], label: 'Asistencia Médica', iconMap: 'https://api.iconify.design/mdi/medical-bag.svg', icon: 'mdi:medical-bag',
  },
  OTHER: {
    color: [169, 96, 224], label: 'Otros', iconMap: 'https://api.iconify.design/bxs/shopping-bags.svg', icon: 'bxs:shopping-bags',
  },
};

export const DATE_OPTIONS = {
  weekday: 'long', // Día de la semana completo (ej. "domingo")
  day: '2-digit', // Día en formato de dos dígitos
  month: 'short', // Mes en texto completo (ej. "diciembre")
  year: 'numeric', // Año con cuatro dígitos
  hour: 'numeric', // Hora en formato de 12 o 24 horas según configuración
  minute: '2-digit', // Minutos en formato de dos dígitos
  hour12: false, // Formato de 12 horas con "AM" y "PM"
};

export const TOAST_ERROR_CLASSNAMES = {
  toast: 'bg-red-800',
  title: 'text-red-400 text-md',
  description: 'text-red-400',
  icon: 'text-red-400',
  closeButton: 'bg-lime-400',
};

export const MARKER_STATUS = {
  COMPLETADO: 'completado',
  ASIGNADO: 'asignado',
  PENDIENTE: 'pendiente',
};
