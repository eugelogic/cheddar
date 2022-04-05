import * as yup from 'yup'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        const currentUser = req.user!
        if (req.method === 'GET') {
            const products = await prisma.product.findMany({
                where: {
                    list: {
                        store: {
                            userId: currentUser.id,
                        },
                    },
                },
            })
            res.json(products)
        } else if (req.method === 'POST') {
            const { listId } = req.body

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .test('unique-name', 'Product name already exists.', async (value) => {
                        const match = await prisma.product.findFirst({
                            where: {
                                name: value,
                                listId: listId,
                            },
                        })
                        return match === null
                    })
                    .required(),
                description: yup.string().nullable(),
                quantity: yup.number().min(1).required(),
                needsBuying: yup.boolean().required(),
                basketed: yup.boolean().required(),
                positionIndex: yup.number().required(),
                price: yup.number().nullable(),
                pricePerMeasurement: yup.number().nullable(),
                image: yup.string().url().nullable(),
                listId: yup
                    .number()
                    .test('list-id-not-found', 'List id does not exist.', async (value) => {
                        const match = await prisma.list.findFirst({
                            where: {
                                id: value,
                            },
                        })
                        return match !== null
                    })
                    .required(),
            })

            const data = await schema.validate(req.body)

            const product = await prisma.product.create({ data })
            res.status(201).json(product)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
