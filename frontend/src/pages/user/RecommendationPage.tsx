import React, { Suspense } from 'react'
import Header from '../../components/globle/Header'
import Footer from '../../components/globle/Footer'
import Loader from '../../components/globle/Loader'

const TaskRecommendation = React.lazy(() => import('../../components/User/taskAdding/TaskRecommendations'))

const RecommendationPage = () => {
  return (
    <div>
      <Header/>
      <Suspense fallback={<Loader/>}>
        <TaskRecommendation/>
      </Suspense>
      <Footer/>
    </div>
  )
}

export default RecommendationPage
