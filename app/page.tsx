import { redirect } from "next/navigation";
import MailLayout from "./components/MailLayout";

// Cette fonction s'exécute côté serveur
function checkServerAuth() {
  // Pour l'instant, on laisse passer tout le monde en développement
  // En production, vous pourriez vérifier les cookies ou sessions ici
  return true;
}

export default function Home() {
  const isAuthenticated = checkServerAuth();

  if (!isAuthenticated) {
    redirect("/login");
  }

  // Si authentifié, afficher l'interface mail
  return <MailLayout />;
}
