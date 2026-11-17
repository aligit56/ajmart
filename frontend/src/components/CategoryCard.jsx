import React from 'react';
import { Link } from 'react-router-dom';
import { normalizeImageUrl, handleCategoryImageError } from '../utils/imageHelpers';

const CategoryCard = ({ category }) => {
  const imageUrl = normalizeImageUrl(category.image_url);

  return (
    <Link 
      to={`/category/${category.id}`} 
      className="block w-full group transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="bg-white dark:bg-[#1a1a1a] border border-lightBorder dark:border-[#333] rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover:border-darkBlue dark:group-hover:border-cyan transition-all duration-300">
        
        {/* Image Container */}
        <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-black/40 flex items-center justify-center overflow-hidden relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={category.name} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleCategoryImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-xs text-gray-400">No Image</span>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="py-2.5 px-3 text-center bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-xs sm:text-sm font-semibold text-lightText dark:text-[#e0e0e0] leading-snug line-clamp-1 group-hover:text-darkBlue dark:group-hover:text-cyan transition-colors">
            {category.name}
          </h3>
        </div>

      </div>
    </Link>
  );
};

export default CategoryCard;
