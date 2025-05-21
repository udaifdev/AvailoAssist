import React, { Suspense } from 'react'
import Header from '../../components/globle/Header'
import Footer from '../../components/globle/Footer'
import Loader from '../../components/globle/Loader'

const BookingComfirm = React.lazy(() => import('../../components/User/confirmation/BookingConfirmation'))

const ConfirmationPage = () => {
  return (
    <div>
      <Header/>
      <Suspense fallback={<Loader/>}>
        <BookingComfirm/>
      </Suspense>
      <Footer/>
    </div>
  )
}

export default ConfirmationPage
