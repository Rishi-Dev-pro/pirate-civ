import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    name: {

        type: String,

        required: true,

        trim: true

    },


    email: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true

    },


    password: {

        type: String,

        required: true

    },


    role: {

        type: String,

        enum: ["buyer", "seller", "admin"],

        default: "buyer"

    },


    sellerStatus: {

        type: String,

        enum: ["pending", "approved", "rejected", null],

        default: null

    },


    rejectionReason: {

        type: String,

        trim: true,

        default: null

    },


    storeName: {

        type: String,

        trim: true,

        default: null

    },


    homeIsland: {

        type: String,

        trim: true,

        default: null

    },


    bio: {

        type: String,

        trim: true,

        default: ""

    },


    avatar: {

        type: String,

        default: "/images/avatars/default-pirate.png"

    },


    googleId: {

        type: String,

        sparse: true,

        unique: true

    },


    authSecretHash: {

        type: String,

        required: true

    },


    favorites: [{

        type: mongoose.Schema.Types.ObjectId,

        ref: "Product"

    }]

}, {

    timestamps: true

});


const User = mongoose.model("User", userSchema);


export default User;