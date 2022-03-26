import { NextPageContext } from 'next'
import Router from 'next/router'

export async function handleLogin(url: string, ctx: NextPageContext) {
    const cookie = ctx.req?.headers.cookie

    const res = await fetch(url, {
        headers: {
            cookie: cookie!,
        },
    })

    // client side redirect
    if (res.status === 401 && !ctx.req) {
        Router.replace('/login')
        return
    }

    // server side redirect
    if (res.status === 401 && ctx.req) {
        ctx.res?.writeHead(302, {
            Location: 'http://localhost:3000/login',
        })
        ctx.res?.end()
        return
    }

    const json = await res.json()
    return json
}
