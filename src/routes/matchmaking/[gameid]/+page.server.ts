import type {PageServerLoad} from "./$types";
import { services } from "$lib/config";

export const load: PageServerLoad = async ({locals, params, cookies}) => {
        
    const token = cookies.get("access_token");
    
    return {
        user: locals.user,
        gameid: params.gameid,
        service: services.matchmaking,
        token,
    };

}