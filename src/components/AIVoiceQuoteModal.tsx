import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Mic, Square, Loader2, X, AlertCircle } from 'lucide-react';
import { Cliente, Material, Servico } from '../types';

interface AIVoiceQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Cliente[];
  materials: Material[];
  services: Servico[];
}

const AIVoiceQuoteModal: React.FC<AIVoiceQuoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
  materials,
  services,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusText('Gravando... Fale os detalhes do orçamento.');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusText('Processando áudio e gerando orçamento...');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];

          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            throw new Error('Chave da API do Gemini não configurada.');
          }

          const ai = new GoogleGenAI({ apiKey });

          const prompt = `
            Você é um assistente de orçamentos para um aplicativo de gestão de obras (serviços elétricos e hidráulicos).
            O aplicativo permite controle total da obra: criar/excluir pastas (obras), adicionar/excluir materiais, criar orçamentos e configurações.
            Ouça o áudio fornecido e extraia os detalhes para criar um orçamento.
            
            Aqui estão os dados existentes no sistema:
            Clientes: ${JSON.stringify(clients.map(c => ({ id: c.id, nome: c.nome })))}
            Materiais: ${JSON.stringify(materials.map(m => ({ id: m.id, nome: m.nome, preco: m.preco, unidade: m.unidade })))}
            Serviços: ${JSON.stringify(services.map(s => ({ id: s.id, nome: s.nome, preco: s.preco })))}

            Sua tarefa:
            1. Transcreva o áudio.
            2. Identifique o cliente mencionado (se houver). Se não houver, omita o campo cliente_id.
            3. Identifique os materiais e serviços mencionados, com suas quantidades.
            4. Se um material ou serviço mencionado JÁ EXISTIR na lista acima, use o ID e o preço existente.
            5. Se um material ou serviço NÃO EXISTIR, você DEVE usar a ferramenta googleSearch para pesquisar o preço médio de mercado de mão de obra e materiais ESPECIFICAMENTE em Porto Alegre e Região Metropolitana (em Reais - BRL) e marcá-lo como "is_new: true". Omita o campo id.
            6. Retorne um JSON estritamente no formato solicitado.
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/webm',
                    data: base64Audio,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  transcription: { type: Type.STRING, description: "Transcrição do áudio" },
                  cliente_id: { type: Type.INTEGER, description: "ID do cliente existente (omitir se não mencionado)" },
                  descricao: { type: Type.STRING, description: "Descrição geral do orçamento" },
                  materiais: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.INTEGER, description: "ID do material existente (omitir se for novo)" },
                        nome: { type: Type.STRING, description: "Nome do material" },
                        quantidade: { type: Type.NUMBER, description: "Quantidade solicitada" },
                        preco_unitario: { type: Type.NUMBER, description: "Preço unitário (pesquisado se for novo)" },
                        unidade: { type: Type.STRING, description: "Unidade (ex: un, m, kg)" },
                        is_new: { type: Type.BOOLEAN, description: "True se for um material novo que precisa ser cadastrado" }
                      }
                    }
                  },
                  servicos: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.INTEGER, description: "ID do serviço existente (omitir se for novo)" },
                        nome: { type: Type.STRING, description: "Nome do serviço" },
                        quantidade: { type: Type.NUMBER, description: "Quantidade (geralmente 1)" },
                        preco_unitario: { type: Type.NUMBER, description: "Preço unitário (pesquisado se for novo)" },
                        descricao: { type: Type.STRING, description: "Descrição do serviço" },
                        is_new: { type: Type.BOOLEAN, description: "True se for um serviço novo que precisa ser cadastrado" }
                      }
                    }
                  }
                }
              }
            }
          });

          const resultText = response.text;
          if (!resultText) {
            throw new Error('Resposta vazia da IA.');
          }

          const result = JSON.parse(resultText);
          await createQuoteFromAIResult(result);
        } catch (err: any) {
          console.error('Error processing audio:', err);
          setError(err.message || 'Erro ao processar o áudio com a IA.');
          setIsProcessing(false);
        }
      };
    } catch (err: any) {
      console.error('Error reading audio blob:', err);
      setError('Erro ao ler o áudio gravado.');
      setIsProcessing(false);
    }
  };

  const createQuoteFromAIResult = async (result: any) => {
    try {
      setStatusText('Criando novos itens e orçamento...');
      
      const materialMap = new Map<number | string, number>();
      for (const mat of result.materiais || []) {
        if (mat.is_new) {
          const res = await fetch('/api/materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: mat.nome,
              preco: mat.preco_unitario || 0,
              unidade: mat.unidade || 'un'
            })
          });
          const newMat = await res.json();
          materialMap.set(mat.nome, newMat.id);
        } else {
          materialMap.set(mat.id, mat.id);
        }
      }

      const serviceMap = new Map<number | string, number>();
      for (const serv of result.servicos || []) {
        if (serv.is_new) {
          const res = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: serv.nome,
              preco: serv.preco_unitario || 0,
              descricao: serv.descricao || serv.nome
            })
          });
          const newServ = await res.json();
          serviceMap.set(serv.nome, newServ.id);
        } else {
          serviceMap.set(serv.id, serv.id);
        }
      }

      let clienteId = result.cliente_id;
      if (!clienteId && clients.length > 0) {
        clienteId = clients[0].id;
      } else if (!clienteId) {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'Cliente Avulso (IA)',
            email: 'cliente@exemplo.com',
            telefone: '000000000',
            endereco: 'Endereço não informado'
          })
        });
        const newClient = await res.json();
        clienteId = newClient.id;
      }

      let total = 0;
      const items = [];

      for (const mat of result.materiais || []) {
        const id = mat.is_new ? materialMap.get(mat.nome) : mat.id;
        const itemTotal = mat.quantidade * (mat.preco_unitario || 0);
        total += itemTotal;
        items.push({
          tipo: 'material',
          item_id: id,
          descricao: mat.nome,
          quantidade: mat.quantidade,
          preco_unitario: mat.preco_unitario || 0,
          total: itemTotal
        });
      }

      for (const serv of result.servicos || []) {
        const id = serv.is_new ? serviceMap.get(serv.nome) : serv.id;
        const itemTotal = serv.quantidade * (serv.preco_unitario || 0);
        total += itemTotal;
        items.push({
          tipo: 'servico',
          item_id: id,
          descricao: serv.nome,
          quantidade: serv.quantidade,
          preco_unitario: serv.preco_unitario || 0,
          total: itemTotal
        });
      }

      const budgetRes = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          data: new Date().toISOString(),
          valor_total: total,
          status: 'pendente',
          descricao: result.descricao || result.transcription || 'Orçamento gerado por IA',
          items: items
        })
      });

      if (!budgetRes.ok) throw new Error('Erro ao criar orçamento');

      setStatusText('Orçamento criado com sucesso!');
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error creating quote:', err);
      setError(err.message || 'Erro ao salvar o orçamento no banco de dados.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="text-red-500" />
            Orçamento por Voz (IA)
          </h2>
          {!isRecording && !isProcessing && (
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {!isRecording && !isProcessing && (
            <button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
            >
              <Mic size={40} />
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse transition-all hover:scale-105"
            >
              <Square size={32} fill="currentColor" />
            </button>
          )}

          {isProcessing && (
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-red-500">
              <Loader2 size={40} className="animate-spin" />
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-white">
              {!isRecording && !isProcessing && 'Clique para falar'}
              {isRecording && 'Gravando...'}
              {isProcessing && 'Processando com IA...'}
            </p>
            <p className="text-sm text-zinc-400 max-w-[250px] mx-auto">
              {statusText || 'Descreva os materiais e serviços que deseja incluir no orçamento.'}
            </p>
          </div>

          {error && (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIVoiceQuoteModal;
