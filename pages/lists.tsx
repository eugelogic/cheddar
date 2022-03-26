import Link from 'next/link'
import { handleLogin } from '@lib/login'
import { NextPageContext } from 'next'

// I guess I should use getServerSideProps() instead
Lists.getInitialProps = async (ctx: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/lists', ctx)
    return { lists: json }
}

export default function Lists({ lists }: any) {
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
                {/* <code>{JSON.stringify(lists)}</code> */}
                <ul>{lists.length > 0 && lists.map((list: any) => <li key={list.name}>{list.name}</li>)}</ul>
            </div>
        </>
    )
}
