import * as yup from 'yup'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const stores = await prisma?.store.findMany()
        res.json(stores)
    } else if (req.method === 'POST') {
        const { name, location, userId } = req.body
        const schema = yup.object().shape({
            name: yup
                .string()
                .test('unique-name', 'Store name already exists.', async (value) => {
                    const stores = await prisma?.store.findMany()
                    const match = stores?.find((store) => store.name === value)
                    return match === undefined
                })
                .required(),
            location: yup.string().nullable(),
            userId: yup.number().required(),
        })
        const data = await schema.validate({ name, location, userId })

        const store = await prisma?.store.create({
            data: {
                name: data.name,
                location: data.location,
                userId: data.userId,
            },
        })
        const response = {
            store,
            message: `New store successfully added.`,
        }
        res.status(201).json(response)
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
