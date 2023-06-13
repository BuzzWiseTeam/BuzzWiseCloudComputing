const { Storage } = require('@google-cloud/storage');
const UUID = require('uuid-v4');
const formidable = require('formidable-serverless');

const FirebaseDatabase = require('../database');

const jobsCollection = FirebaseDatabase.firestore().collection('jobs');

const storage = new Storage({
    projectId: 'buzz-wise-team',
    keyFilename: 'serviceAccountKey.json',
});

const addJob = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (error, fields, files) => {
            const id = UUID();

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            const { companyProfileImage } = files;

            // URL of the uploaded image
            let imageURL;

            const documentID = jobsCollection.doc().id;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.errorMessage
                });
            }

            const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

            if (companyProfileImage.size === 0) {
                // Do nothing
                res.send('No company profile image');
            } else {
                const imageResponse = await bucket.upload(companyProfileImage.path, {
                    destination: `jobs/${companyProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: id
                        }
                    }
                });

                // Profile image url
                // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${id}`;

                imageURL = storagePublicURL + imageResponse[0].name;
            }

            const date = new Date();

            const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

            // Object to send to the database
            const jobData = {
                id: documentID,
                title: fields.title,
                companyName: fields.companyName,
                location: fields.location,
                email: fields.email,
                jobType: fields.jobType,
                requiredSkills: fields.requiredSkills,
                jobDescription: fields.jobDescription,
                companyProfileImage: companyProfileImage.size === 0 ? '' : imageURL,
                createdAt: getDateAndTime
            };

            // Added to the firestore collection
            await jobsCollection.doc(documentID).set(jobData, { merge: true }).then(() => {
                res.status(201).send({
                    message: 'Successfully Added a Job',
                    data: jobData
                });
            });
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Added a Job!',
            error: error.errorMessage
        });
    }
};

const getAllJobs = async (req, res) => {
    try {
        await jobsCollection.get().then((value) => {
            const jobsData = value.docs.map((document) => document.data());

            res.status(200).send({
                message: 'Display All Job Listings',
                data: jobsData
            });
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Display All Job Listings!',
            error: error.errorMessage
        });
    }
};

const getJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const jobs = await jobsCollection.doc(jobId);
        const job = await jobs.get();

        if (!job.exists)
        {
            res.status(404).send({
                message: 'Cannot Found Job!'
            });
        } else {
            res.status(200).send({
                message: 'Display a Job',
                data: job.data()
            });
        }

        /* Using list
        await jobsCollection.where('id', '==', req.params.id).get().then((value) => {
            const jobData = value.docs.map((document) => document.data());

            res.status(200).send({
                message: 'Display a Job Data',
                data: jobData
            });
        });
        */
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Display a Job!',
            error: error.errorMessage
        });
    }
};

const updateJob = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (error, fields, files) => {
            const { id } = req.params;

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            const { companyProfileImage } = files;

            // URL of the uploaded image
            let imageURL;

            if (error) {
                return res.status(400).json({
                    message: 'There was an error parsing the files!',
                    error: error.errorMessage
                });
            }

            const bucket = storage.bucket(`gs://${bucketName}.appspot.com`);

            if (companyProfileImage.size === 0) {
                // Do nothing
                res.send('No company profile image');
            } else {
                const imageResponse = await bucket.upload(companyProfileImage.path, {
                    destination: `jobs/${companyProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: id
                        }
                    }
                });

                // Profile image url
                // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uuid}`;

                imageURL = storagePublicURL + imageResponse[0].name;
            }

            // Object to send to the database
            const jobData = {
                title: fields.title,
                companyName: fields.companyName,
                location: fields.location,
                email: fields.email,
                jobType: fields.jobType,
                requiredSkills: fields.requiredSkills,
                jobDescription: fields.jobDescription,
                companyProfileImage: companyProfileImage.size === 0 ? '' : imageURL,
            };

            // Update to the firestore collection
            await jobsCollection.doc(id).update(jobData, { merge: true }).then(() => {
                res.status(202).send({
                    message: 'Successfully Update a Job',
                    data: jobData
                });
            });
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update a Job!',
            error: error.errorMessage
        });
    }
};

const deleteJob = async (req, res) => {
    try {
        await jobsCollection.doc(req.params.id).delete();

        res.status(202).send({
            message: 'Delete Job Successfully'
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Delete a Job!',
            error: error.errorMessage
        });
    }
};

module.exports = { addJob, getAllJobs, getJob, updateJob, deleteJob };