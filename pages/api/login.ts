import * as yup from 'yup'
import bcrypt from 'bcrypt'
import { serialize } from 'cookie'
import prisma from '@lib/prisma'
import { sign } from 'jsonwebtoken'
import { handleErrors } from '@lib/api'
import type { NextApiRequest, NextApiResponse } from 'next'

const { JWT_SECRET } = process.env

export default handleErrors(async function handler(req: NextApiRequest, res: NextApiResponse) {
    // can this error check go since I added /lib/api.ts ?
    if (typeof prisma === 'undefined') {
        res.status(500).json({ error: 'Internal server error.' })
        return
    }
    if (req.method === 'POST') {
        const schema = yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().required(),
        })
        const { email, password } = await schema.validate(req.body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (user === null || typeof user === 'undefined') {
            res.status(401).json({ error: `User with id: ${req.query.id} does not exist.` })
            return
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (passwordsMatch) {
            const payload = { user: { id: user.id } }
            if (!JWT_SECRET) {
                throw new Error('No JWT_SECRET provided.')
            }
            const jwt = sign(payload, JWT_SECRET!, { expiresIn: '1w' })
            res.setHeader(
                'Set-Cookie',
                serialize('auth', jwt, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 7 * 24,
                    path: '/',
                })
            )
            // res.json({ message: 'Welcome back to the app.' })
            res.json(user.id)
        } else {
            res.status(401).json({ error: 'Invalid email or password.' })
        }
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
})
