import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LoginButton from './LoginButton';

const Layout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '20px 0 40px' }}>
        <Outlet />
      </main>
      <Footer />
      <LoginButton />
    </div>
  );
};

export default Layout;
