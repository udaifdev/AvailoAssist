import React, { Suspense } from 'react'
import Header from '../../components/globle/Header'
import Loader from '../../components/globle/Loader'

const BookingSuccsus = React.lazy(() => import('../../components/User/confirmation/BookingSuccsus'))

const Succsuss = () => {
  return (
    <div>
      <Header/>
      <Suspense fallback={<Loader/>}>
        <BookingSuccsus/>
      </Suspense>
    </div>
  )
}

export default Succsuss
