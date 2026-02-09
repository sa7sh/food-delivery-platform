import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // We no longer store token in state, as it's in an HttpOnly cookie
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from API/Storage on mount
  useEffect(() => {
    const initAuth = async () => {
      // getUser now attempts to fetch profile using the cookie
      const { user } = await api.getUser();
      if (user) {
        setRestaurant(user);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const isAuthenticated = Boolean(restaurant);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success) {
        setRestaurant(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (restaurantName, email, password) => {
    setLoading(true);
    try {
      // 1. Register User
      const res = await api.signup(restaurantName, email, password);
      if (res.success) {
        setRestaurant(res.user);
        return { success: true };
      } else {
        return { success: false, error: res.error };
      }
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setRestaurant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        restaurant,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
