
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Calendar, Settings, Sparkles, User, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  const isAdmin = currentUser?.role === "admin";
  const isLoggedIn = !!currentUser;

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isActive(to.split("?")[0].split("/").pop())
          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Agendar")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                RegiasJD
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2 items-center">
              <NavLink to={createPageUrl("Agendar")} icon={Calendar}>
                Agendar Cita
              </NavLink>

              {isLoggedIn && !isAdmin && (
                <NavLink to={createPageUrl("MisCitas")} icon={Calendar}>
                  Mis Citas
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink to={createPageUrl("MisCitas")} icon={Calendar}>
                    Mis Citas
                  </NavLink>
                  <NavLink to={createPageUrl("AdminCitas")} icon={Settings}>
                    Admin Citas
                  </NavLink>
                  <NavLink to={createPageUrl("ConfigurarServicios")} icon={Sparkles}>
                    Servicios
                  </NavLink>
                  <NavLink to={createPageUrl("ConfigurarHorarios")} icon={Settings}>
                    Horarios
                  </NavLink>
                </>
              )}

              {!isLoading && currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm text-gray-700 font-medium border-b">
                      {currentUser.full_name || currentUser.email}
                      {isAdmin && (
                        <div className="text-xs text-pink-600">Administradora</div>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Perfil")}>Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => base44.auth.logout()}>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {!isLoading && !currentUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="rounded-full text-gray-400 hover:text-gray-600"
                  title="Iniciar Sesión"
                >
                  <LogIn className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {!isLoading && currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm text-gray-700 font-medium border-b">
                      {currentUser.full_name || currentUser.email}
                      {isAdmin && (
                        <div className="text-xs text-pink-600">Administradora</div>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Perfil")}>Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => base44.auth.logout()}>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t space-y-2">
              <NavLink 
                to={createPageUrl("Agendar")} 
                icon={Calendar}
                onClick={() => setMobileMenuOpen(false)}
              >
                Agendar Cita
              </NavLink>

              {isLoggedIn && !isAdmin && (
                <NavLink 
                  to={createPageUrl("MisCitas")} 
                  icon={Calendar}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mis Citas
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink 
                    to={createPageUrl("MisCitas")} 
                    icon={Calendar}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Citas
                  </NavLink>
                  <NavLink 
                    to={createPageUrl("AdminCitas")} 
                    icon={Settings}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Citas
                  </NavLink>
                  <NavLink 
                    to={createPageUrl("ConfigurarServicios")} 
                    icon={Sparkles}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Servicios
                  </NavLink>
                  <NavLink 
                    to={createPageUrl("ConfigurarHorarios")} 
                    icon={Settings}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Horarios
                  </NavLink>
                </>
              )}

              {!isLoading && !currentUser && (
                <Button
                  variant="outline"
                  onClick={() => {
                    base44.auth.redirectToLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 RegiasJD. Sistema de Agendación de Citas.</p>
        </div>
      </footer>
    </div>
  );
}