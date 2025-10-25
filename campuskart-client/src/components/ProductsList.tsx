import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import axios from 'axios';
import { userAtom } from '../store/user.atom';
import ProductCard from './ProductCard';

interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface ProductsListProps {
  searchQuery?: string;
  selectedCategory?: string;
  availabilityFilter?: string;
}

export default function ProductsList({ searchQuery = '', selectedCategory = 'All', availabilityFilter = 'All' }: ProductsListProps) {
  const user = useRecoilValue(userAtom);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Extract email domain from user email
        let emailDomain = '';
        if (user.email) {
          emailDomain = user.email.split('@')[1] || '';
        }
        
        // If no domain or not logged in, show message
        if (!emailDomain) {
          setError('Please login to view items from your campus.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/items?emailDomain=${emailDomain}`);
        
        if (response.data.success) {
          setItems(response.data.items);
        }
      } catch (err: any) {
        console.error('Error fetching items:', err);
        setError(err.response?.data?.message || 'Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // Filter items based on search query, category, and availability
  const filteredItems = items.filter((item) => {
    // Filter by search query
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'All') {
      matchesCategory = item.category === selectedCategory;
    }
    
    // Filter by availability
    let matchesAvailability = true;
    if (availabilityFilter && availabilityFilter !== 'All') {
      matchesAvailability = availabilityFilter === 'Available' ? item.available : !item.available;
    }
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20">
        <div className="inline-block p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mx-3">
          {searchQuery ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">No items found for "{searchQuery}"</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">Try searching with different keywords</p>
            </>
          ) : (selectedCategory && selectedCategory !== 'All') || (availabilityFilter && availabilityFilter !== 'All') ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                No items found {selectedCategory !== 'All' ? `in ${selectedCategory}` : ''} 
                {selectedCategory !== 'All' && availabilityFilter !== 'All' ? ' - ' : ''}
                {availabilityFilter !== 'All' ? availabilityFilter : ''}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">No items available yet.</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">Be the first to list an item!</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {filteredItems.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
