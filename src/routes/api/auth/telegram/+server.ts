// this route is used to validate Telegram.WebApp.initData and issue a JWT token instead
// the token will be stored in secure storage 

import { json, type RequestHandler } from '@sveltejs/kit';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {db} from "$lib/db";
import {users} from "$lib/schema"
import {eq} from "drizzle-orm";

dotenv.config();

const botToken = process.env.BOT_TOKEN ?? "";
const secretKey = crypto
		.createHmac('sha256', 'WebAppData')
		.update(botToken)
		.digest();
		

import {PrivateKey} from "$lib/auth";

function decodeTelegramInitData(initData: string) {

	const params = new URLSearchParams(initData);

	const data: Record<string, any> = {};

	for (const [key, value] of params.entries()) {
		data[key] = value;
	}

	if (data.user) {
		try {
			data.user = JSON.parse(data.user);
		} catch {
		}
	}

	if (data.chat) {
		try {
			data.chat = JSON.parse(data.chat);
		} catch {
			// leave as string if parsing fails
		}
	}

	if (data.receiver) {
		try {
			data.receiver = JSON.parse(data.receiver);
		} catch {
			// leave as string if parsing fails
		}
	}

	if (data.auth_date) {
		data.auth_date = Number(data.auth_date);
	}

	return data;
}

import crypto from 'node:crypto';

// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function validateTelegramInitData(
	initData: string,
	secretKey: Buffer
) {
	const params = new URLSearchParams(initData);

	const hash = params.get('hash');

	if (!hash) {
		return false;
	}

	params.delete('hash');

	// sort alphabetically and create check string
	const dataCheckString = Array.from(params.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	const calculatedHash = crypto
		.createHmac('sha256', secretKey)
		.update(dataCheckString)
		.digest('hex');

	return calculatedHash === hash;
	
}

export const POST: RequestHandler = async ({ request, cookies }) => {

	let initData = "";
	// console.log("request:", request);

	try {
    	const body = await request.json();
		// console.log(body);
		if(!body.initData) {
			throw new Error();
		}
		initData = body.initData;
	} catch {

		console.log(process.env.NODE_ENV);

		if(process.env.NODE_ENV === "development") {
				// generate a random username for development

				const randomUsername = `dev_user_${crypto.randomBytes(6).toString('hex')}`;
				const randomId = crypto.randomBytes(4).readUInt32BE(0);
				const randomTelegramId = randomId.toString() + "telegram";

				const token = jwt.sign({
					id: randomId,
					username: randomUsername,
					telegram_id: randomTelegramId,
				}, PrivateKey, {algorithm: "RS256"});
			
			cookies.set("access_token", token,  {
				path: "/",
				httpOnly: false, // for development
				sameSite: "lax", // for development
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

			return json({
				"access_token": token,
				"token_type": "bearer",
				"expires_in": 60 * 60 * 24 * 30,
			});

		}

		return json({error: "failed to parse json"}, {status: 401});
	}

	// console.log("initData:", initData);

	if(!botToken)
		return json({error: "Telegram auth is unavailable for now"}, {status: 401});

	if(!initData)
		return json({error: "initData is empty"}, {status: 401});

	if(!validateTelegramInitData(initData, secretKey)) {
		return json({error: "invalid telegram data malicious activity is going on"}, {status: 401});
	};

	const data = decodeTelegramInitData(initData);

	// console.log(data);

	const telegramUser = data.user;

	const result = await db
	.select()
	.from(users)
	.where(eq(users.telegram_id, telegramUser.id));

	let user;

	if(result.length === 0) {
		try {
			user = await db.insert(users).values({
			telegram_id: telegramUser.id,
			username: telegramUser.username ?? null,
			first_name: telegramUser.first_name,
			last_name: telegramUser.last_name ?? null,
			photo_url: telegramUser.photo_url ?? null,
			}).returning();
		} catch (error) {
			return json({error: "failed to create user"}, {status: 500});
		}
	}

    const token = jwt.sign(data.user, PrivateKey, {algorithm: "RS256"});
	
	cookies.set("access_token", token,  {
		path: "/",
		httpOnly: false, // for development
		sameSite: "lax", // for development
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});

	return json({
		"access_token": token,
		"token_type": "bearer",
		"expires_in": 60 * 60 * 24 * 30,
	});

};
