import { Navigate, Route, Routes } from "react-router-dom";
import { RequireGestor } from "./auth/RequireGestor";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CampaignDetail } from "./pages/CampaignDetail";
import { DoadorCadastro } from "./pages/DoadorCadastro";
import { DoadorEntrar } from "./pages/DoadorEntrar";
import { DoadorPerfil } from "./pages/DoadorPerfil";
import { Home } from "./pages/Home";
import { ManagerCampaignForm } from "./pages/ManagerCampaignForm";
import { ManagerHome } from "./pages/ManagerHome";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campanhas/:id" element={<CampaignDetail />} />
          <Route path="/login" element={<Navigate to="/entrar" replace />} />
          <Route path="/entrar" element={<DoadorEntrar />} />
          <Route path="/cadastro" element={<DoadorCadastro />} />
          <Route path="/perfil" element={<DoadorPerfil />} />
          <Route
            path="/gestor"
            element={
              <RequireGestor>
                <ManagerHome />
              </RequireGestor>
            }
          />
          <Route
            path="/gestor/nova"
            element={
              <RequireGestor>
                <ManagerCampaignForm />
              </RequireGestor>
            }
          />
          <Route
            path="/gestor/campanhas/:id/editar"
            element={
              <RequireGestor>
                <ManagerCampaignForm />
              </RequireGestor>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
