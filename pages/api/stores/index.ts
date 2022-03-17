import * as yup from 'yup'
import prisma from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const stores = await prisma?.store.findMany()
        res.json(stores)
    } else if (req.method === 'POST') {
        const schema = yup.object().shape({
            userId: yup
                .number()
                .integer()
                .test('user-exists', 'user id does not exist', async (id) => {
                    const unique = await prisma?.user.findUnique({
                        where: {
                            id: id,
                        },
                    })
                    return unique !== null
                })
                .required(),
            name: yup.string().required(),
            location: yup.string().nullable(),
        })
        const data = await schema.validate(req.body)
        const store = await prisma?.store.create({ data })
        res.status(201).json(store)
    } else {
        res.status(405)
    }
}
