import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { games } from '$lib/schema';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
  
  const gameId = params.id || "game_not_found";

  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);

  if (!game) {
    throw error(404, 'Game not found');
  }

  return json(game);
  
};

// authenticated route
// export const PUT: RequestHandler = async ({ params, request }) => {

//   const gameId = params.id || "game_not_found";
//   const body = await request.json();

//   if (typeof body !== 'object' || body === null) {
//     throw error(400, 'Request body must be a JSON object');
//   }

//   const allowedFields = ['name', 'description', 'genre', 'platform', 'release_date', 'rating'];
//   const updateData = Object.fromEntries(
//     Object.entries(body).filter(([key]) => allowedFields.includes(key))
//   ) as Record<string, unknown>;

//   if (!Object.keys(updateData).length) {
//     throw error(400, 'No valid fields provided for update');
//   }

//   const [updatedGame] = await db
//     .update(games)
//     .set(updateData)
//     .where(eq(games.id, gameId))
//     .returning();

//   if (!updatedGame) {
//     throw error(404, 'Game not found');
//   }

//   return json(updatedGame);
  
// };

export const DELETE: RequestHandler = async ({ params }) => {

  const gameId = params.id || "game_not_found";
  const [deletedGame] = await db.delete(games).where(eq(games.id, gameId)).returning();

  if (!deletedGame) {
    throw error(404, 'Game not found');
  }

  return json({ success: true });

};