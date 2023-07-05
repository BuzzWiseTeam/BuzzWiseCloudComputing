const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');

const formidable = require('formidable-serverless');

const firebaseAdmin = require('../config/firebaseAdmin');
const JobModel = require('../models/jobModel');

const JobsCollection = firebaseAdmin.firestore().collection('jobs');

const CloudStorage = new Storage({
    projectId: 'buzz-wise-team',
    keyFilename: 'serviceAccountKey.json'
});

const addJob = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        // Default implementation
        form.parse(req, async (error, fields, files) => {
            // Create validation of the fields and files
            if (!fields.title || !fields.companyName || !fields.location || !fields.email || !fields.jobType || !fields.requiredSkills || !fields.jobDescription || !files.companyProfileImage) {
                return res.status(400).json({
                    message: 'Please Fill All Required Input Fields',
                    status: 400
                });
            }

            const id = uuidv4();

            const bucketName = 'buzz-wise-team';

            const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

            // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

            // The variable should be match with the name of the key field
            const companyProfileImage = files.companyProfileImage;

            // URL of the uploaded image
            let imageURL;

            const jobID = JobsCollection.doc().id;

            if (error) {
                return res.status(400).json({
                    message: 'There Was an Error Parsing The Files',
                    status: 400,
                    error: error.message
                });
            }

            const bucket = CloudStorage.bucket(`gs://${bucketName}.appspot.com`);

            if (companyProfileImage.size === 0) {
                res.status(404).send({
                    message: 'No Image Found',
                    status: 404
                });
            } else {
                const imageResponse = await bucket.upload(companyProfileImage.path, {
                    destination: `jobs/${jobID}/${companyProfileImage.name}`,
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
                id: jobID,
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
            await JobsCollection.doc(jobID).set(jobData, { merge: true }).then(() => {
                res.status(201).send({
                    message: 'Successfully Added Job',
                    status: 201,
                    data: jobData
                });
            });
        });
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Added Job',
            status: 400,
            error: error.message
        });
    }
};

const getAllJobs = async (req, res) => {
    try {
        JobModel.getAllJobs(req, res, JobsCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Display All Jobs Listing',
            status: 400,
            error: error.message
        });
    }
};

const getJobDetail = async (req, res) => {
    try {
        JobModel.getJobDetail(req, res, JobsCollection);
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Display Job Detail',
            status: 400,
            error: error.message
        });
    }
};

// Update job profile by id (Only for Testing)
const updateJob = async (req, res) => {
    try {
        const jobID = req.params.id;
        const job = await JobsCollection.doc(jobID).get();

        const form = new formidable.IncomingForm({ multiples: true });

        if (!job.exists) {
            res.status(404).send({
                message: 'Job is Not Found',
                status: 404
            });
        } else {
            // Default implementation
            form.parse(req, async (error, fields, files) => {
                // Create validation of the fields and files
                if (!fields.title || !fields.companyName || !fields.location || !fields.email || !fields.jobType || !fields.requiredSkills || !fields.jobDescription || !files.companyProfileImage) {
                    return res.status(400).json({
                        message: 'Please Fill All Required Input Fields',
                        status: 400
                    });
                }

                const bucketName = 'buzz-wise-team';

                const storagePublicURL = `https://storage.googleapis.com/${bucketName}.appspot.com/`;

                // const storagePublicURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}.appspot.com/o/`;

                const companyProfileImage = files.companyProfileImage;

                // URL of the uploaded image
                let imageURL;

                if (error) {
                    return res.status(400).json({
                        message: 'There Was an Error Parsing The Files',
                        status: 400,
                        error: error.message
                    });
                }

                const bucket = CloudStorage.bucket(`gs://${bucketName}.appspot.com`);

                if (companyProfileImage.size === 0) {
                    res.status(404).send({
                        message: 'No Image Found',
                        status: 404
                    });
                } else {
                    const imageResponse = await bucket.upload(companyProfileImage.path, {
                        destination: `jobs/${jobID}/${companyProfileImage.name}`,
                        resumable: true,
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: jobID
                            }
                        }
                    });

                    // Profile image url
                    // imageURL = `${storagePublicURL + encodeURIComponent(imageResponse[0].name)}?alt=media&token=${uuid}`;

                    imageURL = storagePublicURL + imageResponse[0].name;
                }

                const date = new Date();

                const getDateAndTime = date.toLocaleDateString() + '|' + date.toLocaleTimeString();

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
                    updatedAt: getDateAndTime
                };

                // Update to the firestore collection
                await JobsCollection.doc(jobID).update(jobData, { merge: true }).then(() => {
                    res.status(202).send({
                        message: 'Update Job Successfully',
                        status: 202,
                        data: jobData
                    });
                });
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something went wrong to Update Job',
            status: 400,
            error: error.message
        });
    }
};

const deleteJobProfileStorage = async (uid) => {
    try {
        const bucket = CloudStorage.bucket('buzz-wise-team.appspot.com');

        // Delete the folder itself
        bucket.deleteFiles({
            prefix: `jobs/${uid}`
        });

        /*
        // Delete files in the folder
        bucket.deleteFiles({
          prefix: filePath
        });
        */

        // console.log('Folder deleted successfully.');
    } catch (error) {
        throw new Error('Error Deleting Folder: ', error);
    }
};

// Delete job profile by id (Only for Testing)
const deleteJob = async (req, res) => {
    try {
        const jobID = req.params.id;
        const job = await JobsCollection.doc(jobID).get();

        if (!job.exists) {
            res.status(404).send({
                message: 'Job is Not Found',
                status: 404
            });
        } else {
            await JobsCollection.doc(req.params.id).delete();

            deleteJobProfileStorage(jobID);

            res.status(202).send({
                message: 'Delete Job Successfully',
                status: 202
            });
        }
    } catch (error) {
        res.status(400).send({
            message: 'Something Went Wrong to Delete Job',
            status: 400,
            error: error.message
        });
    }
};

module.exports = { addJob, getAllJobs, getJobDetail, updateJob, deleteJob };