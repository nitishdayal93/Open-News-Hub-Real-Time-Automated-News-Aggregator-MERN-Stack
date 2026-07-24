import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              {/* Top Navigation */}
              <Navbar />

              {/* Core Screen Content Area */}
              <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
                <Routes>
                  {/* Public Feeds */}
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/article/:id"
                    element={
                      <ProtectedRoute>
                        <ArticleDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Authenticated user feeds */}
                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute>
                        <BookmarksPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Authorized administrative dashboards */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              {/* Shared footer */}
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
