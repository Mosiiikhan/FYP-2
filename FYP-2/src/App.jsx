import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- 1. SETUP FILES ---
import Login1 from './Login1';
import Layout from './Layout'; 

// --- 2. SIDEBARS ---
import Dashboard from './DataCell/Dashboard'; 
import Admin from './Admin/Admin';   
import ADSidebar from './AssistantDirector/ADSidebar'; // ✅ AD Sidebar

// --- 3. PAGES ---
import ManageSemester from './DataCell/ManageSemester'; 
import ManageHolidays from './DataCell/ManageHolidays';
import Datesheet from './DataCell/Datesheet'; 
import Enrollment from './DataCell/Enrollment'; 
import SittingPlan from './DataCell/SittingPlan'; 
import ViewCalendar from './ViewCalendar';
import EmergencyHolidays from './Admin/EmergencyHolidays';
import RescheduleSaturdays from './Admin/ResheduleSaturdays';
import ChairPerson from './SocietyCP/ChairPerson';
import ManageEvents from './SocietyCP/ManageEvents';
import StudentDashboard from './Student/Student';
import ADDashboard from './AssistantDirector/ADDashboard';
<<<<<<< HEAD
import IslamicAdjustment from './Admin/IslamicAdjustment'; // Path check kar lein



=======
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

// 🛡️ SECURITY GUARD
const RoleBasedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) return <Navigate to="/" replace />;
  // Role matching logic
  if (!allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC ROUTE */}
        <Route path="/" element={<Login1 />} />

        {/* 2. STUDENT PANEL */}
        <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* 3. ADMIN PANEL */}
        <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout SidebarComponent={Admin} />}>
                <Route path="/admin" element={<ViewCalendar/>}/>
                <Route path="/reschedule-saturdays" element={<RescheduleSaturdays/>} />
                <Route path="/emergency-holidays" element={<EmergencyHolidays/>} />
                <Route path="/admin-calendar" element={<ViewCalendar />} />
<<<<<<< HEAD
                <Route path="/admin/islamic-adjust" element={<IslamicAdjustment />} />
=======
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
            </Route>
        </Route>

        {/* 4. DATACELL PANEL */}
        <Route element={<RoleBasedRoute allowedRoles={['datacell']} />}>
            <Route element={<Layout SidebarComponent={Dashboard} />}>
                <Route path="/dashboard" element={<ViewCalendar />} />
                <Route path="/manage-semester" element={<ManageSemester />} />
                <Route path="/holidays" element={<ManageHolidays />} />
                <Route path="/datesheet" element={<Datesheet />} />
                <Route path="/enrollment" element={<Enrollment />} />
                <Route path="/sittingplan" element={<SittingPlan />} />
                <Route path="/calendar" element={<ViewCalendar />} />
            </Route>
        </Route>

        {/* 5. CHAIRPERSON PANEL */}
        <Route element={<RoleBasedRoute allowedRoles={['chairperson', 'cp', 'teacher']} />}> 
            <Route element={<Layout SidebarComponent={ChairPerson} />}>
                <Route path="/chairPerson/dashboard" element={<ViewCalendar />} />
                <Route path="/chairPerson/events" element={<ManageEvents />} />
                <Route path="/chairPerson/cp-calendar" element={<ViewCalendar />} />
            </Route>
        </Route>

        {/* ===================================================
            6. ASSISTANT DIRECTOR PANEL (LOCKED 🔐)
            =================================================== */}
        {/* RoleBasedRoute add kar diya hai taake security confirm ho jaye */}
        <Route element={<RoleBasedRoute allowedRoles={['ad']} />}> 
          <Route element={<Layout SidebarComponent={ADSidebar} />}> 
               <Route path="/ad-dashboard" element={<ADDashboard />} />
               <Route path="/ad-calendar" element={<ViewCalendar />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;