import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Inicio from "./pages/Inicio";
import Transacciones from "./pages/Transacciones";
import Cuentas from "./pages/Cuentas";
import Presupuestos from "./pages/Presupuestos";
import Reportes from "./pages/Reportes";
import Categorias from "./pages/Categorias";
import Analisis from "./pages/Analisis";
import Configuracion from "./pages/Configuracion";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/transacciones" element={<Transacciones />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/presupuestos" element={<Presupuestos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/analisis" element={<Analisis />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;