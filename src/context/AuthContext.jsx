import { createContext, useContext, useState, useEffect } from 'react';
import { client } from '../api/graphqlClient';
import { GET_CURRENT_USER } from '../api/adminQueries';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Obtener información del usuario incluyendo roles
          const userData = await client.request(GET_CURRENT_USER);
          setUser({ 
            authenticated: true, 
            ...userData.currentUser,
            roles: userData.currentUser.roles || []
          });
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    try {
      // Obtener información del usuario después del login
      const userData = await client.request(GET_CURRENT_USER);
      setUser({ 
        authenticated: true, 
        ...userData.currentUser,
        roles: userData.currentUser.roles || []
      });
    } catch (error) {
      console.error('Error getting user data:', error);
      setUser({ authenticated: true, roles: [] });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('admin') || false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
