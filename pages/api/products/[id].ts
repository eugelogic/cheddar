import * as yup from 'yup'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        const currentUser = req.user!
        const product = await prisma.product.findFirst({
            where: {
                AND: [
                    { id: parseInt(`${req.query.id}`, 10) },
                    {
                        list: {
                            store: {
                                userId: currentUser.id,
                            },
                        },
                    },
                ],
            },
        })
        if (product === null || typeof product === 'undefined') {
            res.status(404).json({ error: `Product with id: ${req.query.id} does not exist.` })
            return
        }
        if (req.method === 'GET') {
            res.json(product)
        } else if (req.method === 'PATCH') {
            const { listId } = req.body

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .min(1, 'Name cannot be empty')
                    .test('unique-name', 'Product name already exists.', async (value) => {
                        if (typeof value === 'undefined' || !listId) {
                            return true
                        }
                        const match = await prisma.product.findFirst({
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

            const data = await schema.validate(req.body)

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
    })
)
