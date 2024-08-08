const { User } = require('../models/users');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users
router.get('/', async (req, res) => {
    try {
        const userList = await User.find();
        if (!userList) {
            return res.status(500).json({ success: false });
        }
        res.send(userList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users count' });
    }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/register', async (req, res) => {
  try {
      const { name, email, password, phoneNumber } = req.body;

      // Check if the email is provided
      if (!name || !email || !phoneNumber) {
          return res.status(400).json({ message: 'Name, email, and phone number are required.' });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists.' });
      }

      // Hash the password if provided
      let hashedPassword;
      if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
      }

      const isAdmin = email === 'admin9092@dijitalspormedya.com';

      // Create a new user
      const user = new User({
          name,
          email,
          password: hashedPassword, // Only include if password is provided
          phoneNumber,
          isAdmin, // Set isAdmin based on email
      });

      // Save the user
      const savedUser = await user.save();
      if (!savedUser) {
          return res.status(500).json({ error: 'Failed to register user' });
      }

      // Generate a JWT token
      const token = jwt.sign(
          { id: savedUser._id, email: savedUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      // Send response
      res.status(201).json({ message: 'User registered successfully', user: savedUser, token });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: error.message });
  }
});

// router.post('/google', async (req, res, next) => {
//   try {
//       const user = await User.findOne({email: req.body.email})
//       if(user){
//           const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
//           const {password: pass, ...rest} = user._doc;
//           res
//           .cookie('access_token', token, {httpOnly: true})
//           .status(200)
//           .json(rest);
//       }
//       else{
//           const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
//           const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
//           const newUser = new User({
//               name: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
//               email: req.body.email, password: hashedPassword, avatar: req.body.photo
//           });
//           await newUser.save();
//           const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET);
//           res.cookie('access_token', token, {httpOnly: true}).status(200).json(rest);
//       }
//       res.json({ message: 'Success' });
//   } catch (error) {
//       next(error);
//   }
// });


// router.post("/googleRegister", async (req, res) => {
//   try {
//   const { name, email, googleId, displayPicture } = req.body;
//   const userFound = await User.findOne({ uid });
//   if (userFound) {
//   return res.status(422).json({ error: "User already exists!" });
//   } else {
//   const newUser = new User({
//   name,
//   googleId,
//   email,
//   displayPicture,
//   });
//   const registerUser = await newUser.save();
//   }
//   res.status(201).json({ message: "User registered successfully!!" });
//   } catch (error) {
//   console.log('error occured: $(error.message)');
//   }
//   });

// Add this route in usersRoutes
// router.post('/google-auth', async (req, res) => {
//   const { name, email, googleId, phoneNumber } = req.body;

//   try {
//     if (!googleId) {
//       return res.status(400).json({ message: 'Google ID is required' });
//     }

//     // Check if the user already exists
//     let user = await User.findOne({ email });

//     if (user) {
//       // User exists, update googleId if not already present
//       if (!user.googleId) {
//         user.googleId = googleId;
//         await user.save();
//       }
//     } else {
//       // Create a new user
//       user = new User({
//         name,
//         email,
//         phoneNumber: phoneNumber || "", // Ensure phoneNumber is always provided
//         googleId,
//       });
//       await user.save();
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(201).json({ message: 'User authenticated successfully', user, token });
//   } catch (error) {
//     console.error('Error during Google authentication:', error);
//     res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// });

  

// Login user

// Define the route for Google authentication
router.post('/google', async (req, res) => {
    const { name, email, avatar } = req.body;
    
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      // Check if the user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        // User exists, generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const { password: pass, ...rest } = user._doc;
        return res.status(200).json({ message: 'User authenticated successfully', user: rest, token });
      } else {
        // Create a new user
        user = new User({
          name,
          email,
          avatar,
          googleId: null, // googleId should be null or a default value if not provided
        });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({ message: 'User registered successfully', user, token });
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  
  


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ user: user, token: token, msg: "User Authenticated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user details
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, isAdmin, isActive } = req.body;

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                isAdmin,
                isActive,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ message: 'User cannot be updated!', success: false });
        }

        res.send(updatedUser);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found!', status: false });
        }
        res.status(200).json({ message: 'The user is deleted!', status: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// server/routes/usersRoutes.js

router.get('/signout', async (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('User Logged Out Successfully!');
    } catch (error) {
        next(error);
    }
});


router.post('/update-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found!', success: false });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully!', success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

module.exports = router;
