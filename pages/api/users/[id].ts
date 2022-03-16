import * as yup from 'yup'
import bcrypt from 'bcrypt'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (typeof prisma === 'undefined') {
        res.status(500).send('Internal server error.')
        return
    }
    const user = await prisma.user.findUnique({
        where: {
            id: Number(req.query.id),
        },
    })
    if (user === null || typeof user === 'undefined') {
        res.status(404).json({ error: `User with id: ${req.query.id} does not exist.` })
        return
    }
    if (req.method === 'GET') {
        const { password, ...userData } = user
        res.json(userData)
    } else if (req.method === 'PATCH') {
        const { email, password, name, avatar } = req.body
        const schema = yup.object().shape({
            email: yup
                .string()
                .email('not a valid email')
                .test('unique-email', 'email address already exists', async (value) => {
                    if (typeof value === 'undefined' || user.email === value) {
                        return true
                    }
                    const match = await prisma!.user.findUnique({
                        where: {
                            email: value,
                        },
                    })
                    return match === null
                }),
            password: yup.string().min(8),
            name: yup.string(),
            avatar: yup.string().url().nullable(),
        })

        const data = await schema.validate({ email, password, name, avatar })

        if (typeof data.password !== 'undefined') {
            data.password = await bcrypt.hash(data.password, 12)
        }

        const { password: _, ...userUpdated } = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                avatar: data.avatar,
            },
        })
        res.json(userUpdated)
    } else if (req.method === 'DELETE') {
        await prisma.user.delete({
            where: {
                id: user.id,
            },
        })
        res.send(`User with id: ${user.id} deleted`)
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
}
