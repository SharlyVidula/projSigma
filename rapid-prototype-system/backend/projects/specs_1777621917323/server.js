const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const port = 3000;
app.get('/api/cpus', (req, res) => {
  res.json([{ id: 1, name: 'Intel Core i9', socket: 'LGA 1200', powerDraw: 125 }, { id: 2, name: 'AMD Ryzen 9', socket: 'AM4', powerDraw: 105 }]);
});
app.get('/api/motherboards', (req, res) => {
  res.json([{ id: 1, name: 'ASRock Z590', socket: 'LGA 1200' }, { id: 2, name: 'MSI B550', socket: 'AM4' }]);
});
app.get('/api/gpus', (req, res) => {
  res.json([{ id: 1, name: 'NVIDIA GeForce RTX 3080', powerDraw: 320 }, { id: 2, name: 'AMD Radeon RX 6800 XT', powerDraw: 260 }]);
});
app.get('/api/ram', (req, res) => {
  res.json([{ id: 1, name: 'Corsair Vengeance LPX 16GB', capacity: 16, powerDraw: 1.2 }, { id: 2, name: 'HyperX Fury RGB 16GB', capacity: 16, powerDraw: 1.35 }]);
});
app.get('/api/power-supplies', (req, res) => {
  res.json([{ id: 1, name: 'EVGA 650 GS, 80+ Gold 650W', wattage: 650 }, { id: 2, name: 'Corsair RM650, 80+ Gold 650W', wattage: 650 }]);
});
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});