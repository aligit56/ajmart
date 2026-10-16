import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="card hover:shadow-lg transition-transform hover:scale-[1.02] flex flex-col h-full overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative h-64 bg-white dark:bg-darkBg p-2 flex items-center justify-center overflow-hidden border-b border-lightBorder dark:border-darkBorder group">
        {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105" 
            />
        ) : (
            <span className="text-lightTextSecondary dark:text-darkTextSecondary text-sm">No Image</span>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block mb-1">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-lightBlue dark:text-cyan block">
            {product.brand || 'AJ Brand'}
          </span>
          <h3 className="font-semibold text-lg hover:text-darkBlue dark:hover:text-cyan line-clamp-2">{product.name}</h3>
        </Link>
        <div className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mb-3 flex-grow">
          {product.stock > 0 ? (
             <span className="text-success-light dark:text-success-dark text-xs">In Stock ({product.stock})</span>
          ) : (
             <span className="text-error-light dark:text-error-dark text-xs">Out of Stock</span>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xl font-bold text-lightBlue dark:text-aqua">Rs {product.price}</span>
          <button 
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="bg-darkBlue dark:bg-cyan text-black p-2 rounded hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
