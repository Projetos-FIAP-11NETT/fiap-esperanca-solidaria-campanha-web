import { Route, Routes } from "react-router-dom";
import { RequireGestor } from "./auth/RequireGestor";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CampaignDetail } from "./pages/CampaignDetail";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { ManagerCampaignForm } from "./pages/ManagerCampaignForm";
import { ManagerHome } from "./pages/ManagerHome";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campanhas/:id" element={<CampaignDetail />} />
          <Route path="/login" element={<Login />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
