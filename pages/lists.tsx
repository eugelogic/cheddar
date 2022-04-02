import Link from 'next/link'
import { List } from '@prisma/client'
import { NextPageContext } from 'next'
import { handleLogin } from '@lib/login'

// I guess I should use getServerSideProps() instead
Lists.getInitialProps = async (ctx: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/lists', ctx)
    return { lists: json }
}

type Lists = {
    lists: List[]
}
export default function Lists({ lists }: Lists) {
    return (
        <>
            <Link href="/">
                <a>
                    <h2>HOME</h2>
                </a>
            </Link>
            <br />
            <div>
                <h1>Lists</h1>
                <ul>{lists.length > 0 && lists.map((list) => <li key={list.name}>{list.name}</li>)}</ul>
            </div>
        </>
    )
}
