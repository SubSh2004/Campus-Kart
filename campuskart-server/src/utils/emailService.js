import nodemailer from 'nodemailer';

// Create a persistent transporter (reuse connection)
let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }
  
  // Check if using SendGrid (for production on Render)
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid for email delivery');
    transporter = (nodemailer.default || nodemailer).createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Use Gmail for local development
    console.log('📧 Using Gmail for email delivery');
    transporter = (nodemailer.default || nodemailer).createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });
  }
  
  return transporter;
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('📧 Attempting to send OTP email to:', email);
    console.log('📧 Using email account:', process.env.EMAIL_USER);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'CampusZon - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">CampusZon Email Verification</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Thank you for signing up for CampusZon! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #6366f1; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">CampusZon - Your Campus Marketplace</p>
        </div>
      `,
    };

    // Set a timeout to prevent hanging
    const sendEmailWithTimeout = () => {
      return Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000)
        )
      ]);
    };

    const result = await sendEmailWithTimeout();
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful signup
export const sendWelcomeEmail = async (email, username) => {
  try {
    console.log('📧 Attempting to send welcome email to:', email);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to CampusZon! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CampusZon! 🎉</h1>
          </div>
          
          <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">Congratulations! Your login to <strong>CampusZon</strong> was successful.</p>
          
          <p style="font-size: 16px; color: #333;">You can now:</p>
          <ul style="font-size: 15px; color: #555; line-height: 1.8;">
            <li>📦 Browse items from your campus community</li>
            <li>🛍️ List items for sale or rent</li>
            <li>💬 Connect with other students</li>
            <li>🔍 Search for exactly what you need</li>
          </ul>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>Pro Tip:</strong> Complete your profile with your phone number and hostel details to make it easier for buyers to reach you!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3001'}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Exploring
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">If you have any questions or need help, feel free to reach out to us.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">CampusZon - Your Campus Marketplace</p>
          <p style="font-size: 11px; color: #999; text-align: center;">This email was sent because you successfully signed up for CampusZon.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};
