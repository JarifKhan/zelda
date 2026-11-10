'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Pencil, 
  Trash2, 
  Search, 
  Loader2, 
  AlertTriangle, 
  X, 
  Check, 
  Package, 
  Plus, 
  UploadCloud, 
  Star, 
  ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatCurrency, calculateSavingsPercent } from '@/lib/utils';
import { createProduct, updateProduct, deleteProduct, CreateProductData, UpdateProductData } from '@/actions/admin-products';
import { uploadProductImage } from '@/lib/supabase/storage';

interface ProductTableProps {
  initialProducts: Product[];
  categories: Category[];
}

interface ProductFormData {
  id?: string;
  title: string;
  brand: string;
  description: string;
  category_id: string;
  price: number;
  compare_at_price: number | string;
  stock: number;
  images: string[];
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  brand: '',
  description: '',
  category_id: '',
  price: 0,
  compare_at_price: '',
  stock: 0,
  images: [],
};

export function ProductTable({ initialProducts, categories }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State (handles both Create and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Dialog State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Page Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  });

  // Helper to compute total stock from product variants
  const getProductStock = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
    }
    return 0;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      ...EMPTY_FORM,
      category_id: categories.length > 0 ? categories[0].id : '',
    });
    setModalError(null);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setModalMode('edit');
    setFormData({
      id: product.id,
      title: product.title,
      brand: product.brand,
      description: product.description || '',
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      price: product.price,
      compare_at_price: product.compare_at_price ?? '',
      stock: getProductStock(product),
      images: product.images && product.images.length > 0 ? [...product.images] : [],
    });
    setModalError(null);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  // Handle Multi-file Upload (Cloud Bucket or Local Storage)
  const processFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploadingImage(true);
    setModalError(null);

    const uploadedUrls: string[] = [];
    const uploadErrors: string[] = [];

    const filesArray = Array.from(fileList);
    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        uploadErrors.push(`${file.name}: Not an image file`);
        continue;
      }
      const res = await uploadProductImage(file);
      if (res.url) {
        uploadedUrls.push(res.url);
      } else if (res.error) {
        uploadErrors.push(`${file.name}: ${res.error}`);
      }
    }

    if (uploadErrors.length > 0) {
      setModalError(`Upload notice: ${uploadErrors.join(', ')}`);
    }

    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    }

    setIsUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Add image by direct URL
  const handleAddUrlImage = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setImageUrlInput('');
  };

  // Star an image as Main Display Image (moves to index 0)
  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const nextImages = [...prev.images];
      const [selected] = nextImages.splice(index, 1);
      nextImages.unshift(selected);
      return { ...prev, images: nextImages };
    });
  };

  // Remove an image from the list
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Handle Form Submit (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    const compareAt =
      formData.compare_at_price !== '' && formData.compare_at_price !== null && formData.compare_at_price !== undefined
        ? Number(formData.compare_at_price)
        : undefined;

    if (modalMode === 'create') {
      const createPayload: CreateProductData = {
        title: formData.title,
        brand: formData.brand,
        description: formData.description,
        category_id: formData.category_id || undefined,
        price: Number(formData.price),
        compare_at_price: compareAt,
        stock: Number(formData.stock),
        images: formData.images,
      };

      const res = await createProduct(createPayload);

      if (!res.success || !res.product) {
        setModalError(res.error || 'Failed to create product in database');
        setIsSubmitting(false);
        return;
      }

      // Add to local state
      const matchingCat = categories.find((c) => c.id === formData.category_id);
      const newProductItem: Product = {
        ...res.product,
        category: matchingCat || res.product.category,
      };

      setProducts((prev) => [newProductItem, ...prev]);
      setSuccessMessage(`Product "${formData.title}" created successfully.`);
    } else {
      // Edit mode
      if (!formData.id) return;

      const updatePayload: UpdateProductData = {
        title: formData.title,
        brand: formData.brand,
        description: formData.description,
        category_id: formData.category_id || undefined,
        price: Number(formData.price),
        compare_at_price: compareAt,
        stock: Number(formData.stock),
        images: formData.images,
      };

      const res = await updateProduct(formData.id, updatePayload);

      if (!res.success) {
        setModalError(res.error || 'Failed to update product in database');
        setIsSubmitting(false);
        return;
      }

      // Update local state
      const matchingCat = categories.find((c) => c.id === formData.category_id);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== formData.id) return p;
          const updatedVariants = p.variants?.map((v, i) =>
            i === 0 ? { ...v, stock_quantity: Number(formData.stock) } : v
          ) || [
            {
              id: 'temp-var',
              product_id: p.id,
              sku: `SKU-${p.id.slice(0, 8)}`,
              name: 'Standard',
              stock_quantity: Number(formData.stock),
              attributes: {},
            },
          ];

          return {
            ...p,
            title: formData.title,
            brand: formData.brand,
            description: formData.description,
            category_id: formData.category_id,
            category: matchingCat || p.category,
            price: Number(formData.price),
            compare_at_price: compareAt ?? null,
            images: formData.images,
            variants: updatedVariants,
          };
        })
      );

      setSuccessMessage(`Updated "${formData.title}" successfully.`);
    }

    setIsModalOpen(false);
    setIsSubmitting(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const res = await deleteProduct(deletingProduct.id);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to delete product');
      setIsDeleting(false);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setSuccessMessage(`Deleted "${deletingProduct.title}".`);
    setDeletingProduct(null);
    setIsDeleting(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search Bar & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by title, brand, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-medium hidden md:inline">
            Showing <strong className="text-theme-ink">{filteredProducts.length}</strong> of {products.length}
          </span>

          <button
            onClick={handleOpenCreate}
            className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Page Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 uppercase tracking-wider font-bold">
              <th className="py-3.5 pl-4 pr-3">Product</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Brand</th>
              <th className="py-3.5 px-3">Price / MSRP</th>
              <th className="py-3.5 px-3">Savings</th>
              <th className="py-3.5 px-3">Stock</th>
              <th className="py-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No products found matching your search.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const stock = getProductStock(p);
                const savings = calculateSavingsPercent(p.price, p.compare_at_price);
                const thumbnail = p.images && p.images.length > 0 ? p.images[0] : null;

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-14 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                          {thumbnail ? (
                            <Image src={thumbnail} alt={p.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-semibold text-theme-ink line-clamp-1 hover:text-theme-primary transition-colors">
                            {p.title}
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono">/{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="bg-neutral-100 text-neutral-700 font-medium px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap">
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold uppercase text-[11px] text-neutral-600 whitespace-nowrap">
                      {p.brand}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-theme-ink text-sm">{formatCurrency(p.price)}</span>
                        {p.compare_at_price && (
                          <span className="text-[11px] text-neutral-500 line-through">
                            {formatCurrency(p.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {savings ? (
                        <span className="bg-theme-secondary/20 text-theme-ink border border-theme-secondary/30 font-bold px-2 py-0.5 rounded text-[10px]">
                          Save {savings}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-md text-xs ${
                          stock === 0
                            ? 'bg-rose-100 text-rose-800'
                            : stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {stock} in stock
                      </span>
                    </td>

                    <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-theme-ink rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-sans font-black text-theme-ink">
                  {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {modalMode === 'create'
                    ? 'Publish a new item to your cloud catalog'
                    : 'Update product merchandising details and inventory'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Internal Error Banner */}
            {modalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start justify-between gap-2 animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{modalError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalError(null)}
                  className="text-rose-600 hover:text-rose-900 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber & Santal Botanical Soy Candle (14 oz)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Brand <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maison Luminaire"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-white font-medium text-neutral-800"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((c) => {
                        const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
                        return (
                          <option key={c.id} value={c.id}>
                            {parent ? `${parent.name} → ${c.name}` : `★ ${c.name}`}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product story, botanical notes, materials, or dimensions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 resize-y"
                />
              </div>

              {/* Pricing & Stock Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="18.99"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">MSRP ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="42.00"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="25"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 font-semibold"
                  />
                </div>
              </div>

              {/* IMAGE MANAGEMENT WITH STORAGE UPLOADS */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700">
                    Product Images ({formData.images.length})
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    First image is Main Display Thumbnail
                  </span>
                </div>

                {/* Upload Trigger Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-neutral-300 hover:border-neutral-800 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                      <span>Uploading image...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <UploadCloud className="w-6 h-6 text-neutral-400" />
                      <p className="text-xs font-semibold text-neutral-700">
                        Click or drag images here to upload
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        PNG, JPG, WEBP, GIF (up to 15MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Paste URL Option */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="Or paste an image URL (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50 text-theme-ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    disabled={!imageUrlInput.trim()}
                    className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Uploaded Thumbnails Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-1">
                    {formData.images.map((imgUrl, idx) => {
                      const isMain = idx === 0;
                      return (
                        <div
                          key={imgUrl + idx}
                          className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                            isMain ? 'border-amber-400 ring-2 ring-amber-200' : 'border-neutral-200'
                          }`}
                        >
                          <Image src={imgUrl} alt={`Upload ${idx + 1}`} fill className="object-cover" unoptimized />

                          {/* Main Badge */}
                          {isMain && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Main</span>
                            </span>
                          )}

                          {/* Hover Controls */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(idx)}
                                title="Set as Main Display Image"
                                className="p-1.5 bg-white text-neutral-800 hover:text-amber-600 rounded-full shadow-md transition-colors cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Remove Image"
                              className="p-1.5 bg-white text-neutral-800 hover:text-rose-600 rounded-full shadow-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingImage}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="bg-theme-primary hover:bg-theme-primary-hover disabled:bg-neutral-300 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{modalMode === 'create' ? 'Creating Product...' : 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Create Product' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white text-theme-ink rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-sans font-black text-theme-ink">Delete Product</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete <strong className="text-theme-ink">&quot;{deletingProduct.title}&quot;</strong>? This action will remove the product and its inventory variants from your Supabase database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-theme-primary hover:bg-theme-primary-hover disabled:bg-neutral-300 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
