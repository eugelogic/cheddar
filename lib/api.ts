import { verify } from 'jsonwebtoken'
import { ValidationError } from 'yup'
import { NextApiRequestWithUser } from './types'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const { JWT_SECRET } = process.env

export const handleAuth = (fn: NextApiHandler) => async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    if (!JWT_SECRET) {
        throw new Error('No JWT_SECRET provided.')
    }
    verify(req.cookies.auth!, JWT_SECRET, async function (err, decoded: any) {
        if (!err && decoded) {
            req.user = decoded.user
            return await fn(req, res)
        }
        res.status(401).json({ error: 'Sorry you are not authenticated.' })
    })
}

export const handleErrors = (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        try {
            return await fn(req, res)
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(422).json({ error: err.message })
                return
            }
            // add any extra error checks here
            throw err
        }
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.stack)
            res.status(500).json({ error: err.message })
        }
    }
}
