import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '#dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'Armários', href: '#lockers', icon: Package, current: currentPage === 'lockers' },
    { name: 'Alunos', href: '#students', icon: Users, current: currentPage === 'students' },
    { name: 'Locações', href: '#rentals', icon: Calendar, current: currentPage === 'rentals' },
    { name: 'Pagamentos', href: '#payments', icon: CreditCard, current: currentPage === 'payments' },
    ...(user?.role === 'admin' ? [
      { name: 'Usuários', href: '#users', icon: Shield, current: currentPage === 'users' }
    ] : []),
    { name: 'Configurações', href: '#settings', icon: Settings, current: currentPage === 'settings' },
  ];

  const handleNavigation = (href: string) => {
    window.location.hash = href;
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setSidebarOpen(false)} 
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LockerSys</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left transition-colors duration-200 ${
                    item.current
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-4 h-6 w-6 ${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.email?.split('@')[0].slice(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-base font-medium text-gray-700">{user?.email}</p>
                <p className="text-sm font-medium text-gray-500">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LockerSys</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200 ${
                    item.current
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.email?.split('@')[0].slice(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <p className="text-xs font-medium text-gray-500">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-900 capitalize">
                {currentPage === 'dashboard' ? 'Dashboard' : 
                 currentPage === 'lockers' ? 'Armários' :
                 currentPage === 'students' ? 'Alunos' :
                 currentPage === 'rentals' ? 'Locações' :
                 currentPage === 'payments' ? 'Pagamentos' :
                 currentPage === 'users' ? 'Usuários' :
                 currentPage === 'settings' ? 'Configurações' : currentPage}
              </h1>
            </div>

            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={logout}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;