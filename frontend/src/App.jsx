// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import DetailMenu from "./pages/DetailMenu"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/menu/:id" element={<DetailMenu />} />
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
  );
}
