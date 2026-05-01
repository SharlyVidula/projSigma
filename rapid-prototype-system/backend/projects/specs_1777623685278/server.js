const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3005;
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/recruithub', { useNewUrlParser: true, useUnifiedTopology: true });
const candidateSchema = new mongoose.Schema({
  name: String,
  skills: String,
  experience: String,
  education: String,
  status: String
});
const Candidate = mongoose.model('Candidate', candidateSchema);
app.get('/candidates', async (req, res) => {
  const candidates = await Candidate.find();
  res.json(candidates);
});
app.post('/candidates', async (req, res) => {
  const candidate = new Candidate(req.body);
  await candidate.save();
  res.json(candidate);
});
app.put('/candidates/:id', async (req, res) => {
  const id = req.params.id;
  const candidate = await Candidate.findByIdAndUpdate(id, req.body, { new: true });
  res.json(candidate);
});
app.delete('/candidates/:id', async (req, res) => {
  const id = req.params.id;
  await Candidate.findByIdAndRemove(id);
  res.json({ message: 'Candidate deleted successfully' });
});
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));