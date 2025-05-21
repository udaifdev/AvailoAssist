import React, { Suspense } from 'react'
import Loader from '../../components/globle/Loader';

const  UserForgotPass = React.lazy(() => import('../../components/User/forgotPass/UserForgotPass'))


const ForgotPage = () => {
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <UserForgotPass />
      </Suspense>
    </div>
  )
}

export default ForgotPage
