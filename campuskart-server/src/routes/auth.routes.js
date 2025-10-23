import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('📍 OAuth callback received');
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3001'}/login`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('✅ User authenticated:', req.user?.email);
      
      if (!req.user) {
        console.log('❌ No user found in request');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?error=no_user`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: req.user._id,
          email: req.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Prepare user data
      const userData = {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        hostelName: req.user.hostelName,
        token: token,
        isLoggedIn: true
      };

      console.log('📤 Redirecting to frontend with user data:', {
        username: userData.username,
        email: userData.email,
        hasPhone: !!userData.phoneNumber,
        hasHostel: !!userData.hostelName
      });
      
      // Encode user data to pass to frontend
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      
      // Redirect to frontend with user data
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      res.redirect(`${clientUrl}/oauth-callback?data=${encodedData}`);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/login?error=oauth_failed`);
    }
  }
);

export default router;
