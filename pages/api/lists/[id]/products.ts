import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof prisma === 'undefined') {
        res.status(500).json({ error: 'Internal server error.' })
        return
    }
    const list = await prisma.list.findUnique({
        where: {
            id: Number(req.query.id),
        },
    })
    if (list === null || typeof list === 'undefined') {
        res.status(404).json({ error: `List with id: ${req.query.id} does not exist.` })
        return
    }
    if (req.method === 'GET') {
        const products = await prisma?.product.findMany({
            where: {
                listId: list.id,
            },
        })
        res.json(products)
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
