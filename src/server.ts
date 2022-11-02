import Fastify from "fastify"

async function bootstrap() {
    const fastify = Fastify({
        logger: true
    });

    fastify.get('/pools/count', () => {
        return { count: 784}
    })

    await fastify.listen({ port: 9000 })
}

bootstrap();