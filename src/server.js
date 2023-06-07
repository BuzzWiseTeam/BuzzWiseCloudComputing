const express = require('express');
const cors = require('cors');

const JobRoutes = require('./routes/jobRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 1908;

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static('./views/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/jobs', JobRoutes.routes);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});