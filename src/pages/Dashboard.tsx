import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Users, 
  DollarSign, 
  CheckCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { storageService } from '../services/storage';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFaturado: 0,
    totalServicos: 0,
    topServicos: []
  });

  const [chartData, setChartData] = useState([
    { name: 'Jan', value: 0 },
    { name: 'Fev', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Abr', value: 0 },
    { name: 'Mai', value: 0 },
    { name: 'Jun', value: 0 },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    const budgets = storageService.load("budgets") || [];
    const clients = storageService.load("clients") || [];
    const services = storageService.load("services") || [];

    const totalFaturado = budgets.reduce((acc: number, curr: any) => acc + (curr.status === 'aprovado' || curr.status === 'concluido' ? curr.valor_total : 0), 0);
    const totalServicos = budgets.length;
    
    const topServicosMap: Record<string, number> = {};
    budgets.forEach((b: any) => {
      b.items?.forEach((item: any) => {
        if (item.tipo === 'servico') {
          topServicosMap[item.descricao] = (topServicosMap[item.descricao] || 0) + 1;
        }
      });
    });

    const topServicos = Object.entries(topServicosMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalFaturado,
      totalServicos,
      topServicos
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-zinc-400">Bem-vindo ao centro de comando do app A Obra (Modo Local).</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Estimativas" 
          value={stats.totalServicos.toString()} 
          icon={<FileText className="text-blue-500" />} 
          trend="+12% vs mês anterior"
          trendUp={true}
        />
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<DollarSign className="text-emerald-500" />} 
          trend="+8.2% vs mês anterior"
          trendUp={true}
        />
        <StatCard 
          title="Clientes" 
          value="-" 
          icon={<Users className="text-orange-500" />} 
          trend="+2 este mês"
          trendUp={true}
        />
        <StatCard 
          title="Serviços Concluídos" 
          value="-" 
          icon={<CheckCircle className="text-purple-500" />} 
          trend="-5% vs mês anterior"
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-red-500" />
              Desempenho Financeiro
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart width={500} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Secondary Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Serviços</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart width={500} height={300} data={stats.topServicos}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-zinc-400 text-sm font-medium">{title}</h4>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
