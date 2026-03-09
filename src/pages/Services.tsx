import React, { useState, useEffect } from "react";
import { Servico } from "../types";
import { storageService } from "../services/storage";
import { initializeElectricalServices } from "../services/catalogInitializer";
import { Plus, Search, Wrench, Loader2, Trash2, Edit2, X } from "lucide-react";

const Services: React.FC = () => {
  const [services, setServices] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Servico | null>(null);
  const [newService, setNewService] = useState({
    numero: 0,
    nome: "",
    categoria: "Instalações Elétricas",
    preco: 0,
    unidade: "un",
    descricao: "",
  });

  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  useEffect(() => {
    initializeElectricalServices();
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    const data = storageService.load("services") || [];
    setServices(data);
    setLoading(false);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedServices;
    if (editingService) {
      updatedServices = services.map((s) =>
        s.id === editingService.id ? { ...newService, id: s.id } : s
      );
    } else {
      updatedServices = [
        ...services,
        { ...newService, id: Date.now() },
      ];
    }
    storageService.save("services", updatedServices);
    setIsModalOpen(false);
    setEditingService(null);
    setNewService({ numero: 0, nome: "", categoria: "Instalações Elétricas", preco: 0, unidade: "un", descricao: "" });
    fetchServices();
  };

  const handleDeleteService = () => {
    if (!serviceToDelete) return;
    const updatedServices = services.filter((s) => s.id !== serviceToDelete);
    storageService.save("services", updatedServices);
    setServiceToDelete(null);
    fetchServices();
  };

  const openEditModal = (service: Servico) => {
    setEditingService(service);
    setNewService({
      numero: service.numero,
      nome: service.nome,
      categoria: service.categoria,
      preco: service.preco,
      unidade: service.unidade,
      descricao: service.descricao || "",
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setNewService({ numero: services.length + 1, nome: "", categoria: "Instalações Elétricas", preco: 0, unidade: "un", descricao: "" });
    setIsModalOpen(true);
  };

  const filteredServices = services.filter(
    (s) =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.descricao &&
        s.descricao.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Serviços</h2>
          <p className="text-zinc-400">
            Gerencie seu catálogo de mão de obra localmente.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-red-500/50 transition-all">
        <Search size={20} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou descrição..."
          className="bg-transparent border-none outline-none text-zinc-100 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-zinc-500">Carregando serviços...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <Wrench size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setServiceToDelete(service.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{service.nome}</h3>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{service.categoria}</span>
                </div>
                <p className="text-zinc-500 text-sm line-clamp-2">
                  {service.descricao}
                </p>
                <p className="text-zinc-500 text-xs">Unidade: {service.unidade}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                <div className="text-2xl font-bold text-white">
                  <span className="text-red-500 text-sm font-medium mr-1">
                    R$
                  </span>
                  {service.preco.toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="col-span-full py-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl">
              <Wrench size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">Nenhum serviço encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Excluir Serviço
            </h3>
            <p className="text-zinc-400 mb-8">
              Tem certeza que deseja excluir este serviço? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setServiceToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteService}
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
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Número
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newService.numero}
                    onChange={(e) =>
                      setNewService({ ...newService, numero: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Unidade
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newService.unidade}
                    onChange={(e) =>
                      setNewService({ ...newService, unidade: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome do Serviço
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newService.nome}
                  onChange={(e) =>
                    setNewService({ ...newService, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Categoria
                </label>
                <select
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newService.categoria}
                  onChange={(e) =>
                    setNewService({ ...newService, categoria: e.target.value })
                  }
                >
                  <option value="Instalações Elétricas">Instalações Elétricas</option>
                  <option value="Manutenção Elétrica">Manutenção Elétrica</option>
                  <option value="Quadro de Disjuntores">Quadro de Disjuntores</option>
                  <option value="Instalações Especiais">Instalações Especiais</option>
                  <option value="Serviços Técnicos">Serviços Técnicos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all h-24 resize-none"
                  value={newService.descricao}
                  onChange={(e) =>
                    setNewService({ ...newService, descricao: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Preço Sugerido (R$)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newService.preco}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      preco: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
