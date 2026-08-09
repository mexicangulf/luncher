import { json, type RequestHandler} from "@sveltejs/kit";
import { db } from "$lib/db";
import { games } from "$lib/schema";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
    
    try {
        const payload = await request.json();

        const {
            name,
            url,
            version,
            hosts,
            description
        } = payload;

        if (!name || !url || !version || !hosts) {
            return json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const [game] = await db
            .insert(games)
            .values({
                name,
                url,
                version,
                description: description || null,

                // schema expects text, so convert array -> string
                hosts: Array.isArray(hosts)
                    ? hosts.join(",")
                    : hosts,

                lastPush: new Date()
            })
            .returning();

        return json({
            success: true,
            game
        });

    } catch (err) {
        console.error("Failed to create game:", err);

        return json(
            {
                error: "Internal server error"
            },
            {
                status: 500
            }
        );
    }

}