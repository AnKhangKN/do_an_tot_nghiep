import React from 'react'

export const routes = [
    // start page
    {
        path: '/',
        name: 'Start Page',
        component: React.lazy(() => import('../pages/StartPage/StartPage'))
    },

    // auth routes
    {
        path: '/login',
        name: 'Login',
        component: React.lazy(() => import('../pages/auth/LoginPage/LoginPage'))
    },
    {
        path: '/forgot-password',
        name: 'Forgot Password',
        component: React.lazy(() => import('../pages/auth/ForgotPasswordPage/ForgotPasswordPage'))
    },

    // Admin routes
    {
        path: '/admin/dashboard',
        name: 'Dashboard',
        component: React.lazy(() => import('../pages/admin/DashboardPage/DashboardPage')),
        isAdmin: true
    },
    {
        path: '/admin/user',
        name: 'User',
        component: React.lazy(() => import('../pages/admin/UserPage/UserPage')),
        isAdmin: true
    },
    {
        path: '/admin/rescuer',
        name: 'Rescuer',
        component: React.lazy(() => import('../pages/admin/RescuerPage/RescuerPage')),
        isAdmin: true
    },
    {
        path: '/admin/dangerous-zone',
        name: 'Dangerous Zone',
        component: React.lazy(() => import('../pages/admin/DangerousZonePage/DangerousZonePage')),
        isAdmin: true
    },
    {
        path: '/admin/vehicle',
        name: 'Vehicle',
        component: React.lazy(() => import('../pages/admin/VehiclePage/VehiclePage')),
        isAdmin: true
    },
    {
        path: '/admin/incident-type',
        name: 'Incident Type',
        component: React.lazy(() => import('../pages/admin/IncidentTypePage/IncidentTypePage')),
        isAdmin: true
    },
    {
        path: '/admin/notification',
        name: 'Notification',
        component: React.lazy(() => import('../pages/admin/NotificationPage/NotificationPage')),
        isAdmin: true
    },
    {
        path: '/admin/map',
        name: 'Map',
        component: React.lazy(() => import('../pages/admin/MapPage/MapPage')),
        isAdmin: true
    },
    {
        path: '/admin/feedback',
        name: 'Feedback',
        component: React.lazy(() => import('../pages/admin/FeedbackPage/FeedbackPage')),
        isAdmin: true
    },
    {
        path: '/admin/profile',
        name: 'Profile',
        component: React.lazy(() => import('../pages/admin/ProfilePage/ProfilePage')),
        isAdmin: true

    },
    {
        path: '/admin/setting',
        name: 'Setting',
        component: React.lazy(() => import('../pages/admin/SettingPage/SettingPage')),
        isAdmin: true
    },

    // 404 route
    { 
        path: "*", 
        name: 'Not Found', 
        component: React.lazy(() => import('../pages/NotFoundPage/NotFoundPage')) 
    },
]

