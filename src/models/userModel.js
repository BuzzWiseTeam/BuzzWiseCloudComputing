const getAllUsersAccountProfile = async (req, res, collection) => {
    const response = [];

    const snapshot = await collection.count().get();

    await collection.get().then((data) => {
        const { docs } = data;

        docs.map((doc) => {
            const selectedData = {
                id: doc.data().id,
                name: doc.data().name,
                email: doc.data().email,
                headline: doc.data().headline,
                location: doc.data().location,
                status: doc.data().status,
                skills: doc.data().skills,
                userProfileImage: doc.data().userProfileImage,
                about: doc.data().about,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt
            };

            response.push(selectedData);
        });

        // Check if the response is empty or not
        if (response.length === 0) {
            return res.status(404).send({
                message: 'No Users Profile Found',
                status: 404
            });
        } else {
            return res.status(200).send({
                message: 'Display All Users Profile',
                status: 200,
                total: snapshot.data().count,
                data: response
            });
        }
    });
};

// Get the current user's account profile by login with email and password
const getUserAccountProfile = async (req, res, firebase, collection) => {
    const user = firebase.auth().currentUser;

    // console.log(req.user.uid);

    if (user && req.user.uid) {
        await collection.doc(user.uid).get()
            .then((result) => {
                if (!result.exists) {
                    res.status(404).send({
                        message: 'User Profile is Empty',
                        status: 404
                    });
                } else {
                    res.status(200).send({
                        message: 'Display User Profile',
                        status: 200,
                        data: result.data()
                    });
                }
            });
    } else {
        res.status(403).send({
            message: 'User is Not Sign In',
            status: 403
        });
    }
};

// Get the user's account profile by id (Only for Testing)
const getUserAccountProfileByID = async (req, res, collection) => {
    const userID = req.params.id;
    const user = await collection.doc(userID);
    const profile = await user.get();

    if (!profile.exists) {
        res.status(404).send({
            message: 'User is Not Found',
            status: 404
        });
    } else {
        res.status(200).send({
            message: 'Display User Profile',
            status: 200,
            data: profile.data()
        });
    }
};

module.exports = { getAllUsersAccountProfile, getUserAccountProfile, getUserAccountProfileByID };