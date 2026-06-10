import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useStore, User } from '../../lib/store';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useStore(state => state.user);
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const isInitialized = useStore(state => state.isInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Allow guests to view all pages as per request, 
    // unless they are explicitly blocked by other logic.
    return <>{children}</>;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to dashboard or an unauthorized page
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}