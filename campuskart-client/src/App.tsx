import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import axios from 'axios'
import { userAtom } from './store/user.atom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import OAuthCallback from './pages/OAuthCallback'

export default function App() {
  const setUser = useSetRecoilState(userAtom);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored token on app load
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const phoneNumber = localStorage.getItem('phoneNumber');
      const hostelName = localStorage.getItem('hostelName');
      const userId = localStorage.getItem('userId');
      
      if (token && username && email) {
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Restore user state
        setUser({
          isLoggedIn: true,
          email: email,
          username: username,
          token: token,
          phoneNumber: phoneNumber || null,
          hostelName: hostelName || null,
          userId: userId || null,
        });
      }
      
      setIsInitialized(true);
    };

    initAuth();
  }, [setUser]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Routes>
    </div>
  )
}
