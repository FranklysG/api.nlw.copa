import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.users.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            avatar: 'https://github.com/franklysg.png'
        }
    });

    const pool = await prisma.pools.create({
        data: {
            title: 'Pool first',
            code: '4XFT2R',
            owner_id: user.id,

            participant: {
                create: {
                   user_id: user.id 
                }
            }
        }
    })

    await prisma.games.create({
        data: {
            date: '2022-12-02T12:00:00.201Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'DE'
        }
    })

    await prisma.games.create({
        data: {
            date: '2022-12-03T12:00:00.201Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 1,
                    secondTeamPoints: 2,
                    participants: {
                        connect: {
                            user_id_pool_id: {
                                user_id: user.id,
                                pool_id: pool.id
                            }
                        }
                    }
                }
            }
        }
    })
}

main()