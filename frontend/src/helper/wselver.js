export const getImageUrl = (url) => {
  if (!url) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  const cleanUrl = url.replace(/^https?:\/\//, '');

  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=800&h=600&fit=cover`;
};