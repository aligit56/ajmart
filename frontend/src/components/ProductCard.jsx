import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { normalizeImageUrl, handleProductImageError } from '../utils/imageHelpers';

const parseImages = (imageUrl) => {
  if (!imageUrl) return [];
  if (typeof imageUrl === 'string' && imageUrl.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(normalizeImageUrl);
    } catch (e) {
      // fallback
    }
  }
  return [normalizeImageUrl(imageUrl)];
};

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const parsedVariants = useMemo(() => {
    if (!product.variants) return [];
    try {
      const v = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }, [product.variants]);

  const [selectedVariant, setSelectedVariant] = useState(
    parsedVariants.length > 0 ? parsedVariants[0] : null
  );

  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => typeof img === 'string' ? normalizeImageUrl(img) : normalizeImageUrl(img.image_url)).filter(Boolean);
    }
    return parseImages(product.image_url);
  }, [product.images, product.image_url]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Touch gesture handling for mobile swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 40;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || images.length <= 1) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Active display image: if selectedVariant has its own image_url, show that; otherwise use images[currentImgIndex]
  const displayImage = (selectedVariant && selectedVariant.image_url)
    ? normalizeImageUrl(selectedVariant.image_url)
    : (images[currentImgIndex] || null);

  const hasDualGallery = !selectedVariant?.image_url && images.length > 1;

  const effectivePrice = (selectedVariant && selectedVariant.price)
    ? selectedVariant.price
    : (product.discounted_price || product.price);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handleSelectVariant = (e, v) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariant(v);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      price: effectivePrice,
      variant: selectedVariant?.name
    }, 1, selectedVariant);
    toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added to cart!`);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-lightBorder dark:border-[#333] rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col h-full overflow-hidden relative group">
      
      {/* Discount Badge */}
      {product.discount_percent && !selectedVariant && (
        <span className="absolute top-2 left-2 z-20 bg-error-light dark:bg-error-dark text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
          {product.discount_percent}% OFF
        </span>
      )}
      
      {/* Product Image Area */}
      <div 
        className="relative aspect-square w-full bg-white dark:bg-[#202020] p-2 sm:p-3 flex items-center justify-center overflow-hidden border-b border-lightBorder/60 dark:border-[#2a2a2a]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center relative">
          {hasDualGallery && currentImgIndex === 0 ? (
            <>
              {/* Primary Image */}
              <img 
                src={images[0]} 
                alt={product.name} 
                loading="lazy"
                className="object-contain w-full h-full transition-opacity duration-300 md:group-hover:opacity-0" 
                onError={handleProductImageError}
              />
              {/* Secondary Image (Bag Image shown on desktop hover) */}
              <img 
                src={images[1]} 
                alt={`${product.name} bag`} 
                loading="lazy"
                className="object-contain w-full h-full absolute inset-0 transition-opacity duration-300 opacity-0 md:group-hover:opacity-100 pointer-events-none" 
                onError={handleProductImageError}
              />
            </>
          ) : displayImage ? (
            <img 
              src={displayImage} 
              alt={product.name} 
              loading="lazy"
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105" 
              onError={handleProductImageError}
            />
          ) : (
            <img 
              src="/images/placeholder-product.jpg" 
              alt="AJMart Product" 
              loading="lazy"
              className="object-contain w-full h-full p-2 opacity-90" 
            />
          )}
        </Link>

        {/* Carousel arrows if multiple images */}
        {images.length > 1 && !selectedVariant?.image_url && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous Image"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next Image"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    currentImgIndex === idx ? 'bg-white w-3' : 'bg-white/50 w-1.5 hover:bg-white'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="block mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-darkBlue dark:text-cyan block mb-0.5">
              {product.brand || 'AJ Brand'}
            </span>
            <h3 className="font-semibold text-xs sm:text-sm text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Variant chips if variants exist */}
          {parsedVariants.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1.5">
              {parsedVariants.map((v, idx) => {
                const isSelected = selectedVariant?.name === v.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleSelectVariant(e, v)}
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-darkBlue dark:bg-cyan text-white dark:text-black font-bold border-darkBlue dark:border-cyan shadow-xs'
                        : 'bg-lightBg dark:bg-darkBg text-lightTextSecondary dark:text-darkTextSecondary border-lightBorder dark:border-darkBorder hover:border-darkBlue dark:hover:border-cyan'
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-[10px] sm:text-xs text-lightTextSecondary dark:text-darkTextSecondary mb-2">
            {product.stock > 0 ? (
               <span className="text-success-light dark:text-success-dark font-medium">In Stock</span>
            ) : (
               <span className="text-error-light dark:text-error-dark font-medium">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Row */}
        <div className="flex justify-between items-center pt-1 border-t border-lightBorder/40 dark:border-darkBorder/40 mt-auto">
          {product.discounted_price && !selectedVariant ? (
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black text-error-light dark:text-error-dark">Rs {product.discounted_price}</span>
              <span className="text-[10px] sm:text-xs text-lightTextSecondary dark:text-darkTextSecondary line-through -mt-0.5">Rs {product.price}</span>
            </div>
          ) : (
            <span className="text-sm sm:text-base font-bold text-darkBlue dark:text-cyan">Rs {effectivePrice}</span>
          )}
          <button 
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-darkBlue dark:bg-cyan text-white dark:text-black flex items-center justify-center rounded-lg hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            title="Add to Cart"
            aria-label={`Add ${product.name} to Cart`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
