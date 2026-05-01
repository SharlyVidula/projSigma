const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const port = 3000;
app.get('/api/cpus', (req, res) => {
  res.json([{ id: 1, name: 'CPU1', socket: 'AM4', wattage: 65 }, { id: 2, name: 'CPU2', socket: 'LGA1200', wattage: 95 }]);
});
app.get('/api/motherboards', (req, res) => {
  res.json([{ id: 1, name: 'Motherboard1', socket: 'AM4' }, { id: 2, name: 'Motherboard2', socket: 'LGA1200' }]);
});
app.get('/api/gpus', (req, res) => {
  res.json([{ id: 1, name: 'GPU1', wattage: 250 }, { id: 2, name: 'GPU2', wattage: 320 }]);
});
app.get('/api/ram', (req, res) => {
  res.json([{ id: 1, name: 'RAM1', wattage: 10 }, { id: 2, name: 'RAM2', wattage: 15 }]);
});
app.get('/api/power-supplies', (req, res) => {
  res.json([{ id: 1, name: 'PowerSupply1', wattage: 650 }, { id: 2, name: 'PowerSupply2', wattage: 850 }]);
});
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});