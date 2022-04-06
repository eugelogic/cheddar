import * as yup from 'yup'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
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
        if (req.method === 'GET') {
            res.json(store)
        } else if (req.method === 'PATCH') {
            const { name, location } = req.body

            const schema = yup.object().shape({
                name: yup.string().min(1, 'Name cannot be empty'),
                location: yup.string(),
            })

            const data = await schema.validate({ name, location })

            const storeUpdated = await prisma.store.update({
                where: {
                    id: store.id,
                },
                data,
            })
            res.json(storeUpdated)
        } else if (req.method === 'DELETE') {
            await prisma.store.delete({
                where: {
                    id: store.id,
                },
            })
            res.status(204).end()
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
