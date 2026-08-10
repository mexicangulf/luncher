import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({params}) => {

    // cheat
    if(params.key !== "hokm") {
        redirect(301, `/download/hokm/${params.key}`)
    }

    return {}

};