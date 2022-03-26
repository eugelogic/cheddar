import Link from 'next/link'
import { handleLogin } from '@lib/login'
import { NextPageContext } from 'next'

// I guess I should use getServerSideProps() instead
Stores.getInitialProps = async (ctx: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/stores', ctx)
    return { stores: json }
}

export default function Stores({ stores }: any) {
    return (
        <>
            <Link href="/">
                <a>
                    <h2>HOME</h2>
                </a>
            </Link>
            <br />
            <div>
                <h1>Stores</h1>
                {/* <code>{JSON.stringify(stores)}</code> */}
                <ul>{stores.length > 0 && stores.map((store: any) => <li key={store.name}>{store.name}</li>)}</ul>
            </div>
        </>
    )
}
