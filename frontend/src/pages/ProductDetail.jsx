import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} /></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} to cart!`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan mb-6">
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>

      <div className="card p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 h-64 md:h-96 bg-lightBg dark:bg-darkBg rounded-lg flex items-center justify-center">
          {product.image_url ? (
               <img src={product.image_url} alt={product.name} className="object-cover h-full w-full rounded-lg" />
           ) : (
               <span className="text-lightTextSecondary dark:text-darkTextSecondary">No Image</span>
           )}
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-lightText dark:text-darkText mb-1">{product.name}</h1>
          <p className="text-sm md:text-base font-semibold text-lightTextSecondary dark:text-darkTextSecondary mb-4">
            Brand: <span className="text-darkBlue dark:text-cyan hover:underline cursor-pointer">AJ Special</span>
          </p>
          <p className="text-lightBlue dark:text-aqua text-3xl font-bold mb-5">Rs. {product.price}</p>
          
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
            <h4 className="bg-darkBlue dark:bg-[#1a1a1a] text-white px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-t-md">Product Description</h4>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed border border-lightBorder dark:border-darkBorder p-4 rounded-b-md bg-white dark:bg-[#0a0a0a]">
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
