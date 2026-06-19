import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginButton = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="login-corner">
      <Link
        to={isAuthenticated ? '/portal' : '/login'}
        className="btn btn-ghost"
        title={isAuthenticated ? 'Management Portal' : 'Owner Login'}
      >
        <LogIn size={16} />
        {isAuthenticated ? 'Portal' : 'Login'}
      </Link>
    </div>
  );
};

export default LoginButton;
