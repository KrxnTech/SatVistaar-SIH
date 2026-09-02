import React from 'react';
import { AuthPage } from '@/components/ui/auth-page';

export function Login({ onNavigateToRegister, onSuccess }) {
  return (
    <div className="gov-auth-wrapper">
      <AuthPage
        onNavigateToRegister={onNavigateToRegister}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export default Login;

