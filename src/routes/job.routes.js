const express = require('express');

const { addJob, getAllJobs, getJobDetail, updateJob, deleteJob } = require('../controllers/jobController');

const router = express.Router();

router.post('/addJob', addJob);

router.get('/allJobs', getAllJobs);
router.get('/job/:id', getJobDetail);

router.put('/updateJob/:id', updateJob);

router.delete('/deleteJob/:id', deleteJob);

module.exports = { routes: router };