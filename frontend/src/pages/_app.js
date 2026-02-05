import "@/styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";

export default function App({ Component, pageProps }) {
  // Determine if we should show the navbar (example logic, can be refined)
  // For now, let's keep it simple or follow the original App.jsx logic if possible.
  // Original App.jsx handled Navbar conditionally based on path.
  // We can stick to a simple layout here or move layout to its own component.
  // Converting the global layout:

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* We will handle Navbar inside page layouts or here conditionally if essential */}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

