import * as yup from 'yup'
import bcrypt from 'bcrypt'
import prisma from '@lib/prisma'
import { handleErrors } from '@lib/api'
import type { NextApiRequest, NextApiResponse } from 'next'

export default handleErrors(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name, email, password } = req.body

        const schema = yup.object().shape({
            name: yup.string().required(),
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
            password: yup.string().min(8, 'Password must be at least 8 characters long').required(),
        })

        const data = await schema.validate({ email, password, name })

        // I'm adding any herebelow because TS flagged 'password: _' further down (L38)
        const user: any = await prisma?.user.create({
            data: {
                email: data.email,
                password: await bcrypt.hash(data.password, 12),
                name: data.name,
            },
        })
        const { password: _, ...newUser } = user
        res.status(201).json(newUser)
    } else {
        res.status(405).json({ error: `Method ${req.method} not allowed.` })
    }
})
