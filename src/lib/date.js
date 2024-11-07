export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
};
