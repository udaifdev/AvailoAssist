import React from 'react'
import UserManagement from '../../components/Admin/management/UserManagement'
import Sidebar from '../../components/Admin/adminPart/Sidebar'
import AdminHeader from '../../components/Admin/adminPart/AdminHeader'

const AdminUser = () => {
    return (
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader />
      
      {/* Main Layout */}
      <div className="flex mt-24"> {/* Add margin-top to avoid overlap with fixed header */}
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 mt- ml-60"> {/* ml-60 should match sidebar width */}
          <UserManagement/>
        </main>
      </div>
    </div>
    )
}

export default AdminUser
