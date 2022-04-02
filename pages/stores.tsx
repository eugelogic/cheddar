import Link from 'next/link'
import { Store } from '@prisma/client'
import { NextPageContext } from 'next'
import { handleLogin } from '@lib/login'

// I guess I should use getServerSideProps() instead
Stores.getInitialProps = async (ctx: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/stores', ctx)
    return { stores: json }
}

type Stores = {
    stores: Store[]
}
export default function Stores({ stores }: Stores) {
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
                <ul>{stores.length > 0 && stores.map((store) => <li key={store.name}>{store.name}</li>)}</ul>
            </div>
        </>
    )
}
