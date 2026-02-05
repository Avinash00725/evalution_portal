export const getEventLabel = (eventType) => {
  const labels = {
    'poster-presentation': 'Poster Presentation',
    'paper-presentation': 'Paper Presentation',
    'startup-expo': 'Startup Expo',
  };
  return labels[eventType] || eventType;
};

export const getEventColor = (eventType) => {
  const colors = {
    'poster-presentation': 'bg-blue-100 text-blue-800',
    'paper-presentation': 'bg-green-100 text-green-800',
    'startup-expo': 'bg-purple-100 text-purple-800',
  };
  return colors[eventType] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
