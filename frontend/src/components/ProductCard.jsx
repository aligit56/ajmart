import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';

const parseImages = (imageUrl) => {
  if (!imageUrl) return [];
  if (typeof imageUrl === 'string' && imageUrl.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) {
      // fallback
    }
  }
  return [imageUrl];
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
    return parseImages(product.image_url);
  }, [product.image_url]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Active display image: if selectedVariant has its own image_url, show that; otherwise use images[currentImgIndex]
  const displayImage = (selectedVariant && selectedVariant.image_url)
    ? selectedVariant.image_url
    : (images[currentImgIndex] || null);

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
    <div className="card hover:shadow-lg transition-transform hover:scale-[1.02] flex flex-col h-full overflow-hidden relative group">
      {product.discount_percent && !selectedVariant && (
        <span className="absolute top-2 left-2 z-20 bg-error-light dark:bg-error-dark text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
          {product.discount_percent}% OFF
        </span>
      )}
      
      {/* Product Image Area with Slider Controls */}
      <div className="relative aspect-square w-full bg-white p-2 flex items-center justify-center overflow-hidden border-b border-lightBorder dark:border-darkBorder">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={product.name} 
              loading="lazy"
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-product.jpg';
              }}
            />
          ) : (
            <img 
              src="/images/placeholder-product.jpg" 
              alt="Image coming soon" 
              loading="lazy"
              className="object-contain w-full h-full p-2 opacity-90" 
            />
          )}
        </Link>

        {/* Carousel arrows if multiple images and no variant image overriding */}
        {images.length > 1 && !selectedVariant?.image_url && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous Image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next Image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentImgIndex === idx ? 'bg-white w-4' : 'bg-white/50 w-2 hover:bg-white'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block mb-1">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-lightBlue dark:text-cyan block">
            {product.brand || 'AJ Brand'}
          </span>
          <h3 className="font-semibold text-lg hover:text-darkBlue dark:hover:text-cyan line-clamp-2">{product.name}</h3>
        </Link>

        {/* Variant chips if variants exist (e.g. Chatpatta / Chicken) */}
        {parsedVariants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-2">
            {parsedVariants.map((v, idx) => {
              const isSelected = selectedVariant?.name === v.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectVariant(e, v)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
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

        <div className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-3 flex-grow">
          {product.stock > 0 ? (
             <span className="text-success-light dark:text-success-dark text-xs font-medium">In Stock ({product.stock})</span>
          ) : (
             <span className="text-error-light dark:text-error-dark text-xs font-medium">Out of Stock</span>
          )}
        </div>

        <div className="flex justify-between items-center mt-auto">
          {product.discounted_price && !selectedVariant ? (
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-error-light dark:text-error-dark">Rs {product.discounted_price}</span>
              <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary line-through -mt-1">Rs {product.price}</span>
            </div>
          ) : (
            <span className="text-xl font-bold text-lightBlue dark:text-aqua">Rs {effectivePrice}</span>
          )}
          <button 
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="bg-darkBlue dark:bg-cyan text-white dark:text-black p-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
