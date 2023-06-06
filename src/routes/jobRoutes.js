const express = require('express');
const { addJob, getAllJobs, getJob, deleteJob } = require('../controllers/jobController');

const router = express.Router();

router.post('/addJob', addJob);
router.get('/allJobs', getAllJobs);
router.get('/job/:id', getJob);
router.delete('/job/:id', deleteJob);

module.exports = { routes: router };