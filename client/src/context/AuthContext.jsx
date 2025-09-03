import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const res = await fetch(
        "https://portalda.github.io/fake-api-office-clocking/list-users-office-clocking.json"
      );
      const users = await res.json();

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("authUser", JSON.stringify(foundUser));
        return { success: true, role: foundUser.role };
      } else {
        return { success: false };
      }
    } catch (err) {
      console.error("Errore fetch utenti:", err);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
