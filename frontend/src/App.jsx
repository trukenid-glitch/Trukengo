// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import DetailMenu from "./pages/DetailMenu"
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateBaseLocation from "./pages/super_admin/UpdateBaseLocation";
import TikTokBarrier from "./components/TikTokBarrier";
import ManageStores from "./pages/super_admin/ManageStores";
import EditStore from "./pages/super_admin/EditStore";


// admin
import AdminDashboard from "./pages/super_admin/AdminDashboard";
import AddStore from "./pages/super_admin/AddStore";
import EditConfig from "./pages/super_admin/EditConfig";

export default function App() {
  return (
    <>
      {/* TARUH DI SINI, ndes! Di luar Routes biar dia stand-by di halaman mana pun */}
      <TikTokBarrier />

      <Routes>
        <Route path="/cek-ongkir" element={<Home />} />
        <Route path="/" element={<Menu />} />
        <Route path="/menu/:id" element={<DetailMenu />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route 
          path="/super-admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/super-admin/set-location" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UpdateBaseLocation />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin/tambah-toko" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddStore />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin/kelola-toko" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStores />
            </ProtectedRoute>
          } 
        />
      
        <Route 
          path="/super-admin/edit-toko/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditStore />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin/edit-config" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditConfig />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/super-admin/edit-config" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditConfig />
            </ProtectedRoute>
          } 
        />
      
        <Route
          path="*"
          element={
            <div className="min-h-screen p-8 bg-red-50 text-red-700">
              <h1 className="text-2xl font-bold">
                404 - Halaman tidak ditemukan
              </h1>
              <p>Rute ini belum terdaftar di App.jsx.</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}
