import * as yup from 'yup'
import prisma from '@lib/prisma'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequest, NextApiResponse } from 'next'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
        // hardcoded user id, to be replaced with value from authentication
        const currentUser = { id: 15 }

        if (req.method === 'GET') {
            const stores = await prisma?.store.findMany()
            res.json(stores)
        } else if (req.method === 'POST') {
            const { name, location } = req.body

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .test('unique-name', 'Store name already exists.', async (value) => {
                        const match = await prisma?.store.findFirst({
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

            const store = await prisma?.store.create({
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
