import React from 'react';
// import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
// import Layout from 'src/components/Layout';
// import AccountView from 'src/views/account/AccountView';
// import CustomerListView from 'src/views/customer/CustomerListView';
import DashboardView from 'src/views/reports/DashboardView';
// import LoginView from 'src/views/auth/LoginView';
// import NotFoundView from 'src/views/errors/NotFoundView';
// import ProductListView from 'src/views/product/ProductListView';
// import RegisterView from 'src/views/auth/RegisterView';
import MainFrame from 'src/components/Layout';
// import SettingsView from 'src/views/settings/SettingsView';

const routes = [
  {
    path: 'app',
    element: <DashboardLayout />,
    children: [
      // { path: 'account', element: <AccountView /> },
      // { path: 'customers', element: <CustomerListView /> },
      { path: 'main', element: <MainFrame /> },
      { path: 'dashboard', element: <DashboardView /> }
      // { path: 'products', element: <ProductListView /> },
      // { path: 'settings', element: <SettingsView /> },
      // { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
