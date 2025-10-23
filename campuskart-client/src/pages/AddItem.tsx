import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { userAtom } from '../store/user.atom';

export default function AddItem() {
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if user is logged in
    if (!user.isLoggedIn) {
      setError('You must be logged in to add an item');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      setError('All fields are required');
      return;
    }

    if (parseFloat(formData.price) < 0) {
      setError('Price cannot be negative');
      return;
    }

    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);

    try {
      // Create FormData object
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('image', image);
      data.append('userId', user.userId || '');
      data.append('userName', user.username || '');
      data.append('userPhone', user.phoneNumber || '');
      data.append('userHostel', user.hostelName || '');
      data.append('userEmail', user.email || '');

      // Send POST request
      const response = await axios.post('/api/items/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Item added successfully!');
        
        // Navigate to homepage after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add item. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 dark:border dark:border-gray-700">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Item</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">List your item for sale on CampusZon</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
            title="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., iPhone 13 Pro"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Describe your item in detail..."
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            >
              <option value="">Select a category</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Furniture">Furniture</option>
              <option value="Sports">Sports & Fitness</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/50"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Adding Item...' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
