/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Materials from './pages/Materials';
import Services from './pages/Services';
import Budgets from './pages/Budgets';
import Historico from './pages/Historico';
import Financeiro from './pages/Financeiro';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <Clients />;
      case 'materiais':
        return <Materials />;
      case 'servicos':
        return <Services />;
      case 'orcamentos':
        return <Budgets />;
      case 'historico':
        return <Historico />;
      case 'financeiro':
        return <Financeiro />;
      case 'configuracoes':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
