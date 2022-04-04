import { NextApiRequest } from 'next'

export type NextApiRequestWithUser = NextApiRequest & {
    user?: {
        id: number
    }
}
