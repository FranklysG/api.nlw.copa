import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guesses.count();
    return { count };
  });

  fastify.post(
    "/pools/:pool_id/games/:game_id/guesses",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const gameParamsRequest = z.object({
        pool_id: z.string(),
        game_id: z.string(),
      });

      const gameBodyRequest = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { pool_id, game_id } = gameParamsRequest.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = gameBodyRequest.parse(
        request.body
      );

      const participant = await prisma.participants.findUnique({
        where: {
          user_id_pool_id: {
            pool_id,
            user_id: request.user.sub,
          },
        },
      });

      if (!participant) {
        return reply.status(400).send({
          message: "You're not allowed to create a guess inside this pool.",
        });
      }

      const guess = await prisma.guesses.findUnique({
        where: {
          participant_id_game_id: {
            participant_id: participant.id,
            game_id,
          },
        },
      });

      if (guess) {
        return reply.status(400).send({
          message: "You already sent a guess to this game on this pool.",
        });
      }

      const game = await prisma.games.findUnique({
        where: {
          id: game_id,
        },
      });

      if (!game) {
        return reply.status(400).send({
          message: "game not found",
        });
      }

      if (game.date < new Date()) {
        return reply.status(400).send({
          message: "You cannot send guesses after the game",
        });
      }

      await prisma.guesses.create({
        data: {
          game_id,
          participant_id: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return reply.status(201).send();
    }
  );
}
