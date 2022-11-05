import Fastify from "fastify"
import cors from "@fastify/cors";
import z from "zod";
import ShortUniqueId from "short-unique-id";
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
    log: ['query']
})

async function bootstrap() {
    const fastify = Fastify({
        logger: true
    });

    await fastify.register(cors, {
        origin: true
    })

    // Pools
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

    // Users
    fastify.get('/users/count', async (request, reply) => {
        const count = await prisma.users.count();
        return reply.status(200).send({ count })
    })

    // Guesses
    fastify.get('/guesses/count', async (request, reply) => {
        const count = await prisma.guesses.count();
        return reply.status(200).send({ count })
    })

    await fastify.listen({ port: 9000, host: '0.0.0.0' })
}

bootstrap();