import type { PageServerLoad } from "./me/$types";

export const load: PageServerLoad = async ({ locals }) => {

    return {
        user: locals.user
    };
    
}