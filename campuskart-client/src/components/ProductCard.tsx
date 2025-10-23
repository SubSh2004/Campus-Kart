import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

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

interface ProductCardProps {
  item: Item;
}

export default function ProductCard({ item }: ProductCardProps) {
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepend backend URL to image path
  const imageUrl = item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '/placeholder.jpg';

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to chat');
        navigate('/login');
        return;
      }

      if (!item.userId) {
        alert('Unable to start chat: Seller information not available');
        return;
      }

      // Create or get chat with the seller
      const response = await axios.post(
        'http://localhost:5000/api/chat/chat',
        { otherUserId: item.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Navigate to chat page with the selected chat
        navigate('/chat', { state: { selectedChatId: response.data.chat._id } });
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!item.userPhone && !item.userEmail) {
      alert('Contact information not available');
      return;
    }

    const contactInfo = [];
    if (item.userName) contactInfo.push(`Seller: ${item.userName}`);
    if (item.userEmail) contactInfo.push(`Email: ${item.userEmail}`);
    if (item.userPhone) contactInfo.push(`Phone: ${item.userPhone}`);
    
    alert(contactInfo.join('\n'));
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book items');
      navigate('/login');
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/booking/book',
        {
          itemId: item.id,
          message: bookingMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Booking request sent successfully!');
        setShowBookingModal(false);
        setBookingMessage('');
      }
    } catch (error: any) {
      console.error('Error booking item:', error);
      alert(error.response?.data?.message || 'Failed to send booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Link to={`/item/${item.id}`} className="block group">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border dark:border-gray-700">
          <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700 relative">
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            {/* Availability Badge on Image */}
            <div className="absolute top-2 right-2">
              {item.available ? (
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  Available
                </span>
              ) : (
                <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  Sold Out
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{parseFloat(item.price.toString()).toFixed(2)}
              </span>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                {item.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleChatClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
              </button>
              <button
                onClick={handleBookClick}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Book
              </button>
              <button
                onClick={handleContactClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBookingModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Book Item</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send a booking request for <span className="font-semibold">{item.title}</span>
            </p>
            <textarea
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
              placeholder="Add a message (optional)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 min-h-[100px]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
