import Link from 'next/link'
import { useRef, useState } from 'react'

export default function Login() {
    const emailRef = useRef<HTMLInputElement>(null)
    const passRef = useRef<HTMLInputElement>(null)
    const [message, setMessage] = useState<{ id: number } | null>(null)
    async function handleLogin() {
        const resp = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailRef.current?.value,
                password: passRef.current?.value,
            }),
        })
        const json = await resp.json()
        setMessage(json)
    }

    return (
        <div>
            <Link href="/">
                <a>
                    <h2>HOME</h2>
                </a>
            </Link>
            <br />
            {JSON.stringify(message)} <br />
            {/* replace with Formik */}
            <input type="text" placeholder="email" ref={emailRef} />
            <br />
            <input type="password" placeholder="password" ref={passRef} />
            <br />
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}
