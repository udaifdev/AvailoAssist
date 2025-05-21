import React, { Suspense } from 'react'
import Loader from '../../components/globle/Loader';

const  Lazy_Signup = React.lazy(() => import('../../components/User/signup/Signup'))

const SignupPage  = () => {
  return (
    <>
      <Suspense fallback={<Loader/>}>
        <Lazy_Signup/>
      </Suspense>
    </>
  )
}

export default SignupPage
