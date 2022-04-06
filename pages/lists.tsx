import Link from 'next/link'
import { List } from '@prisma/client'
import { NextPageContext } from 'next'
import { handleLogin } from '@lib/login'

export const getServerSideProps = async (context: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/lists', context)
    return {
        props: { lists: json },
    }
}

type Lists = {
    lists: List[]
}
const Lists = ({ lists }: Lists) => {
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

export default Lists
