import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { poolRoutes } from "./routes/pools";
import { userRoutes } from "./routes/users";
import { guessRoutes } from "./routes/guesses";
import { gameRoutes } from "./routes/games";
import { authRoutes } from "./routes/auth";

async function bootstrap() {
    const fastify = Fastify({
        logger: true
    });

    await fastify.register(cors, {
        origin: true
    })

    // TODO: in production are needs in .env
    await fastify.register(jwt, {
        secret: 'nlwcopa'
    })

    await fastify.register(authRoutes)
    await fastify.register(userRoutes)
    await fastify.register(poolRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(gameRoutes)
    
    await fastify.listen({ port: 9000, host: '0.0.0.0' })
}

bootstrap();