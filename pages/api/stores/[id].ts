import * as yup from 'yup'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof prisma === 'undefined') {
        res.status(500).json({ error: 'Internal server error.' })
        return
    }
    const store = await prisma.store.findUnique({
        where: {
            id: Number(req.query.id),
        },
    })
    if (store === null || typeof store === 'undefined') {
        res.status(404).json({ error: `Store with id: ${req.query.id} does not exist.` })
        return
    }
    if (req.method === 'GET') {
        res.json(store)
    } else if (req.method === 'PATCH') {
        const { name, location } = req.body

        const schema = yup.object().shape({
            name: yup.string().min(1, 'Name cannot be empty'),
            location: yup.string().nullable(),
        })

        const data = await schema.validate({ name, location })

        const storeUpdated = await prisma.store.update({
            where: {
                id: store.id,
            },
            data,
        })
        res.status(200).json(storeUpdated)
    } else if (req.method === 'DELETE') {
        await prisma.store.delete({
            where: {
                id: store.id,
            },
        })
        res.status(204).end()
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
