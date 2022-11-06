import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export async function gameRoutes(fastify: FastifyInstance){
    fastify.get('/games/count', async () => {
        const count = await prisma.games.count();
        return { count }
    })
}