import User from "../models/user.js";


const getAllUsers = async (req, res) => {

    try {

        const users = await User
            .find({})
            .select("-password -authSecretHash")
            .sort({ createdAt: -1 });


        res.render("users", {

            page_title: "Registered Explorers",

            users: users,

            user: req.user

        });


    } catch (error) {

        console.log("Users Page Error:");
        console.log(error.message);

        res.status(500).send(
            "Something went wrong while loading the explorers."
        );

    }

};


export {
    getAllUsers
};