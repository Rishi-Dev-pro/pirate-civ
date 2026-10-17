import User from "../models/user.js";

/**
 * Controller action: Get all chartered merchants for Buyer Explorer Discovery (Phase 6.3)
 * Scoped strictly to User.role === 'seller'. Never displays private emails or raw products.
 */
const getAllUsers = async (req, res) => {

    try {

        const sellers = await User
            .find({ role: "seller" })
            .select("name storeName homeIsland bio avatar createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.render("users", {

            page_title: "Chartered Merchants & Explorers | Pirate-Civ",

            users: sellers,

            user: req.user

        });

    } catch (error) {

        console.error("Users Page Error:", error.message);

        res.status(500).send(
            "Something went wrong while loading the explorers."
        );

    }

};

export {
    getAllUsers
};