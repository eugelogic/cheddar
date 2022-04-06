import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        if (req.method === 'GET') {
            const currentUser = req.user!
            const list = await prisma.list.findFirst({
                where: {
                    AND: [
                        { id: parseInt(`${req.query.id}`, 10) },
                        {
                            store: {
                                userId: currentUser.id,
                            },
                        },
                    ],
                },
            })
            if (list === null || typeof list === 'undefined') {
                res.status(404).json({ error: `List with id: ${req.query.id} does not exist.` })
                return
            }
            const products = await prisma?.product.findMany({
                where: {
                    listId: list.id,
                },
            })
            res.json(products)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
