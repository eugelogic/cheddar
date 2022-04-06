import Link from 'next/link'
import { Store } from '@prisma/client'
import { NextPageContext } from 'next'
import { handleLogin } from '@lib/login'

export const getServerSideProps = async (context: NextPageContext) => {
    const json = await handleLogin('http://localhost:3000/api/stores', context)
    return {
        props: { stores: json },
    }
}

type Stores = {
    stores: Store[]
}
const Stores = ({ stores }: Stores) => {
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

export default Stores
