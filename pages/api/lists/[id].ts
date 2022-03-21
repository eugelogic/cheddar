import * as yup from 'yup'
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
        res.json(list)
    } else if (req.method === 'PATCH') {
        const { name, description, storeId } = req.body

        const schema = yup.object().shape({
            name: yup
                .string()
                .min(1, 'Name cannot be empty')
                .test('unique-name', 'List name already exists.', async (value) => {
                    const match = await prisma?.list.findFirst({
                        where: {
                            name: value,
                            storeId: storeId,
                        },
                    })
                    return match === null
                }),
            description: yup.string().nullable(),
        })

        const data = await schema.validate({ name, description })

        const listUpdated = await prisma.list.update({
            where: {
                id: list.id,
            },
            data,
        })
        res.status(200).json(listUpdated)
    } else if (req.method === 'DELETE') {
        await prisma.list.delete({
            where: {
                id: list.id,
            },
        })
        res.status(204).end()
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
