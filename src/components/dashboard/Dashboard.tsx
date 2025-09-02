import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  RefreshCw,
  MapPin,
  ChevronRight
} from 'lucide-react';
import Layout from '../common/Layout';
import StatCard from '../common/StatCard';
import { DashboardStats } from '../../types';
import { apiService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingCalculatedData, setIsUsingCalculatedData] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Primeiro tenta usar a API de dashboard
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
        setLastUpdated(new Date());
        setIsUsingCalculatedData(false);
      } catch (dashboardError) {
        console.warn('Dashboard API failed, fetching individual data:', dashboardError);
        setIsUsingCalculatedData(true);
        
        // Se falhar, busca dados individuais das outras APIs
        const [
          lockersData,
          studentsData,
          rentalsData,
          locaisData
        ] = await Promise.all([
          apiService.getLockers(1, 1000).catch(() => ({ data: [], total: 0 })),
          apiService.getStudents(1, 1000).catch(() => ({ data: [], total: 0 })),
          apiService.getRentals(1, 1000).catch(() => ({ data: [], total: 0 })),
          apiService.getLocais(1, 1000).catch(() => ({ data: [], total: 0 }))
        ]);

        // Calcula estatísticas baseadas nos dados reais
        const lockers = lockersData.data || [];
        const students = studentsData.data || [];
        const rentals = rentalsData.data || [];
        const locais = locaisData.data || [];

        const totalLockers = lockers.length;
        const availableLockers = lockers.filter(l => l.status === 'disponível').length;
        const rentedLockers = lockers.filter(l => l.status === 'alugado').length;
        const maintenanceLockers = lockers.filter(l => l.status === 'manutenção').length;
        
        const activeRentals = rentals.filter(r => r.status === 'active').length;
        const overdueRentals = rentals.filter(r => r.status === 'overdue').length;
        
        const totalStudents = students.length;
        
        // Calcula receita mensal (simulada baseada nas locações ativas)
        const monthlyRevenue = activeRentals * 50; // Valor base de R$ 50 por locação

        // Busca atividades recentes (últimas 5)
        const recentRentals = rentals
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        const recentStudents = students
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);

        const activities = [
          ...recentRentals.map(rental => ({
            type: 'rental',
            title: `Nova locação criada para o armário ${rental.locker?.numero || rental.lockerId}`,
            time: rental.createdAt,
            icon: 'rental'
          })),
          ...recentStudents.map(student => ({
            type: 'student', 
            title: `Novo aluno ${student.name} cadastrado`,
            time: student.createdAt,
            icon: 'student'
          }))
        ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

        setRecentActivities(activities);

        const calculatedStats: DashboardStats = {
          totalLockers,
          availableLockers,
          rentedLockers,
          maintenanceLockers,
          overdueRentals,
          monthlyRevenue,
          totalStudents,
          activeRentals,
          totalLocais: locais.length
        };

        setStats(calculatedStats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Define valores padrão em caso de erro total
      setStats({
        totalLockers: 0,
        availableLockers: 0,
        rentedLockers: 0,
        maintenanceLockers: 0,
        overdueRentals: 0,
        monthlyRevenue: 0,
        totalStudents: 0,
        activeRentals: 0,
        totalLocais: 0
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case '#lockers':
        window.location.hash = '#/lockers';
        break;
      case '#students':
        window.location.hash = '#/students';
        break;
      case '#rentals':
        window.location.hash = '#/rentals';
        break;
      default:
        window.location.hash = action;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rental':
        return { icon: CheckCircle, color: 'bg-green-500' };
      case 'student':
        return { icon: Users, color: 'bg-blue-500' };
      case 'maintenance':
        return { icon: Package, color: 'bg-yellow-500' };
      default:
        return { icon: CheckCircle, color: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <Layout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout currentPage="dashboard">
        <div className="text-center py-12">
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total de Armários',
      value: stats.totalLockers,
      icon: Package,
      color: 'blue' as const,
    },
    {
      title: 'Armários Disponíveis',
      value: stats.availableLockers,
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      title: 'Armários Locados',
      value: stats.rentedLockers,
      icon: Calendar,
      color: 'indigo' as const,
    },
    {
      title: 'Em Manutenção',
      value: stats.maintenanceLockers,
      icon: AlertTriangle,
      color: 'yellow' as const,
    },
    {
      title: 'Locações em Atraso',
      value: stats.overdueRentals,
      icon: Clock,
      color: 'red' as const,
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue}`,
      icon: DollarSign,
      color: 'green' as const,
    },
    {
      title: 'Total de Alunos',
      value: stats.totalStudents,
      icon: Users,
      color: 'purple' as const,
    },
    {
      title: 'Locações Ativas',
      value: stats.activeRentals,
      icon: TrendingUp,
      color: 'indigo' as const,
    },
    {
      title: 'Total de Locais',
      value: stats.totalLocais || 0,
      icon: MapPin,
      color: 'purple' as const,
    },
  ];

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Bem-vindo ao LockerSys</h1>
              <p className="text-blue-100">
                Gerencie seus armários, alunos e locações de forma eficiente e organizada.
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {lastUpdated && (
            <div className="text-xs text-blue-200 mt-2 flex items-center justify-between">
              <span>Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}</span>
              {isUsingCalculatedData && (
                <span className="bg-yellow-400/20 text-yellow-100 px-2 py-1 rounded text-xs">
                  Dados calculados
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction('#lockers')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cadastrar Novo Armário</p>
                      <p className="text-sm text-gray-500">Adicionar armário ao sistema</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('#students')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cadastrar Novo Aluno</p>
                      <p className="text-sm text-gray-500">Registrar novo estudante</p>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('#rentals')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-indigo-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Nova Locação</p>
                      <p className="text-sm text-gray-500">Iniciar nova locação de armário</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas e Notificações</h3>
              <div className="space-y-3">
                {stats.overdueRentals > 0 && (
                  <button 
                    onClick={() => handleQuickAction('#rentals')}
                    className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                        <div>
                          <p className="font-medium text-red-900">{stats.overdueRentals} locações em atraso</p>
                          <p className="text-sm text-red-700">Necessitam de atenção imediata</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-red-600" />
                    </div>
                  </button>
                )}
                {stats.maintenanceLockers > 0 && (
                  <button 
                    onClick={() => handleQuickAction('#lockers')}
                    className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                        <div>
                          <p className="font-medium text-yellow-900">{stats.maintenanceLockers} armários em manutenção</p>
                          <p className="text-sm text-yellow-700">Aguardando reparo</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-yellow-600" />
                    </div>
                  </button>
                )}
                {stats.availableLockers > 0 && (
                  <button 
                    onClick={() => handleQuickAction('#lockers')}
                    className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-900">{stats.availableLockers} armários disponíveis</p>
                          <p className="text-sm text-green-700">Prontos para locação</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-green-600" />
                    </div>
                  </button>
                )}
                {stats.overdueRentals === 0 && stats.maintenanceLockers === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">Tudo em ordem!</p>
                        <p className="text-sm text-blue-700">Não há alertas pendentes</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
            <div className="flow-root">
              {recentActivities.length > 0 ? (
                <ul className="-mb-8">
                  {recentActivities.slice(0, 5).map((activity, index) => {
                    const { icon: IconComponent, color } = getActivityIcon(activity.type);
                    const isLast = index === Math.min(recentActivities.length - 1, 4);
                    
                    return (
                      <li key={index}>
                        <div className={`relative ${!isLast ? 'pb-8' : ''}`}>
                          {!isLast && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center ring-8 ring-white`}>
                                <IconComponent className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-500 break-words">
                                  {activity.description}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500 flex-shrink-0">
                                <time>{getTimeAgo(activity.createdAt)}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;