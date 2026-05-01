const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3005;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock API routes
app.get('/api/cpus', (req, res) => {
  res.json([{ id: 1, name: 'Intel Core i9', socketType: 'LGA 1200', powerDraw: 125 }, { id: 2, name: 'AMD Ryzen 9', socketType: 'AM4', powerDraw: 105 }]);
});
app.get('/api/gpus', (req, res) => {
  res.json([{ id: 1, name: 'NVIDIA GeForce RTX 3080', powerDraw: 320 }, { id: 2, name: 'AMD Radeon RX 6800 XT', powerDraw: 260 }]);
});
app.get('/api/ddr5ram', (req, res) => {
  res.json([{ id: 1, name: 'Corsair Vengeance LPX 16GB', powerDraw: 10 }, { id: 2, name: 'G.Skill Trident Z5 16GB', powerDraw: 12 }]);
});
app.get('/api/motherboards', (req, res) => {
  res.json([{ id: 1, name: 'ASRock Z590 Extreme4', socketType: 'LGA 1200' }, { id: 2, name: 'MSI B550M BAZOOKA', socketType: 'AM4' }]);
});
app.get('/api/powersupplies', (req, res) => {
  res.json([{ id: 1, name: 'EVGA 650 GS, 80+ Gold 650W', wattage: 650 }, { id: 2, name: 'Corsair RM650, 80+ Gold 650W', wattage: 650 }]);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});