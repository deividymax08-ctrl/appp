import React, { useState, useEffect } from 'react';
import { Estimativa, Cliente } from '../types';
import { 
  History, 
  Search, 
  Download, 
  Eye,
  Loader2,
  Calendar,
  X,
  CheckCircle,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { generateBudgetPDF, generateMaterialListPDF } from '../services/pdfGenerator';
import { storageService } from '../services/storage';

const Historico: React.FC = () => {
  const [budgets, setBudgets] = useState<Estimativa[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<Estimativa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    setBudgets(storageService.load("budgets") || []);
    setClients(storageService.load("clients") || []);
    setLoading(false);
  };

  const handleApproveBudget = (id: number) => {
    const updatedBudgets = budgets.map(b => b.id === id ? {...b, status: 'aprovado' as const} : b);
    storageService.save("budgets", updatedBudgets);
    fetchHistory();
  };

  const handleViewBudget = (budget: Estimativa) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = (budget: Estimativa) => {
    const client = clients.find(c => c.id === budget.cliente_id);
    if (client && budget.items) {
      generateBudgetPDF(budget, client, budget.items);
    }
  };

  const handleDownloadMaterialList = (budget: Estimativa) => {
    const client = clients.find(c => c.id === budget.cliente_id);
    if (client && budget.items) {
      generateMaterialListPDF(budget, client, budget.items);
    }
  };

  const filteredBudgets = budgets.filter(b => 
    (b.client_name && b.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    String(b.id).includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white">Histórico</h2>
        <p className="text-zinc-400">Consulte todos os orçamentos e serviços realizados localmente.</p>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-red-500/50 transition-all">
        <Search size={20} className="text-zinc-500" />
        <input 
          type="text" 
          placeholder="Pesquisar por cliente ou ID..." 
          className="bg-transparent border-none outline-none text-zinc-100 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && !isModalOpen ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-zinc-500">Carregando histórico...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBudgets.map((budget) => (
            <div key={budget.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  budget.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-500' :
                  budget.status === 'reprovado' ? 'bg-red-500/10 text-red-500' :
                  'bg-orange-500/10 text-orange-500'
                }`}>
                  <History size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{budget.client_name || 'Cliente'}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      budget.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-500' :
                      budget.status === 'reprovado' ? 'bg-red-500/10 text-red-500' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {budget.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-500 text-sm">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(budget.data), 'dd/MM/yyyy')}</span>
                    <span className="font-mono text-xs">ID: #{String(budget.id).padStart(4, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8">
                <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Valor Total</p>
                  <p className="text-xl font-bold text-white">R$ {budget.valor_total.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {budget.status === "pendente" && (
                    <button
                      onClick={() => handleApproveBudget(budget.id)}
                      className="p-3 bg-zinc-800 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-500 rounded-xl transition-all"
                      title="Aprovar Orçamento"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownloadMaterialList(budget)}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                    title="Baixar Lista de Materiais"
                  >
                    <ClipboardList size={20} />
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(budget)}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                    title="Baixar Orçamento PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={() => handleViewBudget(budget)}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredBudgets.length === 0 && (
            <div className="py-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl">
              <History size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">Nenhum registro encontrado no histórico.</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {isModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Detalhes do Orçamento</h3>
                <p className="text-zinc-500 text-sm">ID: #{String(selectedBudget.id).padStart(4, '0')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Cliente</label>
                  <p className="text-white font-medium">{selectedBudget.client_name}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Data</label>
                  <p className="text-white font-medium">{format(new Date(selectedBudget.data), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Itens</label>
                <div className="space-y-2">
                  {selectedBudget.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <p className="text-white text-sm font-medium">{item.descricao}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{item.tipo} • {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}</p>
                      </div>
                      <p className="text-white font-bold text-sm">R$ {item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBudget.descricao && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Observações</label>
                  <p className="text-zinc-400 text-sm bg-zinc-800/50 p-4 rounded-xl border border-zinc-800 italic">
                    "{selectedBudget.descricao}"
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Status</label>
                  <p className={`font-bold uppercase tracking-wider ${
                    selectedBudget.status === 'concluido' ? 'text-emerald-500' :
                    selectedBudget.status === 'reprovado' ? 'text-red-500' :
                    'text-orange-500'
                  }`}>
                    {selectedBudget.status}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Total</label>
                  <p className="text-3xl font-bold text-white">R$ {selectedBudget.valor_total.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleDownloadPDF(selectedBudget)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Baixar PDF
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;
