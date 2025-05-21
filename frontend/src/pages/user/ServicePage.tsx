import React, { Suspense } from 'react'
// import ServiceListing from '../../components/User/category/ServiceListing'
import Header from '../../components/globle/Header'
import Loader from '../../components/globle/Loader'
import Footer from '../../components/globle/Footer'

const ServiceListing = React.lazy(() => import('../../components/User/category/ServiceListing'))

const ServicePage = () => {
    return (
        <div>
            <Header />
            <Suspense fallback={<Loader />}>
                <ServiceListing />
            </Suspense>
            <Footer/>
        </div>
    )
}

export default ServicePage
