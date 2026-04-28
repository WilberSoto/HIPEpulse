import { Suspense } from 'react'
import LoginForm from './loginform'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}