// +page.server.ts
import type {PageServerLoad} from "./$types"; 

export const load: PageServerLoad = async ({locals, fetch}) => {
	return {
		user: locals.user
	};
}