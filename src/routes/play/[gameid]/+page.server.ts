import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({params}) => {

    // cheat
    if(params.gameid !== "hokm") {
        redirect(301, `/download/hokm/${params.gameid}`)
    }

    return {}

};

