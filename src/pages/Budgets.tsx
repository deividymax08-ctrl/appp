import React, { useState, useEffect } from "react";
import {
  Estimativa,
  Cliente,
  Material,
  Servico,
  ItemEstimativa,
} from "../types";
import { generateBudgetPDF, generateMaterialListPDF } from "../services/pdfGenerator";
import { storageService } from "../services/storage";
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Loader2,
  User,
  Package,
  Wrench,
  X,
  CheckCircle,
  ClipboardList,
  Mic,
} from "lucide-react";
import { format } from "date-fns";
import AIVoiceQuoteModal from "../components/AIVoiceQuoteModal";

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Estimativa[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [services, setServices] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // New Budget State
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [selectedItems, setSelectedItems] = useState<Partial<ItemEstimativa>[]>(
    [],
  );
  const [descricao, setDescricao] = useState("");

  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setBudgets(storageService.load("budgets") || []);
    setClients(storageService.load("clients") || []);
    setMaterials(storageService.load("materials") || []);
    setServices(storageService.load("services") || []);
    setLoading(false);
  };

  const handleAddItem = (type: "material" | "servico", id: number) => {
    if (type === "material") {
      const material = materials.find((m) => m.id === id);
      if (material) {
        setSelectedItems([
          ...selectedItems,
          {
            tipo: "material",
            item_id: material.id,
            descricao: material.nome,
            quantidade: 1,
            preco_unitario: material.preco,
            total: material.preco,
          },
        ]);
      }
    } else {
      const service = services.find((s) => s.id === id);
      if (service) {
        setSelectedItems([
          ...selectedItems,
          {
            tipo: "servico",
            item_id: service.id,
            descricao: service.nome,
            quantidade: 1,
            preco_unitario: service.preco,
            total: service.preco,
          },
        ]);
      }
    }
  };

  const updateItemQuantity = (index: number, qty: number) => {
    const newItems = [...selectedItems];
    const item = newItems[index];
    if (item && item.preco_unitario !== undefined) {
      item.quantidade = qty;
      item.total = qty * item.preco_unitario;
      setSelectedItems(newItems);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.total || 0), 0);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const client = clients.find(c => c.id === selectedClientId);

    const budgetData: Estimativa = {
      id: Date.now(),
      cliente_id: Number(selectedClientId),
      client_name: client?.nome,
      data: new Date().toISOString(),
      status: 'pendente',
      descricao,
      valor_total: calculateTotal(),
      items: selectedItems as ItemEstimativa[],
    };

    const updatedBudgets = [...budgets, budgetData];
    storageService.save("budgets", updatedBudgets);
    setIsModalOpen(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setSelectedClientId("");
    setSelectedItems([]);
    setDescricao("");
  };

  const handleDeleteBudget = () => {
    if (!budgetToDelete) return;
    const updatedBudgets = budgets.filter((b) => b.id !== budgetToDelete);
    storageService.save("budgets", updatedBudgets);
    setBudgetToDelete(null);
    fetchData();
  };

  const handleApproveBudget = (id: number) => {
    const updatedBudgets = budgets.map(b => b.id === id ? {...b, status: 'aprovado' as const} : b);
    storageService.save("budgets", updatedBudgets);
    fetchData();
  };

  const handleDownloadPDF = (budget: Estimativa) => {
    const client = clients.find((c) => c.id === budget.cliente_id);
    if (client && budget.items) {
      generateBudgetPDF(budget, client, budget.items);
    }
  };

  const handleDownloadMaterialList = (budget: Estimativa) => {
    const client = clients.find((c) => c.id === budget.cliente_id);
    if (client && budget.items) {
      generateMaterialListPDF(budget, client, budget.items);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Orçamentos</h2>
          <p className="text-zinc-400">
            Crie e gerencie orçamentos profissionais localmente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 border border-red-500/30 hover:border-red-500/50"
          >
            <Mic size={20} className="text-red-500" />
            Orçamento por Voz (IA)
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            Novo Orçamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-zinc-500">Carregando orçamentos...</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-sm font-medium">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {budgets.map((budget) => (
                <tr
                  key={budget.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                    #{String(budget.id).padStart(4, "0")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">
                      {budget.client_name || "Cliente não encontrado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {format(new Date(budget.data), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    R$ {budget.valor_total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        budget.status === "pendente"
                          ? "bg-orange-500/10 text-orange-500"
                          : budget.status === "aprovado"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {budget.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {budget.status === "pendente" && (
                        <button
                          onClick={() => handleApproveBudget(budget.id)}
                          className="p-2 hover:bg-emerald-500/10 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all"
                          title="Aprovar Orçamento"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadMaterialList(budget)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        title="Baixar Lista de Materiais"
                      >
                        <ClipboardList size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(budget)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        title="Baixar Orçamento PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => setBudgetToDelete(budget.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-zinc-500"
                  >
                    Nenhum orçamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {budgetToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Excluir Orçamento
            </h3>
            <p className="text-zinc-400 mb-8">
              Tem certeza que deseja excluir este orçamento? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBudgetToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBudget}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">
                Novo Orçamento Profissional
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-8">
              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <User size={16} /> Cliente
                  </label>
                  <select
                    required
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    value={selectedClientId}
                    onChange={(e) =>
                      setSelectedClientId(Number(e.target.value))
                    }
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Package size={18} className="text-red-500" /> Materiais
                  </h4>
                  <select
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none"
                    onChange={(e) =>
                      e.target.value &&
                      handleAddItem("material", Number(e.target.value))
                    }
                    value=""
                  >
                    <option value="">Adicionar material...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} - R$ {m.preco.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Wrench size={18} className="text-red-500" /> Serviços
                  </h4>
                  <select
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none"
                    onChange={(e) =>
                      e.target.value &&
                      handleAddItem("servico", Number(e.target.value))
                    }
                    value=""
                  >
                    <option value="">Adicionar serviço...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} - R$ {s.preco.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Items List */}
              <div className="space-y-4">
                <h4 className="font-bold text-white">Itens Selecionados</h4>
                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-800"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${item.tipo === "material" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"}`}
                        >
                          {item.tipo === "material" ? (
                            <Package size={18} />
                          ) : (
                            <Wrench size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {item.descricao}
                          </p>
                          <p className="text-xs text-zinc-500 uppercase">
                            {item.tipo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            Qtd
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-16 bg-zinc-800 border-none text-center rounded-lg text-sm py-1"
                            value={item.quantidade}
                            onChange={(e) =>
                              updateItemQuantity(idx, Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            Preço
                          </label>
                          <span className="text-sm text-zinc-300">
                            R$ {item.preco_unitario?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            Subtotal
                          </label>
                          <span className="text-sm font-bold text-white">
                            R$ {item.total?.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedItems(
                              selectedItems.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedItems.length === 0 && (
                    <div className="text-center py-10 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-800">
                      <p className="text-zinc-500">
                        Nenhum item adicionado ao orçamento.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary and Totals */}
              <div className="bg-zinc-800/30 p-6 rounded-3xl border border-zinc-800 space-y-6">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 block">
                    Observações do Orçamento
                  </label>
                  <textarea
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 h-24 resize-none"
                    placeholder="Ex: Prazo de execução, condições de pagamento, garantia..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="flex flex-col items-end justify-center">
                  <span className="text-zinc-500 text-sm">
                    Valor Total Estimado
                  </span>
                  <span className="text-4xl font-bold text-red-500">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95"
                >
                  Gerar Orçamento Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AIVoiceQuoteModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={fetchData}
        clients={clients}
        materials={materials}
        services={services}
      />
    </div>
  );
};

export default Budgets;
