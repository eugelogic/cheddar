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
        const lists = await prisma?.list.findMany({
            where: {
                storeId: store.id,
            },
        })
        res.json(lists)
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
