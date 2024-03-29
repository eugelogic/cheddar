import * as yup from 'yup'
import bcrypt from 'bcrypt'
import { prisma } from '@lib/prisma'
import type { NextApiResponse } from 'next'
import { handleAuth, handleErrors } from '@lib/api'
import type { NextApiRequestWithUser } from '@lib/types'

export default handleErrors(
    handleAuth(async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
        const currentUser = req.user!
        if (req.method === 'GET') {
            const users = await prisma.user.findMany({
                where: {
                    id: currentUser.id,
                },
            })
            res.json(users?.map(({ password, ...user }) => user))
        } else if (req.method === 'POST') {
            const { email, password, name, avatar } = req.body

            const schema = yup.object().shape({
                email: yup
                    .string()
                    .email('not a valid email')
                    .test('unique-email', 'email address already exists', async (value) => {
                        const match = await prisma.user.findUnique({
                            where: {
                                email: value,
                            },
                        })
                        return match === null
                    })
                    .required(),
                password: yup.string().min(8, 'Password must be at least 8 characters long').required(),
                name: yup.string().required(),
                avatar: yup.string().url().nullable(),
            })

            const data = await schema.validate({ email, password, name, avatar })

            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: await bcrypt.hash(data.password, 12),
                    name: data.name,
                    avatar: data.avatar,
                },
            })
            res.status(201).json(user)
        } else {
            res.status(405).json({ error: `Method ${req.method} not allowed.` })
        }
    })
)
