import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

let PrivateKey = "";
let PublicKey = "";

async function loadKeys() {

        try {
            PrivateKey = fs.readFileSync("private.pem", "utf-8");
            PublicKey = fs.readFileSync("public.pem", "utf-8");
        } catch(error) {
            PrivateKey = process.env.PRIVATE_KEY!;
            PublicKey = process.env.PUBLIC_KEY!;
            
        };
    }

loadKeys();

export { PrivateKey, PublicKey};