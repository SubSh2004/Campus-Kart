import { getSequelize, getItemModel } from '../db/postgres.js';
import imgbbUploader from 'imgbb-uploader';

// Create a new item
export const createItem = async (req, res) => {
  try {
    const { title, description, price, category, userId, userName, userPhone, userHostel, userEmail } = req.body;

    // Check if PostgreSQL is connected
    try {
      const sequelize = getSequelize();
      if (!sequelize) {
        return res.status(503).json({
          success: false,
          message: 'Database not available. Please configure PostgreSQL connection.',
        });
      }
    } catch (dbError) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Please configure PostgreSQL connection.',
      });
    }

    // Validation
    if (!title || !description || !price || !category || !userId || !userName || !userPhone || !userHostel || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate price is a number
    if (isNaN(price) || parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    // Extract email domain
    const emailDomain = userEmail.split('@')[1] || '';
    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Upload image to ImgBB if present
    let imageUrl = null;
    if (req.file) {
      try {
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        
        // Upload to ImgBB
        const response = await imgbbUploader({
          apiKey: process.env.IMGBB_API_KEY,
          base64string: base64Image,
          name: `${Date.now()}-${req.file.originalname}`,
        });
        
        imageUrl = response.url; // Get the permanent cloud URL
      } catch (uploadError) {
        console.error('ImgBB upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
        });
      }
    }

    // Get Item model
    const Item = getItemModel();

    // Create new item
    const newItem = await Item.create({
      title,
      description,
      price: parseFloat(price),
      category,
      imageUrl,
      available: true,
      userId,
      userName,
      userPhone,
      userHostel,
      userEmail,
      emailDomain,
    });

    // Return response
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: newItem,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating item',
      error: error.message,
    });
  }
};

// Get all items (filtered by email domain)
export const getAllItems = async (req, res) => {
  try {
    const { emailDomain } = req.query;
    
    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: 'Email domain is required',
      });
    }

    const Item = getItemModel();
    const items = await Item.findAll({
      where: {
        emailDomain: emailDomain,
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items',
      error: error.message,
    });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const Item = getItemModel();
    
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item',
      error: error.message,
    });
  }
};

// Update item by ID
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, available } = req.body;
    
    const Item = getItemModel();
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Update fields
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (category !== undefined) updates.category = category;
    if (available !== undefined) updates.available = available;

    await item.update(updates);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item',
      error: error.message,
    });
  }
};

// Delete item by ID
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const Item = getItemModel();
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item',
      error: error.message,
    });
  }
};
