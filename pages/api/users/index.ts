import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const users = await prisma?.user.findMany()
        res.json(users)
    } else if (req.method === 'POST') {
        const body = req.body
        const post = await prisma?.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name,
                avatar: body.avatar,
            },
        })
        res.status(201).json(post)
    } else {
        res.status(405)
    }
}
