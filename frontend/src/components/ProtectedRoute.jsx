import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. Ambil data user dari localStorage
  const userJson = localStorage.getItem('user');
  let user = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (error) {
      // Kalau localStorage user rusak, hapus dan redirect ke login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      user = null;
      console.error('ProtectedRoute: malformed localStorage user', error);
    }
  }

  // 2. Kalau gak ada user (belum login), tendang ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Kalau ada user tapi Role-nya gak sesuai, tendang balik ke home atau login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Waduh ndes, kamu gak punya akses ke sini!");
    return <Navigate to="/" replace />;
  }

  // 4. Kalau semua oke, silakan masuk
  return children;
};

export default ProtectedRoute;