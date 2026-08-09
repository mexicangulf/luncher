import dotenv from "dotenv";

dotenv.config();

export const services = {
    matchmaking: process.env.MATCHMAKING_SERVICE || "ws://localhost:3001",
    s3: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    
}