import React, { useState, useRef, useEffect } from "react";
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
import { storageService } from "../services/storage";

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("perfil");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = storageService.load("profile_image");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleSave = () => {
    if (profileImage) {
      storageService.save("profile_image", profileImage);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
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
                  <div 
                    onClick={handleImageClick}
                    className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 border-2 border-zinc-700 overflow-hidden cursor-pointer hover:border-red-500 transition-all"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <button 
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
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

          {activeSection === "notificacoes" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Notificações</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-zinc-300">
                  <input type="checkbox" className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500" defaultChecked />
                  Notificações por Email
                </label>
                <label className="flex items-center gap-3 text-zinc-300">
                  <input type="checkbox" className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500" defaultChecked />
                  Notificações Push
                </label>
                <label className="flex items-center gap-3 text-zinc-300">
                  <input type="checkbox" className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500" />
                  Alertas de Orçamento
                </label>
              </div>
              <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20">
                <Save size={20} /> Salvar Notificações
              </button>
            </div>
          )}

          {activeSection === "seguranca" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Segurança</h3>
              <div className="space-y-4">
                <button className="w-full text-left bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl transition-all">
                  Alterar Senha
                </button>
                <button className="w-full text-left bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl transition-all">
                  Autenticação de Dois Fatores
                </button>
              </div>
            </div>
          )}

          {activeSection === "dados" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Backup e Dados</h3>
              <p className="text-zinc-400 text-sm">
                Gerencie seus dados locais e faça backups de segurança.
              </p>
              <div className="flex gap-4">
                <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all">
                  <Database size={20} /> Exportar Backup
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all">
                  <Database size={20} /> Importar Backup
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
