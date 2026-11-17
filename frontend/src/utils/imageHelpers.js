/**
 * Shared Image Helper for AJMart
 * Handles URL sanitization, relative path normalization,
 * and resilient multi-tier fallback for category and product images.
 */

export const normalizeImageUrl = (url) => {
  if (!url) return '';
  // Strip obsolete localhost development URLs if present in older DB rows
  return url.replace(/^https?:\/\/[^\/]+:5000/, '');
};

export const handleCategoryImageError = (e, fallbackSrc = '/images/placeholder.jpg') => {
  const img = e.currentTarget || e.target;
  img.onerror = null; // Prevent loop

  const currentSrc = img.src || '';

  // 1. Try lowercase extension or .jpg fallback if .webp failed
  if (/\.webp$/i.test(currentSrc)) {
    img.src = currentSrc.replace(/\.webp$/i, '.jpg');
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackSrc;
    };
    return;
  }

  // 2. Try .png -> .webp -> .jpg for Household
  if (/\.png$/i.test(currentSrc)) {
    img.src = currentSrc.replace(/\.png$/i, '.webp');
    img.onerror = () => {
      img.onerror = null;
      img.src = currentSrc.replace(/\.png$/i, '.jpg');
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackSrc;
      };
    };
    return;
  }

  // 3. Try .jpg -> .webp
  if (/\.jpg$/i.test(currentSrc)) {
    img.src = currentSrc.replace(/\.jpg$/i, '.webp');
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackSrc;
    };
    return;
  }

  // Default fallback
  img.src = fallbackSrc;
};

export const handleProductImageError = (e) => {
  const img = e.currentTarget || e.target;
  img.onerror = null;
  img.src = '/images/placeholder-product.jpg';
};
