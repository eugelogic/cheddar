import * as yup from 'yup'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof prisma === 'undefined') {
        res.status(500).send('Internal server error.')
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
            name: yup.string().required(),
            location: yup.string().nullable(),
        })

        const data = await schema.validate({ name, location })

        const storeUpdated = await prisma.store.update({
            where: {
                id: store.id,
            },
            data,
        })

        const response = {
            storeUpdated,
            message: `Store with id: ${store.id} updated.`,
        }
        res.json(response)
    } else if (req.method === 'DELETE') {
        await prisma.store.delete({
            where: {
                id: store.id,
            },
        })
        res.json({ message: `Store with id: ${store.id} deleted` })
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
