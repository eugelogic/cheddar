import * as yup from 'yup'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        const currentUser = req.user!

        if (req.method === 'GET') {
            const stores = await prisma.store.findMany({
                where: {
                    userId: currentUser.id,
                },
            })
            res.json(stores)
        } else if (req.method === 'POST') {
            const { name, location } = req.body

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .test('unique-name', 'Store name already exists.', async (value) => {
                        const match = await prisma.store.findFirst({
                            where: {
                                name: value,
                                userId: currentUser.id,
                            },
                        })
                        return match === null
                    })
                    .required(),
                location: yup.string().nullable(),
            })
            const data = await schema.validate({ name, location })

            const store = await prisma.store.create({
                data: {
                    name: data.name,
                    location: data.location,
                    userId: currentUser.id,
                },
            })
            res.status(201).json(store)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
