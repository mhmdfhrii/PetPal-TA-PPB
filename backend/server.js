
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const animalRoutes = require('./routes/animalRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route utama
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to PetPal API!',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'PetPal API is running',
  });
});

// Animals API
app.use('/api/animals', animalRoutes);

// Shelters API
app.use('/api/shelters', shelterRoutes);

// Adoptions API
app.use('/api/adoptions', adoptionRoutes);

// Users API
app.use('/api/users', userRoutes);

// Route tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
  });
});

// Menjalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PetPal API running on port ${PORT}`);
});
