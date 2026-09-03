import Contact from "../models/contact.js";


const saveContactDetails = async (req, res) => {

    try {

        const { name, email, subject, message } = req.body;


        const contactData = new Contact({

            name: name,
            email: email,
            subject: subject,
            message: message

        });


        await contactData.save();


        console.log("Contact details saved successfully");


        res.redirect("/contact?success=true");


    } catch (error) {

        console.log("Error saving contact details");

        console.log(error.message);

        res.status(500).send("Something went wrong");

    }

};


export { saveContactDetails };