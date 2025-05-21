import React, { Suspense } from 'react'
import Header from '../../components/globle/Header'
import Footer from '../../components/globle/Footer'
import Loader from '../../components/globle/Loader'

const TaskCreationPage = React.lazy(() => import('../../components/User/taskAdding/TaskCreation'))

const TaskerPage = () => {
  return (
    <div>
      <Header/>
      <Suspense fallback={<Loader/>}>
        <TaskCreationPage/>
      </Suspense>
      <Footer/>
    </div>
  )
}

export default TaskerPage
