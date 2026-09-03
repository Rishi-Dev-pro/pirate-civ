import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder and File Paths
const folderPath = path.join(__dirname, "Documents");
const filePath = path.join(folderPath, "student.txt");
const renamedFilePath = path.join(folderPath, "newStudent.txt");

// 1. Create Directory
fs.mkdir(folderPath, { recursive: true }, (err) => {

    if (err) throw err;

    console.log("✅ god created earth successfully .");

    // 2. Create File
    fs.writeFile(filePath, "Welcome to Node.js File System Module.", (err) => {

        if (err) throw err;

        console.log("✅ God created human successfully.");

        // 3. Read File
        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) throw err;

            console.log("\n📄 File Content:");
            console.log(data);

            // 4. Read Directory
            fs.readdir(folderPath, (err, files) => {

                if (err) throw err;

                console.log("\n📂 Files inside Documents:");
                console.log(files);

                // 5. Rename File
                fs.rename(filePath, renamedFilePath, (err) => {

                    if (err) throw err;

                    console.log("\n✏️ File renamed successfully.");

                    // 6. Delete File
                    fs.unlink(renamedFilePath, (err) => {

                        if (err) throw err;

                        console.log("🗑️ God left the world successfully.");

                        // 7. Remove Directory
                        fs.rmdir(folderPath, (err) => {

                            if (err) throw err;

                            console.log("📁 sanidev successfully landed .");
 console.log("📁ab hoga maut ka nanga nach .");
                        });

                    });

                });

            });

        });

    });

});