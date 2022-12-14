import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/pools/:id/games",
    { onRequest: [authenticate] },
    async (request) => {
      const gameRequest = z.object({
        id: z.string(),
      });

      const { id } = gameRequest.parse(request.params);

      const games = await prisma.games.findMany({
        orderBy: {
          date: "desc",
        },
        include: {
          guesses: {
            where: {
              participants: {
                user_id: request.user.sub,
                pool_id: id,
              },
            },
          },
        },
      });

      return {
        games: games.map((game) => {
          return {
            ...game,
            guess: game.guesses.length > 0 ? game.guesses[0] : null,
            guesses: undefined,
          };
        }),
      };
    }
  );

}
