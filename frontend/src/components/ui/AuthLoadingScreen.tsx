import { useAuth } from "../../context/AuthContext";

const AuthLoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="text-center">
      <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-3 border-muted border-t-primary"></div>
      <p className="text-muted-foreground text-sm">Loading your profile...</p>
    </div>
  </div>
);

export default AuthLoadingScreen;