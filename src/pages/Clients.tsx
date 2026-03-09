import React, { useState, useEffect } from "react";
import { Cliente } from "../types";
import { storageService } from "../services/storage";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Loader2,
  Users,
  X,
} from "lucide-react";

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [newClient, setNewClient] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    setLoading(true);
    const data = storageService.load("clients") || [];
    setClients(data);
    setLoading(false);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedClients;
    if (editingClient) {
      updatedClients = clients.map((c) =>
        c.id === editingClient.id ? { ...newClient, id: c.id } : c
      );
    } else {
      updatedClients = [
        ...clients,
        { ...newClient, id: Date.now() },
      ];
    }
    storageService.save("clients", updatedClients);
    setIsModalOpen(false);
    setEditingClient(null);
    setNewClient({ nome: "", email: "", telefone: "", endereco: "" });
    fetchClients();
  };

  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    const updatedClients = clients.filter((c) => c.id !== clientToDelete);
    storageService.save("clients", updatedClients);
    setClientToDelete(null);
    fetchClients();
  };

  const openEditModal = (client: Cliente) => {
    setEditingClient(client);
    setNewClient({
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      endereco: client.endereco,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setNewClient({ nome: "", email: "", telefone: "", endereco: "" });
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Clientes</h2>
          <p className="text-zinc-400">
            Gerencie sua base de contatos localmente.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-red-500/50 transition-all">
        <Search size={20} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          className="bg-transparent border-none outline-none text-zinc-100 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-zinc-500">Carregando clientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-red-500 font-bold text-xl">
                  {client.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setClientToDelete(client.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">
                {client.nome}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Mail size={16} className="text-zinc-600" />
                  {client.email || "N/A"}
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Phone size={16} className="text-zinc-600" />
                  {client.telefone || "N/A"}
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <MapPin size={16} className="text-zinc-600" />
                  <span className="truncate">{client.endereco || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="col-span-full py-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl">
              <Users size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Excluir Cliente
            </h3>
            <p className="text-zinc-400 mb-8">
              Tem certeza que deseja excluir este cliente? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClient}
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
                {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newClient.nome}
                  onChange={(e) =>
                    setNewClient({ ...newClient, nome: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newClient.telefone}
                    onChange={(e) =>
                      setNewClient({ ...newClient, telefone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newClient.endereco}
                  onChange={(e) =>
                    setNewClient({ ...newClient, endereco: e.target.value })
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
