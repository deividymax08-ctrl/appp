import React, { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Database,
  Save,
  Camera,
  CheckCircle2,
} from "lucide-react";

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("perfil");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Configurações</h2>
          <p className="text-zinc-400">
            Personalize sua experiência e gerencie sua conta.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={20} />
            <span className="font-medium">
              Configurações salvas com sucesso!
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Settings */}
        <div className="w-full lg:w-64 space-y-1">
          <SettingsNavItem
            active={activeSection === "perfil"}
            onClick={() => setActiveSection("perfil")}
            icon={<User size={18} />}
            label="Meu Perfil"
          />
          <SettingsNavItem
            active={activeSection === "empresa"}
            onClick={() => setActiveSection("empresa")}
            icon={<Building2 size={18} />}
            label="Dados da Empresa"
          />
          <SettingsNavItem
            active={activeSection === "notificacoes"}
            onClick={() => setActiveSection("notificacoes")}
            icon={<Bell size={18} />}
            label="Notificações"
          />
          <SettingsNavItem
            active={activeSection === "seguranca"}
            onClick={() => setActiveSection("seguranca")}
            icon={<Shield size={18} />}
            label="Segurança"
          />
          <SettingsNavItem
            active={activeSection === "dados"}
            onClick={() => setActiveSection("dados")}
            icon={<Database size={18} />}
            label="Backup e Dados"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          {activeSection === "perfil" && (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 border-2 border-zinc-700">
                    <User size={40} />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Foto de Perfil
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    JPG, GIF ou PNG. Tamanho máximo de 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="Deividy Max"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Email Profissional
                  </label>
                  <input
                    type="email"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="deividymax08@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Telefone
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="Eletricista Residencial e Industrial"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                >
                  <Save size={20} />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeSection === "empresa" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="HidraElétrica Soluções"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    CNPJ / CPF
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="00.000.000/0001-00"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Endereço Comercial
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                    defaultValue="Rua das Elétricas, 123 - São Paulo, SP"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                >
                  <Save size={20} />
                  Salvar Dados da Empresa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingsNavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SettingsNavItem: React.FC<SettingsNavItemProps> = ({
  active,
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Settings;
