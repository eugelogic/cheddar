import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import type { NextApiRequestWithUser } from '@lib/types'
import { AuthenticationError, handleAuth, handleErrors } from '@lib/api'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        if (req.method === 'GET') {
            const currentUser = req.user!
            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(`${currentUser.id}`, 10),
                },
            })
            if (user === null) {
                throw new AuthenticationError()
            }
            const { password, ...userData } = user
            res.json(userData)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
