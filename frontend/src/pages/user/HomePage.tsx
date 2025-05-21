import React, { Suspense } from 'react';
import Header from '../../components/globle/Header'
import Footer from '../../components/globle/Footer'
import Loader from '../../components/globle/Loader';

const Lazy_Index_Home = React.lazy(() => import('../../components/User/home/IndexHome'))

const HomePage = () => {
    return (
        < >
            <Suspense fallback={<Loader />}>
                <Header />
                <Lazy_Index_Home />
                <Footer />
            </Suspense>
        </>
    )
}

export default HomePage
