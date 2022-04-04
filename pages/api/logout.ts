import { serialize } from 'cookie'
import { handleErrors } from '@lib/api'
import type { NextApiRequest, NextApiResponse } from 'next'

export default handleErrors(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        res.setHeader(
            'Set-Cookie',
            serialize('auth', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 0,
                path: '/',
            })
        )
        res.status(204).end()
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
})
