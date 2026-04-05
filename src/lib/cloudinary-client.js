/**
 * Optimizes a Cloudinary URL by inserting f_auto,q_auto transformations.
 * This file is browser-safe and does not import the Node.js Cloudinary SDK.
 */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  
  // Don't re-optimize if already transformed
  if (url.includes('/f_auto') || url.includes('/q_auto')) return url;

  // Insert transformations after '/upload/'
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
  }
  
  return url;
}
