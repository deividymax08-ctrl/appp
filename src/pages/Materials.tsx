import React, { useState, useEffect } from "react";
import { Material } from "../types";
import { Plus, Search, Package, Loader2, Trash2, Edit2, X } from "lucide-react";

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    nome: "",
    preco: 0,
    unidade: "un",
  });

  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/materials");
      const data = await response.json();
      setMaterials(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMaterial
        ? `/api/materials/${editingMaterial.id}`
        : "/api/materials";
      const method = editingMaterial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaterial),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingMaterial(null);
        setNewMaterial({ nome: "", preco: 0, unidade: "un" });
        fetchMaterials();
      } else {
        console.error("Erro ao salvar material localmente.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return;

    try {
      const response = await fetch(`/api/materials/${materialToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMaterials();
      } else {
        console.error("Erro ao excluir material.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMaterialToDelete(null);
    }
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setNewMaterial({
      nome: material.nome,
      preco: material.preco,
      unidade: material.unidade,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setNewMaterial({ nome: "", preco: 0, unidade: "un" });
    setIsModalOpen(true);
  };

  const filteredMaterials = materials.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Materiais</h2>
          <p className="text-zinc-400">
            Controle seu estoque e preços localmente.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Material
        </button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-red-500/50 transition-all">
        <Search size={20} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          className="bg-transparent border-none outline-none text-zinc-100 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-red-500 animate-spin" />
          <p className="text-zinc-500">Carregando materiais...</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-sm font-medium">
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMaterials.map((material) => (
                <tr
                  key={material.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-red-500 transition-colors">
                        <Package size={18} />
                      </div>
                      <span className="font-medium text-white">
                        {material.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {material.unidade}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    R$ {material.preco.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(material)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setMaterialToDelete(material.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMaterials.length === 0 && (
            <div className="py-20 text-center">
              <Package size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500">Nenhum material encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {materialToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Excluir Material
            </h3>
            <p className="text-zinc-400 mb-8">
              Tem certeza que deseja excluir este material? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMaterialToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteMaterial}
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
                {editingMaterial
                  ? "Editar Material"
                  : "Cadastrar Novo Material"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome do Material
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  value={newMaterial.nome}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, nome: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Unidade (un, m, kg)
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newMaterial.unidade}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        unidade: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Preço
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    value={newMaterial.preco}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        preco: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
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
                  Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
