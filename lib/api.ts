import { ValidationError } from 'yup'
import type { NextApiRequestWithUser } from './types'
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const { JWT_SECRET } = process.env

export class AuthenticationError extends Error {}

function verifyAsync(jwt: string, secret: string) {
    return new Promise(function (resolve, reject) {
        verify(jwt, secret, function (err, decoded: any) {
            if (err) {
                return reject(err)
            }
            resolve(decoded)
        })
    })
}

export const handleAuth = (fn: NextApiHandler) => async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    if (!JWT_SECRET) {
        throw new Error('No JWT_SECRET provided.')
    }
    try {
        const decoded = (await verifyAsync(req.cookies.auth!, JWT_SECRET)) as any
        req.user = decoded.user
        return await fn(req, res)
    } catch (err) {
        if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
            throw new AuthenticationError()
        }
        throw err
    }
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
            if (err instanceof AuthenticationError) {
                res.status(401).json({ error: 'Sorry you are not authenticated.' })
                return
            }
            throw err
        }
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.stack)
            res.status(500).json({ error: err.message })
        }
    }
}
