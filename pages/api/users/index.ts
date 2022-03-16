import * as yup from 'yup'
import prisma from '@lib/prisma'
import bcrypt from 'bcrypt'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const users = await prisma?.user.findMany()
        res.json(users)
    } else if (req.method === 'POST') {
        const { email, password, name, avatar } = req.body

        const schema = yup.object().shape({
            email: yup
                .string()
                .email('not a valid email')
                .test('unique-email', 'email address already exists', async (value) => {
                    const match = await prisma?.user.findUnique({
                        where: {
                            email: value,
                        },
                    })
                    return match === null
                })
                .required(),
            password: yup.string().min(8, 'must be at least 8 characters long').required(),
            name: yup.string().required(),
            avatar: yup.string().url().nullable(),
        })

        const data = await schema.validate({ email, password, name, avatar })

        const user = await prisma?.user.create({
            data: {
                email: data.email,
                password: await bcrypt.hash(data.password, 12),
                name: data.name,
                avatar: data.avatar,
            },
        })
        res.status(201).json(user)
    } else {
        res.status(405)
    }
}
