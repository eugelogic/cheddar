import * as yup from 'yup'
import prisma from '@lib/prisma'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiResponse, NextApiRequest } from 'next'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method === 'GET') {
            const lists = await prisma?.list.findMany()
            res.json(lists)
        } else if (req.method === 'POST') {
            const { storeId } = req.body

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .test('unique-name', 'List name already exists.', async (value) => {
                        const match = await prisma?.list.findFirst({
                            where: {
                                name: value,
                                storeId: storeId,
                            },
                        })
                        return match === null
                    })
                    .required(),
                description: yup.string().nullable(),
                storeId: yup
                    .number()
                    .test('store-id-not-found', 'Store id does not exist.', async (value) => {
                        const match = await prisma?.store.findFirst({
                            where: {
                                id: value,
                            },
                        })
                        return match !== null
                    })
                    .required(),
            })

            const data = await schema.validate(req.body)

            const list = await prisma?.list.create({ data })
            res.status(201).json(list)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
