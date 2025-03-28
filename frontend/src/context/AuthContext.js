import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => setUser(response.data))
        .catch(() => {
          setToken('');
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
      username,
      password,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: [(data) => {
        const params = new URLSearchParams();
        params.append('username', data.username);
        params.append('password', data.password);
        return params;
      }],
    });
    const { access_token } = response.data;
    setToken(access_token);
    localStorage.setItem('token', access_token);
    const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    setUser(userResponse.data);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);