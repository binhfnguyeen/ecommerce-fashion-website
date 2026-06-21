import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginView } from '../views/LoginView';
import { DashboardView } from '../views/DashboardView';
import { CategoriesView } from '../views/CategoriesView';
import { ProductsView } from '../views/ProductsView';
import { UsersView } from '../views/UsersView';
import { OrdersView } from '../views/OrdersView';
import { ShopView } from '../views/ShopView';
import { OrderSuccessView } from '../views/OrderSuccessView';
import { OrderCancelView } from '../views/OrderCancelView';
import { ProfileView } from '../views/ProfileView';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<ShopView />} />
      <Route path="/profile" element={<ProfileView />} />
      <Route path="/order-success" element={<OrderSuccessView />} />
      <Route path="/order-cancel" element={<OrderCancelView />} />
      <Route path="/admin" element={<Layout />}>
        <Route index element={<DashboardView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="products" element={<ProductsView />} />
        <Route path="users" element={<UsersView />} />
        <Route path="orders" element={<OrdersView />} />
      </Route>
    </Routes>
  );
};
