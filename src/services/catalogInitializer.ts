import { storageService } from './storage';
import { Material, Servico, PacoteServico } from '../types';

export const initializeElectricalCatalog = () => {
    const existing = storageService.load('materials');
    if (existing && existing.length > 0) return;

    const catalog: Material[] = [
        // Conductors
        { id: 101, nome: "Fio Rígido 1.5mm", preco: 1.20, unidade: "m" },
        { id: 102, nome: "Fio Rígido 2.5mm", preco: 1.80, unidade: "m" },
        { id: 103, nome: "Cabo Flexível 2.5mm", preco: 2.10, unidade: "m" },
        { id: 104, nome: "Cabo Flexível 4.0mm", preco: 3.50, unidade: "m" },
        // Protection
        { id: 105, nome: "Disjuntor Monopolar 16A", preco: 15.00, unidade: "un" },
        { id: 106, nome: "Disjuntor Monopolar 20A", preco: 15.00, unidade: "un" },
        { id: 107, nome: "Disjuntor Bipolar 32A", preco: 35.00, unidade: "un" },
        { id: 108, nome: "DR (Dispositivo Residual)", preco: 85.00, unidade: "un" },
        // Conduits
        { id: 109, nome: "Eletroduto Corrugado 3/4\"", preco: 2.00, unidade: "m" },
        { id: 110, nome: "Eletroduto Corrugado 1\"", preco: 3.00, unidade: "m" },
        // Accessories
        { id: 111, nome: "Tomada 10A", preco: 8.00, unidade: "un" },
        { id: 112, nome: "Tomada 20A", preco: 10.00, unidade: "un" },
        { id: 113, nome: "Interruptor Simples", preco: 7.00, unidade: "un" },
        { id: 114, nome: "Interruptor Paralelo", preco: 12.00, unidade: "un" },
        { id: 115, nome: "Caixa de Passagem 4x2", preco: 4.00, unidade: "un" },
    ];
    storageService.save('materials', catalog);
};

export const initializeElectricalServices = () => {
    const existing = storageService.load('services');
    if (existing && existing.length > 0) return;

    const services: Servico[] = [
        { id: 1, numero: 1, nome: "Instalação de tomada simples", categoria: "Instalações Elétricas", preco: 60, unidade: "un" },
        { id: 2, numero: 2, nome: "Instalação de tomada dupla", categoria: "Instalações Elétricas", preco: 80, unidade: "un" },
        { id: 3, numero: 3, nome: "Instalação de interruptor simples", categoria: "Instalações Elétricas", preco: 60, unidade: "un" },
        { id: 4, numero: 4, nome: "Instalação de interruptor paralelo", categoria: "Instalações Elétricas", preco: 90, unidade: "un" },
        { id: 5, numero: 5, nome: "Instalação de ponto elétrico novo", categoria: "Instalações Elétricas", preco: 120, unidade: "un" },
        { id: 6, numero: 6, nome: "Instalação de luminária", categoria: "Instalações Elétricas", preco: 80, unidade: "un" },
        { id: 7, numero: 7, nome: "Instalação de plafon", categoria: "Instalações Elétricas", preco: 70, unidade: "un" },
        { id: 8, numero: 8, nome: "Instalação de lustre", categoria: "Instalações Elétricas", preco: 150, unidade: "un" },
        { id: 9, numero: 9, nome: "Troca de tomada", categoria: "Manutenção Elétrica", preco: 50, unidade: "un" },
        { id: 10, numero: 10, nome: "Troca de interruptor", categoria: "Manutenção Elétrica", preco: 50, unidade: "un" },
        { id: 11, numero: 11, nome: "Troca de disjuntor", categoria: "Manutenção Elétrica", preco: 80, unidade: "un" },
        { id: 12, numero: 12, nome: "Reparo em curto circuito", categoria: "Manutenção Elétrica", preco: 150, unidade: "un" },
        { id: 13, numero: 13, nome: "Revisão elétrica residencial", categoria: "Manutenção Elétrica", preco: 250, unidade: "un" },
        { id: 14, numero: 14, nome: "Instalação de disjuntor", categoria: "Quadro de Disjuntores", preco: 80, unidade: "un" },
        { id: 15, numero: 15, nome: "Instalação de quadro de distribuição", categoria: "Quadro de Disjuntores", preco: 350, unidade: "un" },
        { id: 16, numero: 16, nome: "Organização de quadro elétrico", categoria: "Quadro de Disjuntores", preco: 200, unidade: "un" },
        { id: 17, numero: 17, nome: "Substituição de quadro elétrico", categoria: "Quadro de Disjuntores", preco: 450, unidade: "un" },
        { id: 18, numero: 18, nome: "Instalação de chuveiro elétrico", categoria: "Instalações Especiais", preco: 120, unidade: "un" },
        { id: 19, numero: 19, nome: "Instalação de ventilador de teto", categoria: "Instalações Especiais", preco: 180, unidade: "un" },
        { id: 20, numero: 20, nome: "Instalação de torneira elétrica", categoria: "Instalações Especiais", preco: 100, unidade: "un" },
        { id: 21, numero: 21, nome: "Instalação de campainha", categoria: "Instalações Especiais", preco: 90, unidade: "un" },
        { id: 22, numero: 22, nome: "Instalação de sensor de presença", categoria: "Instalações Especiais", preco: 120, unidade: "un" },
        { id: 23, numero: 23, nome: "Identificação de circuito", categoria: "Serviços Técnicos", preco: 120, unidade: "un" },
        { id: 24, numero: 24, nome: "Balanceamento de carga", categoria: "Serviços Técnicos", preco: 180, unidade: "un" },
        { id: 25, numero: 25, nome: "Medição de tensão elétrica", categoria: "Serviços Técnicos", preco: 80, unidade: "un" },
        { id: 26, numero: 26, nome: "Diagnóstico elétrico completo", categoria: "Serviços Técnicos", preco: 200, unidade: "un" },
    ];
    storageService.save('services', services);
};

export const initializeServicePackages = () => {
    const existing = storageService.load('service_packages');
    if (existing && existing.length > 0) return;

    const packages: PacoteServico[] = [
        { id: 1, numero: 1, nome_pacote: "Instalação Básica Residencial", descricao: "Pacote de instalação elétrica básica", preco: 250, servicos_incluidos: ["Instalação de 2 tomadas simples", "Instalação de 1 interruptor", "Instalação de 1 luminária", "Teste de funcionamento"] },
        { id: 2, numero: 2, nome_pacote: "Iluminação Completa", descricao: "Pacote para iluminação completa", preco: 320, servicos_incluidos: ["Instalação de 3 luminárias", "Instalação de 2 interruptores", "Verificação de circuito", "Teste final de iluminação"] },
        { id: 3, numero: 3, nome_pacote: "Revisão Elétrica Residencial", descricao: "Pacote de revisão elétrica completa", preco: 350, servicos_incluidos: ["Revisão de tomadas", "Revisão de interruptores", "Verificação de disjuntores", "Teste de tensão elétrica", "Diagnóstico de segurança"] },
        { id: 4, numero: 4, nome_pacote: "Instalação de Equipamentos", descricao: "Pacote para instalação de equipamentos", preco: 300, servicos_incluidos: ["Instalação de chuveiro elétrico", "Instalação de torneira elétrica", "Teste de carga elétrica", "Verificação de disjuntor"] },
        { id: 5, numero: 5, nome_pacote: "Quadro Elétrico", descricao: "Pacote para quadro elétrico", preco: 480, servicos_incluidos: ["Organização de quadro de disjuntores", "Instalação de até 3 disjuntores", "Identificação de circuitos", "Teste de funcionamento"] },
        { id: 6, numero: 6, nome_pacote: "Manutenção Elétrica", descricao: "Pacote de manutenção elétrica", preco: 280, servicos_incluidos: ["Troca de 2 tomadas", "Troca de 2 interruptores", "Reparo simples em fiação", "Teste de circuito"] },
    ];
    storageService.save('service_packages', packages);
};
