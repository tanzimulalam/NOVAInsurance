import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import QuoteForm from './pages/QuoteForm';
import CustomerLookup from './pages/CustomerLookup';
import Login from './pages/Login';
import Portal from './pages/Portal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="quote/:type" element={<QuoteForm />} />
            <Route path="lookup" element={<CustomerLookup />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
