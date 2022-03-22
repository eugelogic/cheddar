import * as yup from 'yup'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof prisma === 'undefined') {
        res.status(500).json({ error: 'Internal server error.' })
        return
    }
    const product = await prisma.product.findUnique({
        where: {
            id: Number(req.query.id),
        },
    })
    if (product === null || typeof product === 'undefined') {
        res.status(404).json({ error: `Product with id: ${req.query.id} does not exist.` })
        return
    }
    if (req.method === 'GET') {
        res.json(product)
    } else if (req.method === 'PATCH') {
        const { name, description, listId } = req.body

        const schema = yup.object().shape({
            name: yup
                .string()
                .min(1, 'Name cannot be empty')
                .test('unique-name', 'Product name already exists.', async (value) => {
                    if (typeof value === 'undefined' || !listId) {
                        return true
                    }
                    const match = await prisma?.product.findFirst({
                        where: {
                            name: value,
                            listId: listId,
                        },
                    })
                    return match === null
                }),
            description: yup.string(),
            quantity: yup.number().min(1),
            needsBuying: yup.boolean(),
            basketed: yup.boolean(),
            positionIndex: yup.number(),
            price: yup.number(),
            pricePerMeasurement: yup.number(),
            image: yup.string().url(),
        })

        const data = await schema.validate({ name, description })

        const productUpdated = await prisma.product.update({
            where: {
                id: product.id,
            },
            data,
        })
        res.json(productUpdated)
    } else if (req.method === 'DELETE') {
        await prisma.product.delete({
            where: {
                id: product.id,
            },
        })
        res.status(204).end()
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
