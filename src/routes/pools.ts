import ShortUniqueId from "short-unique-id";
import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export async function poolRoutes(fastify: FastifyInstance){
    fastify.get('/pools/count', async () => {
        const count = await prisma.pools.count();
        return { count }
    })

    fastify.post('/pools', async (request, reply) => {
        const poolRequest = z.object({
            title: z.string(),
        });
        
        const { title } = poolRequest.parse(request.body);
        const randomCode = new ShortUniqueId({length: 6});
        const code = String(randomCode()).toUpperCase();
        
        await prisma.pools.create({
            data: {
                title,
                code
            }
        })
        
        return reply.status(201).send({ code })
    })
}