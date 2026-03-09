import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { storageService } from '../services/storage';

const Financeiro: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntrada: 0,
    totalSaida: 0,
    saldo: 0
  });
  const [transacoes, setTransacoes] = useState<any[]>([]);

  useEffect(() => {
    fetchFinanceiro();
  }, []);

  const fetchFinanceiro = () => {
    setLoading(true);
    const orcamentos = storageService.load("budgets") || [];
    const materiais = storageService.load("materials") || [];
    
    // Filter concluded budgets for income
    const concludedBudgets = orcamentos.filter((b: any) => b.status === 'concluido' || b.status === 'aprovado');
    const totalEntrada = concludedBudgets.reduce((acc: number, curr: any) => acc + curr.valor_total, 0) || 0;
    
    // For now, salidas are just a placeholder or we can fetch materials
    const totalSaida = materiais.reduce((acc: number, curr: any) => acc + (curr.preco * 5), 0) || 0; // Mocking some expense

    setStats({
      totalEntrada,
      totalSaida,
      saldo: totalEntrada - totalSaida
    });

    setTransacoes(concludedBudgets || []);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Financeiro</h2>
        <p className="text-zinc-400">Controle suas entradas e saídas localmente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <TrendingUp size={24} />
            </div>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
              <ArrowUpRight size={14} /> Entradas
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Total Recebido</p>
          <p className="text-3xl font-bold text-white">R$ {stats.totalEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <TrendingDown size={24} />
            </div>
            <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-md flex items-center gap-1">
              <ArrowDownRight size={14} /> Saídas
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Total em Materiais (Est.)</p>
          <p className="text-3xl font-bold text-white">R$ {stats.totalSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-zinc-900 border border-red-500/30 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-red-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-xl text-white">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Saldo Líquido</p>
          <p className="text-3xl font-bold text-white">R$ {stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Últimas Entradas (Aprovados/Concluídos)</h3>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {transacoes.map((t, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.client_name || 'Cliente'}</p>
                    <p className="text-zinc-500 text-xs flex items-center gap-1">
                      <Calendar size={12} /> {format(new Date(t.data), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 font-bold">+ R$ {t.valor_total.toFixed(2)}</p>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{t.status}</p>
                </div>
              </div>
            ))}
            {transacoes.length === 0 && (
              <div className="p-10 text-center text-zinc-500">Nenhuma transação registrada.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Financeiro;
