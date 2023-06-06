const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('../../serviceAccountKey.json');
const UUID = require('uuid-v4');
const formidable = require('formidable-serverless');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static('./views/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
    res.send('Test');

    res.render('index.html');
});

const jobsCollection = admin.firestore().collection("jobs");

const storage = new Storage({
    keyFilename: "serviceAccountKey.json",
});

app.post("/addJob", async (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });

    try {
        form.parse(req, async (err, fields, files) => {
            let uuid = UUID();
            var downloadPath = "https://firebasestorage.googleapis.com/v0/b/buzz-wise-team.appspot.com/o/";

            const companyProfileImage = files.companyProfileImage;

            // URL of the uploaded image
            let imageUrl;

            const documentID = jobsCollection.doc().id;

            if (err) {
                return res.status(400).json({
                    message: "There was an error parsing the files!",
                    data: {},
                    error: err,
                });
            }

            const bucket = storage.bucket("gs://buzz-wise-team.appspot.com");

            if (companyProfileImage.size == 0) {
                // Do nothing
                res.send("No company profile image");
            } else {
                const imageResponse = await bucket.upload(companyProfileImage.path, {
                    destination: `jobs/${companyProfileImage.name}`,
                    resumable: true,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: uuid,
                        },
                    },
                });

                // Profile image url
                imageUrl = downloadPath + encodeURIComponent(imageResponse[0].name) + "?alt=media&token=" + uuid;
            }

            // Object to send to the database
            const jobModel = {
                id: documentID,
                title: fields.title,
                companyName: fields.companyName,
                location: fields.location,
                email: fields.email,
                jobType: fields.jobType,
                requiredSkill: fields.requiredSkill,
                jobDescription: fields.jobDescription,
                companyProfileImage: companyProfileImage.size == 0 ? "" : imageUrl,
            };

            await jobsCollection.doc(documentID).set(jobModel, { merge: true }).then((value) => {
                res.status(200).send({
                    message: "Job created successfully",
                    data: jobModel,
                    error: false,
                });
            });
        });
    } catch (error) {
        res.status(400).send({
            message: "Something went wrong to create a job!",
            data: {},
            error: error,
        });
    }
});

app.get("/allJobs", async (req, res, next) => {
    try {
        await jobsCollection.get().then((value) => {
            const jobsData = value.docs.map((document) => document.data());

            res.status(200).send({
                message: "All Job Listings",
                data: jobsData,
                error: false
            });
        });
    } catch (error) {
        res.status(400).send({
            message: "Something went wrong to get all jobs!",
            data: {},
            error: error,
        });
    }
});

app.get("/job/:id", async (req, res, next) => {
    try {
        await jobsCollection.where("id", "==", req.params.id).get().then((value) => {
            const jobData = value.docs.map((document) => document.data());

            res.status(200).send({
                message: "Job Data",
                data: jobData,
                error: false
            });
        });
    } catch (error) {
        res.status(400).send({
            message: "Something went wrong to get a job!",
            data: {},
            error: error,
        });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});