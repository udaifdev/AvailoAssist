import React, { Suspense } from 'react'
// import AccountProfile from '../../components/User/profile/AccountProfile'
import Header from '../../components/globle/Header'
import Loader from '../../components/globle/Loader'
import Footer from '../../components/globle/Footer'

const AccountProfile = React.lazy(() => import('../../components/User/profile/AccountProfile'))

const ProfilePage = () => {
  return (
    <div>
      <Header />
      <Suspense fallback={<Loader />} >
        <AccountProfile />
      </Suspense>
      <Footer/>
    </div>
  )
}

export default ProfilePage
