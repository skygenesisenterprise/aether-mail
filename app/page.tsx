import { redirect } from "next/navigation";

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

  // Si authentifié, rediriger vers la boîte de réception
  redirect("/inbox");
}
