import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        if (req.method === 'GET') {
            const currentUser = req.user!
            const store = await prisma.store.findUnique({
                where: {
                    id: parseInt(`${req.query.id}`, 10),
                },
            })
            if (store === null || typeof store === 'undefined') {
                res.status(404).json({ error: `Store with id: ${req.query.id} does not exist.` })
                return
            }
            if (currentUser.id !== store.userId) {
                res.status(403).json({ error: 'User not authorised.' })
                return
            }
            const lists = await prisma?.list.findMany({
                where: {
                    storeId: store.id,
                },
            })
            res.json(lists)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
