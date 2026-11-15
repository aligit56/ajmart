import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';
import { Loader2, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const prod = res.data;
        setProduct(prod);

        let initialVariant = null;
        if (prod.variants) {
          try {
            const parsedVariants = typeof prod.variants === 'string' ? JSON.parse(prod.variants) : prod.variants;
            if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
              setVariants(parsedVariants);
              initialVariant = parsedVariants[0];
              setSelectedVariant(initialVariant);
            }
          } catch (e) {
            console.error("Failed to parse variants", e);
          }
        }

        let baseImgs = [];
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          baseImgs = prod.images.map(img => typeof img === 'string' ? img : img.image_url).filter(Boolean);
        } else {
          baseImgs = parseImages(prod.image_url);
        }

        if (initialVariant?.image_url) {
          setSelectedImage(initialVariant.image_url);
        } else if (baseImgs.length > 0) {
          setSelectedImage(baseImgs[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const allImages = useMemo(() => {
    if (!product) return [];
    let baseImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      baseImages = product.images.map(img => typeof img === 'string' ? img : img.image_url).filter(Boolean);
    } else {
      baseImages = parseImages(product.image_url);
    }
    // Include any variant images that aren't already in baseImages
    const variantImages = variants.map(v => v.image_url).filter(Boolean);
    const combined = [...baseImages];
    for (const vImg of variantImages) {
      if (!combined.includes(vImg)) {
        combined.push(vImg);
      }
    }
    return combined;
  }, [product, variants]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} /></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const handleVariantSelect = (v) => {
    setSelectedVariant(v);
    if (v.image_url) {
      setSelectedImage(v.image_url);
    }
  };

  const handlePrevImage = () => {
    if (allImages.length <= 1) return;
    const curIdx = allImages.indexOf(selectedImage);
    const nextIdx = (curIdx - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[nextIdx]);
  };

  const handleNextImage = () => {
    if (allImages.length <= 1) return;
    const curIdx = allImages.indexOf(selectedImage);
    const nextIdx = (curIdx + 1) % allImages.length;
    setSelectedImage(allImages[nextIdx]);
  };

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    toast.success(`Added ${quantity} to cart!`);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : (product.discounted_price || product.price);
  const displayImage = selectedImage || allImages[0] || product.image_url;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan mb-6">
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>

      <div className="card p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Column: Product Image + Thumbnails */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="relative min-h-[360px] md:min-h-[460px] h-96 md:h-[460px] bg-white rounded-xl flex items-center justify-center p-4 md:p-6 border border-lightBorder dark:border-darkBorder shadow-sm group">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name} 
                loading="lazy"
                className="object-contain w-full h-full max-h-[420px] rounded-lg transition-transform duration-300 hover:scale-105" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
            ) : (
              <img 
                src="/images/placeholder-product.jpg" 
                alt="Image coming soon" 
                className="object-contain w-full h-full max-h-[420px] opacity-80" 
              />
            )}

            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous Image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-opacity shadow cursor-pointer"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNextImage}
                  aria-label="Next Image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-opacity shadow cursor-pointer"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row if multiple images exist */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg border-2 p-1 bg-white dark:bg-darkBg flex-shrink-0 transition-all cursor-pointer ${
                    displayImage === img
                      ? 'border-darkBlue dark:border-cyan ring-2 ring-darkBlue/20 dark:ring-cyan/20 scale-105'
                      : 'border-lightBorder dark:border-darkBorder opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column: Info & Actions */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-lightText dark:text-darkText mb-1">{product.name}</h1>
          <p className="text-sm md:text-base font-semibold text-lightTextSecondary dark:text-darkTextSecondary mb-4">
            Brand: <span className="text-darkBlue dark:text-cyan font-bold">{product.brand || 'AJ Brand'}</span>
          </p>
          <p className="text-lightBlue dark:text-aqua text-3xl font-bold mb-5">Rs. {currentPrice}</p>
          
          {variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Select Variant / Flavour:</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, idx) => {
                  const isSelected = selectedVariant?.name === v.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVariantSelect(v)}
                      className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                        isSelected
                          ? 'bg-darkBlue dark:bg-cyan text-white dark:text-black border-darkBlue dark:border-cyan shadow-sm'
                          : 'bg-white dark:bg-darkBg text-lightText dark:text-darkText border-lightBorder dark:border-darkBorder hover:border-darkBlue dark:hover:border-cyan'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            {product.stock > 0 ? (
               <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-success-dark px-3 py-1.5 rounded-full text-sm font-semibold border border-green-200 dark:border-green-800/50">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 In Stock ({product.stock} available)
               </div>
            ) : (
               <div className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-error-dark px-3 py-1.5 rounded-full text-sm font-semibold border border-red-200 dark:border-red-800/50">
                 <span className="w-2 h-2 rounded-full bg-red-500"></span>
                 Out of Stock
               </div>
            )}
          </div>

          <div className="text-lightText dark:text-[#e0e0e0] mb-8 flex-grow">
            <h4 className="bg-darkBlue dark:bg-[#222] text-white dark:text-cyan px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl border-t border-x border-darkBlue dark:border-darkBorder flex items-center justify-between">
              <span>Product Description</span>
            </h4>
            <div className="whitespace-pre-wrap text-sm leading-relaxed border border-lightBorder dark:border-darkBorder p-4 rounded-b-xl bg-white dark:bg-[#111] shadow-2xs">
              {product.description || 'No description available.'}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center bg-lightBg dark:bg-darkBg rounded border border-lightBorder dark:border-darkBorder">
              <button 
                className="px-4 py-2 hover:bg-lightBorder dark:hover:bg-darkBorder disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >-</button>
              <span className="px-4 py-2 font-bold">{quantity}</span>
              <button 
                className="px-4 py-2 hover:bg-lightBorder dark:hover:bg-darkBorder disabled:opacity-50"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >+</button>
            </div>
            <button 
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn-primary flex-grow flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
