
import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './AuthForm/login'
import Signup from './AuthForm/signup'
import ForgotPassword from './AuthForm/forgotpassword'
import Home from './components/home'
import About from './components/about'
import Navbar from './components/navbar'
import AuthNavbar from './AuthForm/authnavbar'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsConditions from './components/TermsCondition'
import Developers from './components/Developers'
import Contact from './components/Contact'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Today from './pages/dashboard/today'
import Weekly from './pages/dashboard/weekly'
import Monthly from './pages/dashboard/monthly'
import Streaks from './pages/dashboard/streaks'

import Dashboard from './pages/dashboard/DashboardLayout'
import ProtectedRoute from './Routes/ProtectedRoute'

const App = () => {

  const location = useLocation();

  const isAuthForm = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgotpassword';
  return (
    <>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

    
      {isAuthForm ? <AuthNavbar /> : <Navbar />}

    <div key={location.pathname} className="page">
  <Routes location={location}>

  <Route path="/" element={<Home />} />
  <Route path='/about' element={<About />} />
 
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/forgotpassword" element={<ForgotPassword />} />
  <Route path="/privacypolicy" element={<PrivacyPolicy />} />
  <Route path="/termsconditions" element={<TermsConditions />} />
  <Route path="/developers" element={<Developers />} />
  <Route path="/contact" element={<Contact />} />
  {/* <Route path="/Dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} /> */}
  <Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<Overview />} />
  <Route path="today" element={<Today />} />
  <Route path="weekly" element={<Weekly />} />
  <Route path="monthly" element={<Monthly />} />
  <Route path="streaks" element={<Streaks />} />
</Route>

</Routes>



</div>
</div>
   </>
)
}

export default App

