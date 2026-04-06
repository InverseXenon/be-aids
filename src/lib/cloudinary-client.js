/**
 * Cloudinary URL optimization utilities (browser-safe).
 * These do NOT import the Node.js SDK.
 */

/**
 * Optimizes a Cloudinary URL with f_auto, q_auto, and optional width.
 * @param {string} url - The cloudinary URL
 * @param {number} [width] - Optional width constraint
 * @returns {string} Optimized URL
 */
export function optimizeCloudinaryUrl(url, width) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;

  // Don't re-optimize if already transformed
  if (url.includes('/f_auto') || url.includes('/q_auto')) return url;

  // Build transformation string
  let transforms = 'f_auto,q_auto';
  if (width) transforms += `,w_${width},c_limit`;

  // Insert transformations after '/upload/'
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transforms}/${parts[1]}`;
  }

  return url;
}

/**
 * Generate a tiny thumbnail URL for grid/card views.
 * @param {string} url - The cloudinary URL
 * @param {number} [size=400] - Max width in pixels
 * @returns {string} Thumbnail URL
 */
export function getThumbnailUrl(url, size = 400) {
  return optimizeCloudinaryUrl(url, size);
}

/**
 * Generate a blurred placeholder URL for progressive loading.
 * @param {string} url - The cloudinary URL
 * @returns {string} Tiny blurred placeholder URL
 */
export function getBlurPlaceholder(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_32,q_10,e_blur:800,f_auto/${parts[1]}`;
  }
  return url;
}

/**
 * Custom loader for next/image that uses Cloudinary transforms.
 * Usage: <Image loader={cloudinaryLoader} src={url} ... />
 */
export function cloudinaryLoader({ src, width, quality }) {
  if (!src || !src.includes('res.cloudinary.com')) return src;

  const parts = src.split('/upload/');
  if (parts.length === 2) {
    const q = quality || 'auto';
    return `${parts[0]}/upload/f_auto,q_${q},w_${width},c_limit/${parts[1]}`;
  }
  return src;
}
