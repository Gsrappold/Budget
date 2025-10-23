import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User as DBUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  dbUser: null,
  isAdmin: false,
  loading: true 
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Sync user with backend and get user data
      if (firebaseUser) {
        try {
          const userData = await apiRequest("POST", "/api/users/sync", {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }) as DBUser;
          setDbUser(userData);
        } catch (error) {
          console.error("Failed to sync user:", error);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      dbUser,
      isAdmin: dbUser?.isAdmin || false,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
