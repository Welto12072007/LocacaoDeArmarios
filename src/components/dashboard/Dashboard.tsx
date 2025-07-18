import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';
import Layout from '../common/Layout';
import StatCard from '../common/StatCard';
import { DashboardStats } from '../../types';
import { apiService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
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
      trend: { value: 5, label: 'vs mês anterior', isPositive: true }
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
      trend: { value: 12, label: 'vs mês anterior', isPositive: true }
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
      value: stats.monthlyRevenue,
      icon: DollarSign,
      color: 'green' as const,
      trend: { value: 8, label: 'vs mês anterior', isPositive: true }
    },
    {
      title: 'Total de Alunos',
      value: stats.totalStudents,
      icon: Users,
      color: 'purple' as const,
      trend: { value: 15, label: 'vs mês anterior', isPositive: true }
    },
    {
      title: 'Locações Ativas',
      value: stats.activeRentals,
      icon: TrendingUp,
      color: 'indigo' as const,
    },
  ];

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao LockerSys</h1>
          <p className="text-blue-100">
            Gerencie seus armários, alunos e locações de forma eficiente e organizada.
          </p>
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
              trend={card.trend}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cadastrar Novo Armário</p>
                      <p className="text-sm text-gray-500">Adicionar armário ao sistema</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cadastrar Novo Aluno</p>
                      <p className="text-sm text-gray-500">Registrar novo estudante</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-900">12 locações em atraso</p>
                      <p className="text-sm text-red-700">Necessitam de atenção imediata</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-900">7 armários em manutenção</p>
                      <p className="text-sm text-yellow-700">Aguardando reparo</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">45 armários disponíveis</p>
                      <p className="text-sm text-green-700">Prontos para locação</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Nova locação criada para o armário <span className="font-medium text-gray-900">A001</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>2 min atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <Users className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Novo aluno <span className="font-medium text-gray-900">Maria Santos</span> cadastrado
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>15 min atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <Package className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Armário <span className="font-medium text-gray-900">B015</span> marcado para manutenção
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>1 hora atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;