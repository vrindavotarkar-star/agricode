const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      mobile,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, mobile, email, password } = req.body;

    let user;

    if (email) {
      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Try to find user by email
      user = await User.findOne({ email });
      if (user) {
        // Check password for existing user
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid password' });
        }
      } else {
        // Generate unique mobile for email login
        let uniqueMobile;
        do {
          uniqueMobile = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        } while (await User.findOne({ mobile: uniqueMobile }));

        // Create new user with provided password
        user = new User({
          username: email,
          email,
          mobile: uniqueMobile,
          password: password
        });
        await user.save();
      }
    } else if (username && mobile) {
      // Try to find user by username and mobile
      user = await User.findOne({ username, mobile });
      if (user) {
        // Check password for existing user
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid password' });
        }
      } else {
        // Create new user with provided password
        user = new User({
          username,
          email: `${username}_${mobile}@demo.com`,
          mobile,
          password
        });
        await user.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid login credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
