import * as yup from 'yup'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        const currentUser = req.user!
        if (req.method === 'GET') {
            const lists = await prisma.list.findMany({
                where: {
                    store: {
                        userId: currentUser.id,
                    },
                },
            })
            res.json(lists)
        } else if (req.method === 'POST') {
            const { storeId } = req.body

            const currentStore = await prisma.store.findUnique({
                where: {
                    id: storeId,
                },
            })
            if (currentStore?.userId !== currentUser.id) {
                res.status(403).json({ error: 'This store belongs to another user.' })
            }

            const schema = yup.object().shape({
                name: yup
                    .string()
                    .test('unique-name', 'List name already exists.', async (value) => {
                        const match = await prisma.list.findFirst({
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
                        const match = await prisma.store.findFirst({
                            where: {
                                id: value,
                            },
                        })
                        return match !== null
                    })
                    .required(),
            })

            const data = await schema.validate(req.body)

            const list = await prisma.list.create({ data })
            res.status(201).json(list)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
