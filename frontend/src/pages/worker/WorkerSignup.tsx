import React, { Suspense } from 'react'
import Loader from '../../components/globle/Loader'

const Lazy_worker_signup = React.lazy(() => import('../../components/Worker/signup/Signup'))


const WorkerSignup = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Lazy_worker_signup />
      </Suspense>
    </>
  )
}

export default WorkerSignup
