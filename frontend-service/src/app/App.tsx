import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginView } from '../views/LoginView';
import { DashboardView } from '../views/DashboardView';
import { CategoriesView } from '../views/CategoriesView';
import { ProductsView } from '../views/ProductsView';
import { UsersView } from '../views/UsersView';
import { OrdersView } from '../views/OrdersView';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="products" element={<ProductsView />} />
        <Route path="users" element={<UsersView />} />
        <Route path="orders" element={<OrdersView />} />
      </Route>
    </Routes>
  );
};
