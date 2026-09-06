import express from "express";

import { saveContactDetails } from "../controller/contact.js";

import {
    registerUser,
    loginUser,
    logoutUser
} from "../controller/auth.js";

import {
    getAllUsers
} from "../controller/users.js";

import authMiddleware from "../middleware/auth.js";


const router = express.Router();


// =====================================================
// LOGIN PAGE
// =====================================================

router.get("/login", (req, res) => {

    res.render("login", {

        page_title: "Login"

    });

});


// =====================================================
// REGISTER PAGE
// =====================================================

router.get("/register", (req, res) => {

    res.render("register", {

        page_title: "Register"

    });

});


// =====================================================
// REGISTER POST
// =====================================================

router.post(
    "/register",
    registerUser
);


// =====================================================
// LOGIN POST
// =====================================================

router.post(
    "/login",
    loginUser
);


// =====================================================
// LOGOUT
// =====================================================

router.get(
    "/logout",
    logoutUser
);


// =====================================================
// USERS / REGISTERED EXPLORERS
// =====================================================

router.get(
    "/users",
    authMiddleware,
    getAllUsers
);


// =====================================================
// HOME
// =====================================================

router.get(
    "/",
    authMiddleware,
    (req, res) => {

        let studentInfo = [

            {
                id: 1,
                name: "Namm jani na",
                rollNo: "jani na",
                course: "jani na",
                year: 3,
                marks: 85,
                grade: "hobe kichu",
                email: "blabla@example.com"
            },

            {
                id: 2,
                name: "arjyaaaaaaa",
                rollNo: "STU002",
                course: "Electronics",
                year: 2,
                marks: 10,
                grade: "A+",
                email: "emma@example.com"
            },

            {
                id: 3,
                name: "chasmis taklu",
                rollNo: "STU003",
                course: "Mechanical Engineering",
                year: 4,
                marks: 80,
                grade: "B+",
                email: "michael@example.com"
            },

            {
                id: 4,
                name: "Souma Taylor",
                rollNo: "STU004",
                course: "Information Technology",
                year: 1,
                marks: 40,
                grade: "A",
                email: "sophia@example.com"
            },

            {
                id: 5,
                name: "Riya Smith",
                rollNo: "STU005",
                course: "Civil Engineering",
                year: 4,
                marks: 90,
                grade: "B",
                email: "david@example.com"
            }

        ];


        res.render("home", {

            page_title: "Home Page",

            student_data: studentInfo,

            user: req.user

        });

    }
);


// =====================================================
// ABOUT
// =====================================================

router.get(
    "/about",
    authMiddleware,
    (req, res) => {

        res.render("about", {

            page_title: "About Us Page",

            user: req.user

        });

    }
);


// =====================================================
// GALLERY
// =====================================================

// router.get(
//     "/gallery",
//     authMiddleware,
//     (req, res) => {
//
//         res.render("gallery", {
//
//             page_title: "Gallery Page",
//
//             user: req.user
//
//         });
//
//     }
// );


// =====================================================
// CONTACT GET
// =====================================================

router.get(
    "/contact",
    authMiddleware,
    (req, res) => {

        const success =
            req.query.success === "true";


        res.render("contact", {

            page_title: "Contact Us Page",

            success: success,

            user: req.user

        });

    }
);


// =====================================================
// CONTACT POST
// =====================================================

router.post(
    "/contact",
    authMiddleware,
    saveContactDetails
);


// =====================================================
// DEDICATED ISLAND VIEWS (6 LEAF NODES)
// =====================================================

import { renderIslandPage } from "../controller/islands.js";

// Parametric routes
router.get("/island/:islandId", authMiddleware, renderIslandPage());
router.get("/islands/:islandId", authMiddleware, renderIslandPage());

// Named convenience routes for the 6 islands
router.get("/island/astrolabe", authMiddleware, renderIslandPage("astrolabe"));
router.get("/island/chronos", authMiddleware, renderIslandPage("chronos"));
router.get("/island/kraken_vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/island/kraken-vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/island/cutlass_cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/island/cutlass-cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/island/velvet_isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/island/velvet-isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/island/booty_cay", authMiddleware, renderIslandPage("booty_cay"));
router.get("/island/booty-cay", authMiddleware, renderIslandPage("booty_cay"));

// Direct shorthand routes
router.get("/astrolabe", authMiddleware, renderIslandPage("astrolabe"));
router.get("/chronos", authMiddleware, renderIslandPage("chronos"));
router.get("/kraken-vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/cutlass-cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/velvet-isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/booty-cay", authMiddleware, renderIslandPage("booty_cay"));


// =====================================================

export default router;