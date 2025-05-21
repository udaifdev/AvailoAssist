import React, { Suspense } from 'react'
import Loader from '../../components/globle/Loader';

const Lazy_Login = React.lazy(() => import('../../components/User/login/Login'))


const LoginPage = () => {
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <Lazy_Login />
      </Suspense>
    </div>
  )
}

export default LoginPage
