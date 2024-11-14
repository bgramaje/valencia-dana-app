export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
};

export function isOlderThanThreeDays(createdAt) {
  // Convert createdAt to a Date object if it's in string format
  const createdAtDate = new Date(createdAt);
  // Calculate the date three days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Check if createdAt is older than three days
  return createdAtDate < threeDaysAgo;
}
