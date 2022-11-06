import ShortUniqueId from "short-unique-id";
import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  fastify.get("/pools/count", async () => {
    const count = await prisma.pools.count();
    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const poolRequest = z.object({
      title: z.string(),
    });

    const { title } = poolRequest.parse(request.body);
    const randomCode = new ShortUniqueId({ length: 6 });
    const code = String(randomCode()).toUpperCase();
    
    try {
      await request.jwtVerify();
      await prisma.pools.create({
        data: {
          title,
          code,
          owner_id: request.user.sub,

          participant: {
            create: {
              user_id: request.user.sub,
            },
          },
        },
      });
    } catch {
      await prisma.pools.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });

  fastify.post("/pools/join",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const joinPoolRequest = z.object({
        code: z.string(),
      });

      const { code } = joinPoolRequest.parse(request.body);

      const pool = await prisma.pools.findUnique({
        where: {
          code,
        },
        include: {
          participant: {
            where: {
              user_id: request.user.sub,
            },
          },
        },
      });

      if (!pool) {
        return reply.status(400).send("Pool not found");
      }

      if (pool.participant.length > 0) {
        return reply.status(400).send({
          message: "You already joined this pool.",
        });
      }

      if (!pool.owner_id) {
        await prisma.pools.update({
          where: {
            id: pool.id,
          },
          data: {
            owner_id: request.user.sub,
          },
        });
      }

      await prisma.participants.create({
        data: {
          pool_id: pool.id,
          user_id: request.user.sub,
        },
      });

      return reply.status(201).send();
    }
  );

  fastify.get("/pools",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const pools = await prisma.pools.findMany({
        where: {
          participant: {
            some: {
              user_id: request.user.sub,
            },
          },
        },
        include: {
          _count: {
            select: {
              participant: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          participant: {
            select: {
              id: true,

              users: {
                select: {
                  avatar: true,
                },
              },
            },
            take: 4,
          },
        },
      });

      return { pools };
    }
  );

  fastify.get("/pools/:id",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const joinPoolRequest = z.object({
        id: z.string(),
      });

      const { id } = joinPoolRequest.parse(request.params);
      const pool = await prisma.pools.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              participant: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          participant: {
            select: {
              id: true,

              users: {
                select: {
                  avatar: true,
                },
              },
            },
            take: 4,
          },
        },
      });

      return { pool };
    }
  );
}
