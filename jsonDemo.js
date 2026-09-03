import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "data.json");

fs.readFile(file, "utf-8", (err, data) => {


    let students = JSON.parse(data);

    console.log("Students List:");
    console.log(students);

    let student = {
        id: 3,
        name: "Amit Sharma",
        course: "BCA",
        semester: 5
    };

    students.push(student);

    fs.writeFile(file, JSON.stringify(students, null, 4), (err) => {

        console.log("\nData added successfully.\n");

        fs.readFile(file, "utf-8", (newData) => {

            console.log("Updated Students:");
            console.log(JSON.parse(newData));

        });

    });

});