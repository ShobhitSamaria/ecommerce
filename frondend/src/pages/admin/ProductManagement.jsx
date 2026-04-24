import { useState } from "react";
import { useData } from "../../context/DataContext";
import { updateProductApi } from "../../services/productService.js";
import { CATEGORIES } from "../../utils/data";
import { formatPrice } from "../../utils/currency";

function ProductManagement() {
    const { products, addProduct, deleteProduct, loadProducts } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Mobile Phones',
        price: '',
        stockUnit: '',
        description: '',
        imagePreview: '',
        imageFile: null
    });

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Mobile Phones',
            price: '',
            stockUnit: '',
            description: '',
            imagePreview: '',
            imageFile: null
        });
        setEditingProduct(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                imagePreview: previewUrl,
                imageFile: file
            }));
        }
    };

    const handleOpenModal = (e, product = null) => {
        // Stop any default action that triggers page reload
        if(e) e.preventDefault();

        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                stockUnit: product.stockUnit,
                description: product.description,
                imagePreview: product.image,
                imageFile: null
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = (e) => {
        if(e) e.preventDefault();
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {


        e.preventDefault(); // This is crucial to stop URL refresh
        setLocalLoading(true);

        const data = new FormData();
        console.log('inside the handleSubmit', formData);
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("price", formData.price);
        data.append("stockUnit", formData.stockUnit);
        data.append("description", formData.description);

        if (formData.imageFile) {
            data.append("image", formData.imageFile);
        }

        try {
            if (editingProduct) {
                await updateProductApi(editingProduct.id, data);
            } else {
                console.log('inside the handle submit befor addProduct calling', data);
                await addProduct(data);
            }
            await loadProducts();
            handleCloseModal();
        } catch (err) {
            alert("Error saving product!");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                {/* Explicitly set type="button" */}
                <button
                    type="button"
                    onClick={(e) => handleOpenModal(e)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition"
                >
                    <span className="text-xl">+</span> Add Product
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-4">
                                <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt="" />
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(product.price)}</td>
                            <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stockUnit > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.stockUnit} Units
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button type="button" onClick={(e) => handleOpenModal(e, product)} className="text-orange-600 hover:underline mr-4">Edit</button>
                                <button type="button" onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - Fixed logic */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay - stopPropagation prevents modal closing logic from firing accidentally */}
                    <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                    onClick={handleCloseModal}
                    ></div>

                    <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full z-50 overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Product Name</label>
                                <input type="text" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <select
                                    required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Price ({formatPrice(0).replace('0.00', '').trim()})</label>
                                    <input type="number" required className="w-full border rounded-lg p-2 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Stock</label>
                                    <input type="number" required className="w-full border rounded-lg p-2 outline-none" value={formData.stockUnit} onChange={e => setFormData({...formData, stockUnit: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Image</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                {formData.imagePreview && <img src={formData.imagePreview} className="mt-2 h-20 w-20 object-cover rounded shadow" alt="preview" />}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea required rows="3" className="w-full border rounded-lg p-2 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 justify-end">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={localLoading} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                    {localLoading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductManagement;