import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ name: '', brand: 'AJ Brand', category_id: 1, price: '', stock: '', description: '', image_url: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Allowed formats: JPG, PNG, WebP');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5 MB limit');
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalProduct = { ...currentProduct };

      // Handle image file upload if chosen
      if (uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);
        if (finalProduct.id) formData.append('productId', finalProduct.id);
        formData.append('name', finalProduct.name);
        formData.append('category_id', finalProduct.category_id);
        const selectedCat = categories.find(c => c.id == finalProduct.category_id);
        if (selectedCat) formData.append('category_name', selectedCat.name);

        const uploadRes = await api.post('/products/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        finalProduct.image_url = uploadRes.data.imageUrl;
      }

      if (finalProduct.id) {
        await api.put(`/products/${finalProduct.id}`, finalProduct);
        toast.success('Product updated');
      } else {
        await api.post('/products', finalProduct);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      setUploadFile(null);
      setPreviewUrl(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openModal = (product = { name: '', brand: 'AJ Brand', category_id: 1, price: '', stock: '', description: '', image_url: '', is_featured: 0 }) => {
    setCurrentProduct({
      ...product,
      stock: product.physical_stock !== undefined ? product.physical_stock : product.stock
    });
    setUploadFile(null);
    setPreviewUrl(product.image_url || null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center"><Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-lightText dark:text-darkText">Product Management</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add Product</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-lightBg dark:bg-darkBg border-b border-lightBorder dark:border-darkBorder">
              <th className="p-4 text-darkBlue dark:text-cyan">Name</th>
              <th className="p-4 text-darkBlue dark:text-cyan">Brand</th>
              <th className="p-4 text-darkBlue dark:text-cyan">Price (Rs)</th>
              <th className="p-4 text-darkBlue dark:text-cyan">Stock</th>
              <th className="p-4 text-darkBlue dark:text-cyan">Featured</th>
              <th className="p-4 text-darkBlue dark:text-cyan">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-lightBg dark:bg-darkBg transition-colors">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-sm font-semibold text-darkBlue dark:text-cyan">{p.brand || 'AJ Brand'}</td>
                <td className="p-4 font-bold text-lightBlue dark:text-aqua">{p.price}</td>
                <td className="p-4">
                  <span className={(p.physical_stock !== undefined ? p.physical_stock : p.stock) < 5 ? "text-error-light dark:text-error-dark font-bold" : "text-success-light dark:text-success-dark"}>
                    {p.physical_stock !== undefined ? p.physical_stock : p.stock}
                  </span>
                  {p.reserved_stock > 0 && (
                    <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      ({p.reserved_stock} reserved)
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {p.is_featured ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      ★ Featured
                    </span>
                  ) : (
                    <span className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">—</span>
                  )}
                </td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => openModal(p)} className="text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-lightTextSecondary dark:text-darkTextSecondary hover:text-error-light dark:hover:text-error-dark"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{currentProduct.id ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm mb-1">Name</label><input type="text" value={currentProduct.name} onChange={e=>setCurrentProduct({...currentProduct, name: e.target.value})} className="input-field" required /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="block text-sm mb-1">Brand</label><input type="text" value={currentProduct.brand || ''} placeholder="e.g. AJ Brand, Golden Pearl" onChange={e=>setCurrentProduct({...currentProduct, brand: e.target.value})} className="input-field" /></div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Category</label>
                  <select value={currentProduct.category_id} onChange={e=>setCurrentProduct({...currentProduct, category_id: e.target.value})} className="input-field">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="block text-sm mb-1">Price (Rs)</label><input type="number" value={currentProduct.price} onChange={e=>setCurrentProduct({...currentProduct, price: e.target.value})} className="input-field" required /></div>
                <div className="flex-1"><label className="block text-sm mb-1">Stock</label><input type="number" value={currentProduct.stock} onChange={e=>setCurrentProduct({...currentProduct, stock: e.target.value})} className="input-field" required /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Image (JPG, PNG, WebP &le; 5 MB)</label>
                <div className="flex items-center gap-4 p-3 bg-lightBg dark:bg-darkBg rounded-lg border border-lightBorder dark:border-darkBorder">
                  {previewUrl ? (
                    <div className="w-16 h-16 bg-white rounded border border-lightBorder dark:border-darkBorder p-1 flex items-center justify-center shrink-0">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { e.target.src = '/images/placeholder-product.jpg'; }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white dark:bg-darkCard rounded border border-dashed border-lightBorder dark:border-darkBorder flex items-center justify-center text-xs text-center text-lightTextSecondary dark:text-darkTextSecondary p-1 shrink-0">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-darkBlue file:text-white dark:file:bg-cyan dark:file:text-darkBg hover:file:opacity-90 cursor-pointer"
                    />
                    <p className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                      Auto-resized to 800×800 square, centered on white background.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Image URL (Optional Manual Path)</label>
                <input
                  type="text"
                  value={currentProduct.image_url || ''}
                  onChange={e => {
                    setCurrentProduct({...currentProduct, image_url: e.target.value});
                    if (!uploadFile) setPreviewUrl(e.target.value);
                  }}
                  className="input-field"
                  placeholder="/images/products/category-slug/filename.jpg"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={Boolean(currentProduct.is_featured)}
                  onChange={e => setCurrentProduct({ ...currentProduct, is_featured: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-darkBlue dark:text-cyan border-lightBorder dark:border-darkBorder cursor-pointer"
                />
                <label htmlFor="is_featured" className="text-sm font-semibold cursor-pointer select-none">
                  Show in Homepage "Featured Products" Section
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-lightBorder dark:hover:bg-darkBorder rounded">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
