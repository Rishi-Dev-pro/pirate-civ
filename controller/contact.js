import Contact from "../models/contact.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const saveContactDetails = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object") {
            const errorMsg = "Invalid request format.";
            if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
                return res.status(400).json({ success: false, error: errorMsg });
            }
            return res.status(400).render("contact", {
                page_title: "Contact Us Page",
                success: false,
                error: errorMsg,
                formData: {},
                user: req.user || null
            });
        }

        const { name, email, subject, message } = req.body;

        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedEmail = typeof email === "string" ? email.trim() : "";
        const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
        const trimmedMessage = typeof message === "string" ? message.trim() : "";

        const formData = {
            name: typeof name === "string" ? name : "",
            email: typeof email === "string" ? email : "",
            subject: typeof subject === "string" ? subject : "",
            message: typeof message === "string" ? message : ""
        };

        const renderFormError = (errorMessage) => {
            if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
                return res.status(400).json({
                    success: false,
                    error: errorMessage,
                    formData
                });
            }
            return res.status(400).render("contact", {
                page_title: "Contact Us Page",
                success: false,
                error: errorMessage,
                formData,
                user: req.user || null
            });
        };

        if (!trimmedName) {
            return renderFormError("Name is required.");
        }

        if (!trimmedEmail) {
            return renderFormError("Email is required.");
        }

        if (!emailRegex.test(trimmedEmail)) {
            return renderFormError("Please enter a valid email address.");
        }

        if (!trimmedMessage) {
            return renderFormError("Message is required.");
        }

        const contactData = new Contact({
            name: trimmedName,
            email: trimmedEmail.toLowerCase(),
            subject: trimmedSubject,
            message: trimmedMessage
        });

        await contactData.save();

        console.log("Contact details saved successfully");

        if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
            return res.status(201).json({
                success: true,
                message: "Message sent successfully."
            });
        }

        return res.redirect("/contact?success=true");

    } catch (error) {
        console.error("Error saving contact details:", error.message);
        if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
            return res.status(500).json({
                success: false,
                error: "Something went wrong while dispatching your message."
            });
        }
        return res.status(500).render("contact", {
            page_title: "Contact Us Page",
            success: false,
            error: "Something went wrong while dispatching your message. Please try again.",
            formData: typeof req.body === "object" && req.body ? req.body : {},
            user: req.user || null
        });
    }
};

export { saveContactDetails };
export default { saveContactDetails };