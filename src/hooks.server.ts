import type {Handle} from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import {PublicKey} from "$lib/auth";

declare module '@sveltejs/kit' {
	interface Locals {
		user: any;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	
    const token = event.cookies.get('access_token');
	event.locals.user = null;

	if (token) {
		try {
			event.locals.user = jwt.verify(token, PublicKey, {
				algorithms: ['RS256']
			}) as any;
		} catch {
			event.locals.user = null;
		}
	}

	const response = await resolve(event);

	response.headers.set(
		'Content-Security-Policy',
		"frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"
	);
	
	response.headers.delete('X-Frame-Options');

	return response;

};