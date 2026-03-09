import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Estimativa, Cliente, ItemEstimativa } from "../types";
import { format, addDays } from "date-fns";

export const generateMaterialListPDF = (
  orcamento: Estimativa, 
  cliente: Cliente, 
  items: ItemEstimativa[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- HEADER ---
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Hidra", 15, 25);
  doc.setTextColor(239, 68, 68); // Red-500
  doc.text("Elétrica", 41, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.text("Soluções Profissionais em Elétrica e Hidráulica", 15, 33);
  doc.text("CNPJ: 00.000.000/0001-00 | (11) 99999-9999", 15, 38);

  // Budget Info (Top Right)
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`PEDIDO DE MATERIAIS #${String(orcamento.id).padStart(4, '0')}`, pageWidth - 15, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 15, 32, { align: 'right' });

  // --- CLIENT SECTION ---
  let currentY = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DA OBRA / CLIENTE", 15, currentY);
  
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 2, 80, currentY + 2);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${cliente.nome || ''}`, 15, currentY);
  doc.text(`Telefone: ${cliente.telefone || 'N/A'}`, pageWidth / 2, currentY);
  
  currentY += 6;
  const enderecoText = `Endereço de Entrega: ${cliente.endereco || 'N/A'}`;
  const splitEndereco = doc.splitTextToSize(enderecoText, pageWidth - 30);
  doc.text(splitEndereco, 15, currentY);
  currentY += (splitEndereco.length * 5) - 5;

  // --- ITEMS TABLE ---
  currentY += 15;
  const materiais = items.filter(i => i.tipo === 'material');

  if (materiais.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("LISTA DE MATERIAIS", 15, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Item / Descrição', 'Quantidade']],
      body: materiais.map(m => [
        m.descricao,
        m.quantidade
      ]),
      theme: 'striped',
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', cellWidth: 40 }
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        halign: 'center'
      },
      styles: {
        fontSize: 11,
        cellPadding: 4
      },
      margin: { left: 15, right: 15 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.text("Nenhum material listado para este orçamento.", 15, currentY + 10);
    currentY += 20;
  }

  // --- OBSERVATIONS & SIGNATURE ---
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  currentY += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVAÇÕES PARA ENTREGA", 15, currentY);
  
  doc.setFont("helvetica", "normal");
  currentY += 6;
  doc.text("• Conferir os materiais no ato da entrega.", 15, currentY);
  currentY += 5;
  doc.text("• Materiais sujeitos à aprovação do responsável pela obra.", 15, currentY);

  // Signature Lines
  currentY += 30;
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  
  doc.line(20, currentY, 90, currentY);
  doc.line(pageWidth - 90, currentY, pageWidth - 20, currentY);
  
  currentY += 5;
  doc.setFontSize(8);
  doc.text("Assinatura do Recebedor", 55, currentY, { align: 'center' });
  doc.text("Assinatura do Fornecedor", pageWidth - 55, currentY, { align: 'center' });

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = "HidraElétrica - Pedido de Materiais";
  doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

  doc.save(`pedido_materiais_${String(orcamento.id).padStart(4, '0')}.pdf`);
};

export const generateBudgetPDF = (
  orcamento: Estimativa, 
  cliente: Cliente, 
  items: ItemEstimativa[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- HEADER ---
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Hidra", 15, 25);
  doc.setTextColor(239, 68, 68); // Red-500
  doc.text("Elétrica", 41, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.text("Soluções Profissionais em Elétrica e Hidráulica", 15, 33);
  doc.text("CNPJ: 00.000.000/0001-00 | (11) 99999-9999", 15, 38);

  // Budget Info (Top Right)
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`ORÇAMENTO #${String(orcamento.id).padStart(4, '0')}`, pageWidth - 15, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Emissão: ${format(new Date(orcamento.data), 'dd/MM/yyyy')}`, pageWidth - 15, 32, { align: 'right' });
  doc.text(`Validade: ${format(addDays(new Date(orcamento.data), 15), 'dd/MM/yyyy')}`, pageWidth - 15, 38, { align: 'right' });

  // --- CLIENT SECTION ---
  let currentY = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 15, currentY);
  
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 2, 60, currentY + 2);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${cliente.nome || ''}`, 15, currentY);
  doc.text(`Email: ${cliente.email || 'N/A'}`, pageWidth / 2, currentY);
  
  currentY += 6;
  doc.text(`Telefone: ${cliente.telefone || 'N/A'}`, 15, currentY);
  
  currentY += 6;
  const enderecoText = `Endereço: ${cliente.endereco || 'N/A'}`;
  const splitEndereco = doc.splitTextToSize(enderecoText, pageWidth - 30);
  doc.text(splitEndereco, 15, currentY);
  currentY += (splitEndereco.length * 5) - 5;

  // --- ITEMS TABLE ---
  currentY += 15;
  const materiais = items.filter(i => i.tipo === 'material');
  const servicos = items.filter(i => i.tipo === 'servico');

  if (materiais.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("MATERIAIS", 15, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Item', 'Qtd', 'Preço Unit.', 'Subtotal']],
      body: materiais.map(m => [
        m.descricao,
        m.quantidade,
        `R$ ${m.preco_unitario.toFixed(2)}`,
        `R$ ${m.total.toFixed(2)}`
      ]),
      theme: 'striped',
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        halign: 'center' // This will be overridden by columnStyles for body, but let's just use styles
      },
      styles: {
        fontSize: 10,
      },
      margin: { left: 15, right: 15 }
    });
    // Fix header alignment manually by using didParseCell if needed, but columnStyles usually applies to body.
    // Actually, jspdf-autotable columnStyles applies to body. 
    // Let's just set the headStyles and columnStyles properly.
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  if (servicos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("MÃO DE OBRA / SERVIÇOS", 15, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Serviço', 'Qtd', 'Preço Unit.', 'Subtotal']],
      body: servicos.map(s => [
        s.descricao,
        s.quantidade,
        `R$ ${s.preco_unitario.toFixed(2)}`,
        `R$ ${s.total.toFixed(2)}`
      ]),
      theme: 'striped',
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      },
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        halign: 'center'
      },
      styles: {
        fontSize: 10,
      },
      margin: { left: 15, right: 15 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- SUMMARY & TOTALS ---
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  const summaryWidth = 90;
  const summaryX = pageWidth - 15 - summaryWidth;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  currentY += 10;
  doc.setFillColor(239, 68, 68);
  doc.rect(summaryX, currentY - 6, summaryWidth, 12, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL FINAL:", summaryX + 5, currentY + 2);
  doc.text(`R$ ${orcamento.valor_total.toFixed(2)}`, pageWidth - 20, currentY + 2, { align: 'right' });

  // --- OBSERVATIONS & SIGNATURE ---
  currentY += 25;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVAÇÕES E CONDIÇÕES", 15, currentY);
  
  doc.setFont("helvetica", "normal");
  currentY += 6;
  const obs = orcamento.descricao || "Sem observações adicionais.";
  const splitObs = doc.splitTextToSize(obs, pageWidth - 30);
  doc.text(splitObs, 15, currentY);
  
  currentY += (splitObs.length * 5) + 10;
  doc.text("• Forma de Pagamento: A combinar (PIX, Cartão ou Dinheiro)", 15, currentY);
  currentY += 5;
  doc.text("• Garantia de 90 dias para mão de obra realizada.", 15, currentY);

  // Signature Lines
  currentY += 30;
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  
  doc.line(20, currentY, 90, currentY);
  doc.line(pageWidth - 90, currentY, pageWidth - 20, currentY);
  
  currentY += 5;
  doc.setFontSize(8);
  doc.text("Assinatura do Prestador", 55, currentY, { align: 'center' });
  doc.text("Assinatura do Cliente", pageWidth - 55, currentY, { align: 'center' });

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = "HidraElétrica - Soluções em Instalações Elétricas e Hidráulicas\nEste orçamento tem validade de 15 dias a partir da data de emissão.";
  doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

  doc.save(`orcamento_${String(orcamento.id).padStart(4, '0')}.pdf`);
};
