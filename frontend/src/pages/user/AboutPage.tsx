import React, { Suspense } from 'react'
import Header from '../../components/globle/Header'
import Footer from '../../components/globle/Footer'
import Loader from '../../components/globle/Loader'

const AboutDetails = React.lazy(() => import('../../components/User/about/About'))

const AboutPage = () => {
  return (
    <div>
      <Header/>
      <Suspense fallback={<Loader/>}>
        <AboutDetails/>
      </Suspense>
      <Footer/>
    </div>
  )
}

export default AboutPage
