import React, { useState, useEffect } from "react";
import { Cliente, Veiculo, Peca, Mecanico, OrdemServico, Orcamento, OrcamentoItemPeca, OficinaConfig } from "../types";
import { 
  Plus, 
  Trash2, 
  Coins, 
  Wrench, 
  Check, 
  X, 
  AlertCircle, 
  Calendar, 
  Car, 
  User, 
  PlusCircle, 
  Search, 
  Printer, 
  CheckCheck,
  Clock,
  ArrowRight,
  FileCheck,
  Sparkles,
  Edit,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrcamentosProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  mecanicos: Mecanico[];
  orcamentos: Orcamento[];
  ordens: OrdemServico[];
  onUpdateOrcamentos: (newOrcamentos: Orcamento[]) => void;
  onUpdateOrdens: (newOrdens: OrdemServico[]) => void;
  onUpdatePecas: (newPecas: Peca[]) => void;
  onUpdateClientes: (newClientes: Cliente[]) => void;
  onUpdateVeiculos: (newVeiculos: Veiculo[]) => void;
  focusedOrcamento?: Orcamento | null;
  onClearFocusedOrcamento?: () => void;
  triggerNewOrcamento?: boolean;
  onClearNewOrcamentoTrigger?: () => void;
  onNavigate?: (tab: string, arg?: any) => void;
  config?: OficinaConfig;
}

export default function Orcamentos({
  clientes,
  veiculos,
  pecas,
  mecanicos,
  orcamentos,
  ordens,
  onUpdateOrcamentos,
  onUpdateOrdens,
  onUpdatePecas,
  onUpdateClientes,
  onUpdateVeiculos,
  focusedOrcamento,
  onClearFocusedOrcamento,
  triggerNewOrcamento,
  onClearNewOrcamentoTrigger,
  onNavigate,
  config
}: OrcamentosProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [editingOrcamentoId, setEditingOrcamentoId] = useState<string | null>(null);
  const [isOrcamentoMaximized, setIsOrcamentoMaximized] = useState(false);

  // Trigger form opening when navigated with "new" from dashboard shortcuts
  useEffect(() => {
    if (triggerNewOrcamento) {
      setShowAddForm(true);
      setSelectedOrcamento(null); // clear individual item view
      if (onClearNewOrcamentoTrigger) {
        onClearNewOrcamentoTrigger();
      }
    }
  }, [triggerNewOrcamento, onClearNewOrcamentoTrigger]);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // New Budget Form States
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [mecanicoId, setMecanicoId] = useState("");
  const [kmAtual, setKmAtual] = useState("");
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [servicosOrcados, setServicosOrcados] = useState("");
  const [valorMaoDeObra, setValorMaoDeObra] = useState("0");
  const [validadeDias, setValidadeDias] = useState("10");

  const [clientSearch, setClientSearch] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [partSearchQuery, setPartSearchQuery] = useState("");
  const [showPartSuggestions, setShowPartSuggestions] = useState(false);

  // Quick Part Add States
  const [showQuickPartForm, setShowQuickPartForm] = useState(false);
  const [qpeDescricao, setQpeDescricao] = useState("");
  const [qpeFabricante, setQpeFabricante] = useState("");
  const [qpePrecoVenda, setQpePrecoVenda] = useState("");
  const [qpeSku, setQpeSku] = useState("");
  const [qpeEstoque, setQpeEstoque] = useState("");
  
  // Dynamic Parts in Builder
  const [tempPecas, setTempPecas] = useState<{ pecaId: string; quantidade: number; precoUnitario: number }[]>([]);
  const [pecaIdAdicionar, setPecaIdAdicionar] = useState("");
  const [pecaQtdAdicionar, setPecaQtdAdicionar] = useState("1");

  // Local feedback states
  const [formError, setFormError] = useState("");
  const [conversionSuccessFeed, setConversionSuccessFeed] = useState<string | null>(null);

  const updateTempPeca = (idx: number, field: "quantidade" | "precoUnitario", value: number) => {
    const updated = [...tempPecas];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setTempPecas(updated);
  };

  // Selection state for execution approval in detail modal/panel
  const [checkedPecas, setCheckedPecas] = useState<Record<string, boolean>>({});
  const [checkedMaoDeObra, setCheckedMaoDeObra] = useState(false);

  // Form helpers
  const clearForm = () => {
    setClienteId("");
    setVeiculoId("");
    setMecanicoId("");
    setKmAtual("");
    setDescricaoProblema("");
    setServicosOrcados("");
    setValorMaoDeObra("0");
    setValidadeDias("10");
    setTempPecas([]);
    setClientSearch("");
    setPartSearchQuery("");
    setPecaIdAdicionar("");
    setEditingOrcamentoId(null);
    setFormError("");
  };

  const handleStartEditOrcamento = (orc: Orcamento) => {
    setEditingOrcamentoId(orc.id);
    setClienteId(orc.clienteId);
    setVeiculoId(orc.veiculoId);
    setMecanicoId(orc.mecanicoId);
    setKmAtual(String(orc.kmAtual));
    setDescricaoProblema(orc.descricaoProblema || "");
    setServicosOrcados(orc.servicosOrcados || "");
    setValorMaoDeObra(String(orc.valorMaoDeObra));
    
    // Estimate validity days based on dates
    let days = "10";
    try {
      const openD = new Date(orc.dataAbertura);
      const valD = new Date(orc.dataValidade);
      const diffTime = Math.abs(valD.getTime() - openD.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if ([5, 10, 15, 30].includes(diffDays)) {
        days = String(diffDays);
      } else {
        days = "10";
      }
    } catch (e) {
      days = "10";
    }
    setValidadeDias(days);

    // Populate pieces with original values
    setTempPecas(orc.pecasUtilizadas.map(p => ({
      pecaId: p.pecaId,
      quantidade: p.quantidade,
      precoUnitario: p.precoUnitario
    })));

    setClientSearch("");
    setPartSearchQuery("");
    setPecaIdAdicionar("");
    setShowAddForm(true);
    setFormError("");
    setSelectedOrcamento(null); // Close active details modal if there is one open
    
    // Smooth scroll page to draft section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getClientNome = (cid: string) => {
    return clientes.find(c => c.id === cid)?.nome || "Cliente não identificado";
  };

  const getVehicleDesc = (vid: string) => {
    const v = veiculos.find(x => x.id === vid);
    if (!v) return "Veículo não identificado";
    return `${v.marca} ${v.modelo} (${v.placa})`;
  };

  const getMecanicoNome = (mid: string) => {
    return mecanicos.find(m => m.id === mid)?.nome || "Técnico não associado";
  };

  // Build target date string
  const calculateValidadeDate = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().split("T")[0];
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !veiculoId || !mecanicoId || !kmAtual) {
      setFormError("Erro: Por favor, selecione o Cliente, o Veículo, o Técnico e informe a KM Atual.");
      return;
    }

    const totalParts = tempPecas.reduce((acc, curr) => acc + (curr.quantidade * curr.precoUnitario), 0);
    const labor = Number(valorMaoDeObra) || 0;
    const total = totalParts + labor;

    if (editingOrcamentoId) {
      // Editing an existing budget
      const updatedOrcamentos = orcamentos.map(orc => {
        if (orc.id === editingOrcamentoId) {
          return {
            ...orc,
            clienteId,
            veiculoId,
            mecanicoId,
            dataValidade: calculateValidadeDate(Number(validadeDias) || 10),
            kmAtual: Number(kmAtual) || 0,
            descricaoProblema,
            servicosOrcados,
            valorMaoDeObra: labor,
            valorTotal: total,
            pecasUtilizadas: tempPecas.map(tp => {
              const existingPiece = orc.pecasUtilizadas.find(e => e.pecaId === tp.pecaId);
              return {
                pecaId: tp.pecaId,
                quantidade: tp.quantidade,
                precoUnitario: tp.precoUnitario,
                aprovada: existingPiece ? existingPiece.aprovada : false
              };
            })
          };
        }
        return orc;
      });
      onUpdateOrcamentos(updatedOrcamentos);
      setShowAddForm(false);
      clearForm();
    } else {
      // Creating a new budget
      const newBudget: Orcamento = {
        id: "orc_" + Date.now(),
        clienteId,
        veiculoId,
        mecanicoId,
        dataAbertura: new Date().toISOString().split("T")[0],
        dataValidade: calculateValidadeDate(Number(validadeDias) || 10),
        status: "Pendente",
        kmAtual: Number(kmAtual) || 0,
        descricaoProblema,
        servicosOrcados,
        maoDeObraAprovada: false,
        pecasUtilizadas: tempPecas.map(p => ({ ...p, aprovada: false })),
        valorMaoDeObra: labor,
        valorTotal: total
      };

      onUpdateOrcamentos([newBudget, ...orcamentos]);
      setShowAddForm(false);
      clearForm();
    }
  };

  const handleAddPartToTempList = () => {
    if (!pecaIdAdicionar) return;
    const spec = pecas.find(p => p.id === pecaIdAdicionar);
    if (!spec) return;

    // Check inventory availability
    const qty = Number(pecaQtdAdicionar) || 1;
    if (spec.estoque < qty) {
      alert(`Aviso: Estoque baixo! Essa peça possui apenas ${spec.estoque} unidades disponíveis no estoque.`);
    }

    const existingIndex = tempPecas.findIndex(p => p.pecaId === pecaIdAdicionar);
    if (existingIndex > -1) {
      const updated = [...tempPecas];
      updated[existingIndex].quantidade += qty;
      setTempPecas(updated);
    } else {
      setTempPecas([...tempPecas, {
        pecaId: pecaIdAdicionar,
        quantidade: qty,
        precoUnitario: spec.precoVenda
      }]);
    }

    setPecaIdAdicionar("");
    setPecaQtdAdicionar("1");
    setPartSearchQuery("");
  };

  const removePartFromTempList = (idx: number) => {
    setTempPecas(tempPecas.filter((_, i) => i !== idx));
  };

  // Open budget review modal & populate execution selection checkbox states
  const openOrcamentoDetail = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setConversionSuccessFeed(null);
    
    // Init checked item map
    const initialCheckedPecas: Record<string, boolean> = {};
    orc.pecasUtilizadas.forEach((item, index) => {
      // Checked if already approved OR if it's pending let user decide (default checked for newly viewed items)
      initialCheckedPecas[`${item.pecaId}-${index}`] = item.aprovada;
    });
    setCheckedPecas(initialCheckedPecas);
    setCheckedMaoDeObra(orc.maoDeObraAprovada);
  };

  // Printing logic
  const handlePrintOrcamento = (orc: Orcamento) => {
    const client = clientes.find(c => c.id === orc.clienteId);
    const vehicle = veiculos.find(v => v.id === orc.veiculoId);
    
    const clientName = client?.nome || "Não cadastrado";
    const clientCpf = client?.cpfCnpj || "Não cadastrado";
    const clientPhone = client?.telefone || "Não cadastrado";
    const clientEmail = client?.email || "Não informado";
    const clientAddress = client?.endereco || "Não informado";

    const vehicleModel = vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "Não cadastrado";
    const vehiclePlate = vehicle?.placa || "Sem placa";
    const vehicleYear = vehicle?.ano || "Não informado";
    const vehicleSpec = vehicle ? `${vehicle.motor} - ${vehicle.cor}` : "Não informado";
    const kmInput = orc.kmAtual.toLocaleString();

    const partsRows = orc.pecasUtilizadas.map(item => {
      const partSpec = pecas.find(p => p.id === item.pecaId);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; color: #334155;">
          <td style="padding: 8px 0; font-size: 11px;">
            ${item.aprovada ? "<span style='color:#16a34a; font-weight:bold;'>[✓ Aprovado]</span> " : ""}
            ${partSpec?.descricao || "Peça de Reposição"} [${partSpec?.sku || "SKU-N/A"}]
          </td>
          <td style="padding: 8px 0; font-size: 11px;">${partSpec?.fabricante || "-"}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: center;">${item.quantidade}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: right;">${formatCurrency(item.precoUnitario)}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(item.quantidade * item.precoUnitario)}</td>
        </tr>
      `;
    }).join("");

    const partsTotal = orc.pecasUtilizadas.reduce((acc, curr) => acc + (curr.quantidade * curr.precoUnitario), 0);
    const mechanicName = getMecanicoNome(orc.mecanicoId);

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orçamento de Serviço #${orc.id.toUpperCase()}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 12px;
            line-height: 1.5;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 3px double #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 20px;
            font-weight: 900;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 10px;
            font-weight: 800;
            color: #ea580c;
            letter-spacing: 0.05em;
            margin: 0;
            text-transform: uppercase;
          }
          .metadata-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .metadata-card {
            width: 48%;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            vertical-align: top;
          }
          .card-title {
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            margin-top: 0;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            color: #0f172a;
          }
          .symptom-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 4px;
            background-color: #fef3c7;
            color: #d97706;
            margin-top: 5px;
          }
          .parts-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .parts-table th {
            border-bottom: 2px solid #0f172a;
            color: #475569;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px 0;
            text-align: left;
          }
          .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-left: auto;
            width: 320px;
            text-align: right;
            margin-bottom: 40px;
          }
          .summary-row {
            margin-bottom: 6px;
            color: #475569;
          }
          .total-row {
            border-top: 1px solid #cbd5e1;
            margin-top: 10px;
            padding-top: 8px;
            font-size: 16px;
            font-weight: 950;
            color: #0f172a;
          }
          .signatures {
            width: 100%;
            border-collapse: collapse;
            margin-top: 60px;
            margin-bottom: 40px;
          }
          .signature-line {
            width: 42%;
            text-align: center;
            vertical-align: top;
          }
          .signature-bar {
            width: 80%;
            border-bottom: 1px solid #94a3b8;
            margin: 0 auto 8px auto;
          }
          .disclaimer {
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            line-height: 1.4;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${config?.logoUrl && config?.showLogoInOrcamento !== false ? `
                  <img src="${config.logoUrl}" style="max-height: 55px; max-width: 110px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1; padding: 2px;" referrerPolicy="no-referrer" />
                ` : ""}
                <div>
                  <h1 class="title" style="margin: 0; font-size: 16px;">${config?.nomeOficina || "KARTER'OS OFICINA MECÂNICA"}</h1>
                  <p class="subtitle" style="margin: 2px 0 0 0; font-size: 9px;">Manutenção Automotiva de Alta Performance</p>
                  <p style="margin: 2px 0 0 0; font-size: 9px; color: #64748b;">CNPJ: 14.238.995/0001-82 | Endereço: ${config?.endereco || "Av. Nações Unidas, 12551"}</p>
                </div>
              </div>
            </td>
            <td style="text-align: right; font-size: 10px; color: #475569; vertical-align: middle;">
              <div style="font-weight: 900; font-size: 11px; color: #ea580c; margin-bottom: 4px;">ORÇAMENTO DE PREVENTIVO #${orc.id.toUpperCase()}</div>
              <div>Status Atual: <strong>${orc.status}</strong></div>
              <div>Data de Emissão: ${orc.dataAbertura} | Validade: ${orc.dataValidade}</div>
              <div>Telefone: ${config?.telefone || "(11) 98765-4321"}</div>
            </td>
          </tr>
        </table>

        <table class="metadata-table">
          <tr>
            <td class="metadata-card">
              <h3 class="card-title">Dados do Cliente</h3>
              <p style="margin: 4px 0;"><strong>Nome:</strong> ${clientName}</p>
              <p style="margin: 4px 0;"><strong>CPF/CNPJ:</strong> ${clientCpf}</p>
              <p style="margin: 4px 0;"><strong>Telefone:</strong> ${clientPhone}</p>
              <p style="margin: 4px 0;"><strong>E-mail:</strong> ${clientEmail}</p>
              <p style="margin: 4px 0;"><strong>Endereço:</strong> ${clientAddress}</p>
            </td>
            <td style="width: 4%"></td>
            <td class="metadata-card">
              <h3 class="card-title">Dados do Veículo</h3>
              <p style="margin: 4px 0;"><strong>Marca / Modelo:</strong> ${vehicleModel}</p>
              <p style="margin: 4px 0;"><strong>Placa:</strong> ${vehiclePlate}</p>
              <p style="margin: 4px 0;"><strong>Ano de Fabricação:</strong> ${vehicleYear}</p>
              <p style="margin: 4px 0;"><strong>Motorização / Cor:</strong> ${vehicleSpec}</p>
              <p style="margin: 4px 0;"><strong>KM no Orçamento:</strong> ${kmInput} KM</p>
            </td>
          </tr>
        </table>

        <div class="symptom-box">
          <h3 class="card-title" style="margin-bottom: 6px;">Sintomas Relatados</h3>
          <p style="margin: 0; font-style: italic; color: #334155;">"${orc.descricaoProblema || "Nenhum"}"</p>
          <h3 class="card-title" style="margin-top: 12px; margin-bottom: 6px;">Soluções Planejadas</h3>
          <p style="margin: 0; font-style: italic; color: #334155;">"${orc.servicosOrcados || "Mão de obra técnica geral"}"</p>
        </div>

        <h3 class="card-title" style="border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px;">ITENS E COMPONENTES ORÇADOS</h3>
        ${orc.pecasUtilizadas.length === 0 ? `
          <p style="font-style: italic; color: #64748b; margin-bottom: 25px;">Nenhum componente físico adicionado a este orçamento.</p>
        ` : `
          <table class="parts-table">
            <thead>
              <tr>
                <th style="width: 45%;">Descrição da Peça</th>
                <th style="width: 20%;">Fabricante</th>
                <th style="width: 10%; text-align: center;">Quant.</th>
                <th style="width: 12.5%; text-align: right;">Preço Unitário</th>
                <th style="width: 12.5%; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${partsRows}
            </tbody>
          </table>
        `}

        <div class="summary-box">
          <div class="summary-row">Total em Peças de Reposição: <strong>${formatCurrency(partsTotal)}</strong></div>
          <div class="summary-row">Serviços Técnicos / Mão de Obra: <strong>${formatCurrency(orc.valorMaoDeObra)}</strong></div>
          <div class="total-row">
            <div style="font-size: 10px; text-transform: uppercase; color: #475569; font-weight: bold; margin-bottom: 2px;">Valor Total Estimado</div>
            <div>${formatCurrency(orc.valorTotal)}</div>
          </div>
        </div>

        <table class="signatures">
          <tr>
            <td class="signature-line">
              <div class="signature-bar"></div>
              <div style="font-weight: bold;">${mechanicName}</div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Mecânico Responsável</div>
            </td>
            <td style="width: 16%;"></td>
            <td class="signature-line">
              <div class="signature-bar"></div>
              <div style="font-weight: bold;">${clientName}</div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Aprovação Cliente</div>
            </td>
          </tr>
        </table>

        <div class="disclaimer">
          Disposições Gerais: Preços baseados nos catálogos vigentes. Validade máxima de 10 dias de acordo com o Artigo 40 do CDC.<br />
          Karter'OS Gestão de Alta Performance
        </div>

        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    // Try using hidden iframe first to circumvent popup blockers in sandboxed iframes
    try {
      const printIframe = document.createElement("iframe");
      printIframe.id = "temp-print-iframe-" + Date.now();
      printIframe.style.position = "absolute";
      printIframe.style.top = "-10000px";
      printIframe.style.left = "-10000px";
      printIframe.style.width = "0px";
      printIframe.style.height = "0px";
      document.body.appendChild(printIframe);

      const targetDoc = printIframe.contentWindow ? printIframe.contentWindow.document : printIframe.contentDocument;
      if (targetDoc) {
        targetDoc.open();
        targetDoc.write(printHTML);
        targetDoc.close();
        
        setTimeout(() => {
          if (printIframe.contentWindow) {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
            setTimeout(() => {
              try {
                document.body.removeChild(printIframe);
              } catch (e) {
                console.error("Erro ao remover iframe temporário:", e);
              }
            }, 5000); // Leave enough time for page processing & user dialog
          }
        }, 400);
      }
    } catch (err) {
      console.warn("Fallback to popup window print due to iframe restriction:", err);
      // Fallback to window.open if iframe fails for some reason
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
      } else {
        window.print();
      }
    }
  };

  // Convert selected items into a Service Order (OS)
  const handleConvertToOS = () => {
    if (!selectedOrcamento) return;

    // Identify which pieces are checked (selected for execution)
    const approvedPecas: OrcamentoItemPeca[] = [];
    selectedOrcamento.pecasUtilizadas.forEach((item, index) => {
      const isChecked = !!checkedPecas[`${item.pecaId}-${index}`];
      if (isChecked && !item.aprovada) {
        approvedPecas.push({
          ...item,
          aprovada: true
        });
      }
    });

    const isLaborApprovedNow = checkedMaoDeObra && !selectedOrcamento.maoDeObraAprovada;

    // Check if nothing is selected or approved now
    if (approvedPecas.length === 0 && !isLaborApprovedNow) {
      alert("Por favor, selecione pelo menos um item (peça ou mão de obra) pendente para converter em Ordem de Serviço!");
      return;
    }

    // Build the list of pieces for the target OS
    const targetOSPecas = approvedPecas.map(p => ({
      pecaId: p.pecaId,
      quantidade: p.quantidade,
      precoUnitario: p.precoUnitario
    }));

    // Deduct stock for approved parts!
    const updatedInventory = [...pecas];
    approvedPecas.forEach(p => {
      const invIdx = updatedInventory.findIndex(x => x.id === p.pecaId);
      if (invIdx > -1) {
        updatedInventory[invIdx].estoque = Math.max(0, updatedInventory[invIdx].estoque - p.quantidade);
      }
    });
    onUpdatePecas(updatedInventory);

    // Create the brand-new target Ordem de Serviço
    const laborCost = checkedMaoDeObra ? selectedOrcamento.valorMaoDeObra : 0;
    const partsTotal = approvedPecas.reduce((acc, curr) => acc + (curr.quantidade * curr.precoUnitario), 0);
    const totalCost = partsTotal + laborCost;

    const brandNewOS: OrdemServico = {
      id: "os_" + Date.now(),
      veiculoId: selectedOrcamento.veiculoId,
      clienteId: selectedOrcamento.clienteId,
      mecanicoId: selectedOrcamento.mecanicoId,
      dataAbertura: new Date().toISOString().split("T")[0],
      status: "Em Andamento",
      kmAtual: selectedOrcamento.kmAtual,
      descricaoProblema: `[Convertido de Orçamento #${selectedOrcamento.id.toUpperCase()}] ${selectedOrcamento.descricaoProblema}`,
      servicosRealizados: `${checkedMaoDeObra ? "Mão de obra aprovada e em andamento. " : ""}${selectedOrcamento.servicosOrcados}`,
      pecasUtilizadas: targetOSPecas,
      valorMaoDeObra: laborCost,
      valorTotal: totalCost
    };

    // Update original Budget state and status.
    const finalPecasUtilizadas = selectedOrcamento.pecasUtilizadas.map((item, index) => {
      const isChecked = !!checkedPecas[`${item.pecaId}-${index}`];
      if (isChecked) {
        return { ...item, aprovada: true };
      }
      return item;
    });

    const laborApprovedFinal = checkedMaoDeObra || selectedOrcamento.maoDeObraAprovada;

    // Check if ALL items are now approved
    const allPecasApproved = finalPecasUtilizadas.every(p => p.aprovada);
    const finalBudgetStatus = (allPecasApproved && laborApprovedFinal) ? "Autorizado Total" : "Autorizado Parcial";

    const updatedBudget: Orcamento = {
      ...selectedOrcamento,
      pecasUtilizadas: finalPecasUtilizadas,
      maoDeObraAprovada: laborApprovedFinal,
      status: finalBudgetStatus,
      osGeradaId: brandNewOS.id
    };

    onUpdateOrdens([brandNewOS, ...ordens]);
    
    const updatedOrcamentosList = orcamentos.map(o => o.id === selectedOrcamento.id ? updatedBudget : o);
    onUpdateOrcamentos(updatedOrcamentosList);

    // Update active selection view/modal
    setSelectedOrcamento(null);
    setConversionSuccessFeed(brandNewOS.id);

    // Automatically navigate to the OS screen with that specific OS focused
    if (onNavigate) {
      onNavigate("ordens", brandNewOS);
    }
  };

  // Filter budgets based on query and state
  const filteredOrcamentos = orcamentos.filter(orc => {
    const client = clientes.find(c => c.id === orc.clienteId);
    const vehicle = veiculos.find(v => v.id === orc.veiculoId);
    
    const matchesSearch = 
      (client?.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client?.cpfCnpj || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle?.placa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle?.modelo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "todos" || orc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Autocomplete suggestions
  const filterClientesSugestao = clientes.filter(c =>
    c.nome.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.cpfCnpj.includes(clientSearch)
  );

  const selectedClientVehicles = veiculos.filter(v => v.clienteId === clienteId);

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* Intro row with headers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-6 h-6 text-orange-500" />
            Gestão Integrada de Orçamentos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gere orçamentos flexíveis, salve orçamentos pendentes no histórico do veículo e converta itens específicos aprovados em Ordens de Serviço (OS).
          </p>
        </div>
        
        <button
          onClick={() => {
            if (showAddForm) {
              clearForm();
            }
            setShowAddForm(!showAddForm);
            setFormError("");
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black rounded-xl text-xs transition duration-150 flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-lg shadow-orange-905/30"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>
            {showAddForm 
              ? (editingOrcamentoId ? "Fechar Edição" : "Fechar Formulário") 
              : (editingOrcamentoId ? "Retornar ao Editor" : "Novo Orçamento")}
          </span>
        </button>
      </div>

      {/* Conversion Success Alert Banner */}
      {focusedOrcamento && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-orange-400 w-5 h-5 shrink-0" />
            <span>Orçamento selecionado do histórico: #[{focusedOrcamento.id.toUpperCase()}] de {getClientNome(focusedOrcamento.clienteId)}</span>
          </div>
          <button 
            onClick={() => {
              openOrcamentoDetail(focusedOrcamento);
              if (onClearFocusedOrcamento) onClearFocusedOrcamento();
            }}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-bold rounded-lg"
          >
            Visualizar Agora
          </button>
        </div>
      )}

      {/* Create Budget Form Drawer/Card */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-905/90 bg-slate-900 border border-white/10 rounded-2xl shadow-xl"
          >
            <form onSubmit={handleAddBudget} className="p-6 space-y-6">
              <h3 className="text-base font-extrabold text-orange-400 border-b border-white/5 pb-2 flex items-center gap-1.5">
                {editingOrcamentoId ? (
                  <>
                    <Edit className="w-5 h-5 text-orange-400" />
                    <span>Editar Orçamento #{editingOrcamentoId.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 text-orange-450" />
                    <span>Registrar Novo Orçamento de Serviços e Peças</span>
                  </>
                )}
              </h3>

              {formError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Client autocomplete picker */}
                <div className="relative">
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Cliente Proprietário *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Buscar por Nome ou CPF..."
                      value={clienteId ? getClientNome(clienteId) : clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setClienteId(""); // reset if type again
                        setVeiculoId("");
                        setShowClientSuggestions(true);
                      }}
                      onFocus={() => setShowClientSuggestions(true)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                    />
                    {clienteId && (
                      <button
                        type="button"
                        onClick={() => {
                          setClienteId("");
                          setClientSearch("");
                          setVeiculoId("");
                        }}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-white/10 rounded-xl text-slate-300 flex items-center justify-center cursor-pointer"
                        title="Limpar seleção"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {showClientSuggestions && !clienteId && clientSearch && (
                    <div className="absolute z-35 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-56 overflow-y-auto shadow-2xl divide-y divide-white/5">
                      {filterClientesSugestao.length === 0 ? (
                        <div className="p-3 text-slate-550 text-xs italic">Nenhum cliente correspondente encontrado.</div>
                      ) : (
                        filterClientesSugestao.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setClienteId(c.id);
                              setShowClientSuggestions(false);
                            }}
                            className="w-full text-left p-3 hover:bg-white/5 text-xs transition flex flex-col"
                          >
                            <span className="font-bold text-white">{c.nome}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">CPF/CNPJ: {c.cpfCnpj} | Fone: {c.telefone}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Vehicle Selection filtered by Customer */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Veículo Associado *</label>
                  <select
                    disabled={!clienteId}
                    value={veiculoId}
                    onChange={(e) => setVeiculoId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">{clienteId ? "-- Selecione o Veículo --" : "Selecione primeiro o cliente..."}</option>
                    {selectedClientVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.marca} {v.modelo} - [{v.placa}]</option>
                    ))}
                  </select>
                </div>

                {/* Mechanic Specialist Assignment */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5 font-sans">Mecânico Especialista *</label>
                  <select
                    value={mecanicoId}
                    onChange={(e) => setMecanicoId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                  >
                    <option value="">-- Selecione o Técnico --</option>
                    {mecanicos.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.especialidade})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Entry KM */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">KM Atual do Veículo *</label>
                  <input
                    type="number"
                    placeholder="Ex: 85200"
                    value={kmAtual}
                    onChange={(e) => setKmAtual(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                  />
                </div>

                {/* Labor cost */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Valor Estimado Mão de Obra (R$) *</label>
                  <input
                    type="number"
                    placeholder="Ex: 150.00"
                    value={valorMaoDeObra}
                    onChange={(e) => setValorMaoDeObra(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                  />
                </div>

                {/* Validity days */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Validade do Orçamento (Dias) *</label>
                  <select
                    value={validadeDias}
                    onChange={(e) => setValidadeDias(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                  >
                    <option value="5">5 Dias</option>
                    <option value="10">10 Dias (Padrão)</option>
                    <option value="15">15 Dias</option>
                    <option value="30">30 Dias</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Problems Described */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Reclamações & Sintomas Constatados</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Barulho ao esterçar a direção, pedal do freio duro, necessidade de troca de óleo de rotina..."
                    value={descricaoProblema}
                    onChange={(e) => setDescricaoProblema(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-100 placeholder-slate-500"
                  />
                </div>

                {/* Scope of proposed service */}
                <div>
                  <label className="block text-xxs uppercase tracking-wider font-extrabold text-slate-300 mb-1.5">Escopo de Serviços / Reparos Planejados</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Alinhamento de direção dianteiro, retífica dos discos, revisão geral do sistema hidráulico..."
                    value={servicosOrcados}
                    onChange={(e) => setServicosOrcados(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Dynamic Parts Adding Widget */}
              <div className="bg-slate-950/50 rounded-xl border border-white/10 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    Peças & Componentes Orçados para Reposição
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setQpeDescricao("");
                      setQpeSku("");
                      setQpeFabricante("");
                      setQpePrecoVenda("");
                      setQpeEstoque("0");
                      setShowQuickPartForm(!showQuickPartForm);
                    }}
                    className="text-orange-450 hover:text-orange-400 text-xxs font-extrabold transition flex items-center gap-1 cursor-pointer bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Cadastrar Peça Fora de Estoque (Atalho)</span>
                  </button>
                </div>

                {/* Quick register popover container */}
                {showQuickPartForm && (
                  <div className="bg-slate-900 border border-orange-500/30 p-4 rounded-xl space-y-3 shadow-lg animate-fadeIn text-slate-350">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h5 className="text-xs font-black text-orange-400 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4" />
                        Cadastrar Nova Peça Rápido
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowQuickPartForm(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-1">Descrição / Nome da Peça *</label>
                        <input
                          type="text"
                          placeholder="Ex: Pastilha de Freio Dianteiro Cobreq"
                          value={qpeDescricao}
                          onChange={(e) => setQpeDescricao(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Fabricante / Marca *</label>
                        <input
                          type="text"
                          placeholder="Ex: Cobreq, Bosch, TRW"
                          value={qpeFabricante}
                          onChange={(e) => setQpeFabricante(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Preço Consumidor (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 185.00"
                          value={qpePrecoVenda}
                          onChange={(e) => setQpePrecoVenda(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Código SKU (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Deixe em branco p/ gerar auto"
                          value={qpeSku}
                          onChange={(e) => setQpeSku(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Estoque Inicial (un)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={qpeEstoque}
                          onChange={(e) => setQpeEstoque(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!qpeDescricao.trim()) {
                              alert("Por favor, informe a descrição da peça!");
                              return;
                            }
                            if (!qpeFabricante.trim()) {
                              alert("Por favor, informe o fabricante da peça!");
                              return;
                            }
                            const price = parseFloat(qpePrecoVenda) || 0;
                            if (price < 0) {
                              alert("Por favor, informe um preço de venda válido!");
                              return;
                            }

                            const tempSku = qpeSku.trim() || ("FORN-" + Date.now().toString().slice(-6));
                            
                            const newPecaInstance: Peca = {
                              id: "peca_" + Date.now(),
                              sku: tempSku,
                              descricao: qpeDescricao.trim(),
                              fabricante: qpeFabricante.trim(),
                              estoque: Number(qpeEstoque) || 0,
                              precoCusto: price * 0.7, // assume 30% mark-up
                              precoVenda: price
                            };

                            // Update master pecas
                            onUpdatePecas([...pecas, newPecaInstance]);

                            // Immediately add to draft
                            const qty = Number(pecaQtdAdicionar) || 1;
                            setTempPecas([...tempPecas, {
                              pecaId: newPecaInstance.id,
                              quantidade: qty,
                              precoUnitario: newPecaInstance.precoVenda
                            }]);

                            // Reset form fields
                            setQpeDescricao("");
                            setQpeFabricante("");
                            setQpePrecoVenda("");
                            setQpeSku("");
                            setQpeEstoque("");
                            setShowQuickPartForm(false);
                            setPecaIdAdicionar("");
                            setPartSearchQuery("");
                            setShowPartSuggestions(false);
                          }}
                          className="w-full bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Salvar e Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3.5 items-end">
                  <div className="flex-1 w-full relative">
                    <label className="block text-[10px] text-slate-400 mb-1">Pesquisar Peça por Nome, SKU ou Fabricante (Escrita)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Digite para buscar..."
                        value={partSearchQuery}
                        onChange={(e) => {
                          setPartSearchQuery(e.target.value);
                          if (pecaIdAdicionar) {
                            setPecaIdAdicionar("");
                          }
                          setShowPartSuggestions(true);
                        }}
                        onFocus={() => setShowPartSuggestions(true)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-405"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      
                      {partSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setPecaIdAdicionar("");
                            setPartSearchQuery("");
                            setShowPartSuggestions(false);
                          }}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete suggestion popover */}
                    {showPartSuggestions && !pecaIdAdicionar && (
                      <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-56 overflow-y-auto shadow-2xl divide-y divide-white/5">
                        {pecas.filter(p => {
                          const q = partSearchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            p.descricao.toLowerCase().includes(q) ||
                            p.sku.toLowerCase().includes(q) ||
                            p.fabricante.toLowerCase().includes(q)
                          );
                        }).length === 0 ? (
                          <div className="p-3 text-slate-400 text-xs flex flex-col gap-2">
                            <span>Nenhuma peça correspondente encontrada no estoque.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setQpeDescricao(partSearchQuery);
                                setQpeSku("FORN-" + Date.now().toString().slice(-6));
                                setQpeFabricante("");
                                setQpePrecoVenda("");
                                setQpeEstoque("0");
                                setShowQuickPartForm(true);
                                setShowPartSuggestions(false);
                              }}
                              className="text-orange-400 hover:text-orange-350 text-xxs font-bold text-left underline flex items-center gap-1 cursor-pointer mt-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5 animate-pulse" />
                              <span>Cadastrar "{partSearchQuery}" como Nova Peça Rápido</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {pecas.filter(p => {
                              const q = partSearchQuery.toLowerCase().trim();
                              if (!q) return true;
                              return (
                                p.descricao.toLowerCase().includes(q) ||
                                p.sku.toLowerCase().includes(q) ||
                                p.fabricante.toLowerCase().includes(q)
                              );
                            }).slice(0, 8).map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setPecaIdAdicionar(p.id);
                                  setPartSearchQuery(`${p.descricao} [${p.sku}]`);
                                  setShowPartSuggestions(false);
                                }}
                                className="w-full text-left p-2.5 hover:bg-white/5 text-xs transition flex flex-col"
                              >
                                <div className="flex justify-between font-bold text-white">
                                  <span>{p.descricao}</span>
                                  <span className="text-orange-400">{formatCurrency(p.precoVenda)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                                  <span>SKU: {p.sku} | Fabricante: {p.fabricante}</span>
                                  <span>Estoque: {p.estoque} un</span>
                                </div>
                              </button>
                            ))}
                            <div className="p-2 bg-slate-950/40 text-center border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => {
                                  setQpeDescricao(partSearchQuery);
                                  setQpeSku("");
                                  setQpeFabricante("");
                                  setQpePrecoVenda("");
                                  setQpeEstoque("0");
                                  setShowQuickPartForm(true);
                                  setShowPartSuggestions(false);
                                }}
                                className="text-orange-400 hover:text-orange-350 text-xxs font-black flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Não encontrou? Cadastrar Nova Peça</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-28">
                    <label className="block text-[10px] text-slate-400 mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={pecaQtdAdicionar}
                      onChange={(e) => setPecaQtdAdicionar(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPartToTempList}
                    className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-white/10 rounded-xl text-xs transition font-black cursor-pointer align-bottom h-[38px] flex items-center justify-center"
                    disabled={!pecaIdAdicionar}
                  >
                    Adicionar Item
                  </button>
                </div>

                {/* Dynamic pieces list preview and inline editing */}
                {tempPecas.length === 0 ? (
                  <p className="text-xs italic text-slate-500 py-2">Nenhuma peça adicionada ao orçamento de reposição ainda.</p>
                ) : (
                  <div className="border border-white/5 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse bg-slate-900">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-white/10">
                          <th className="p-3">Componente / Peça</th>
                          <th className="p-3 font-mono text-[9px] text-slate-450">Fabricante</th>
                          <th className="p-3 text-center w-24">Quant</th>
                          <th className="p-3 text-right w-36">Valor Unit.</th>
                          <th className="p-3 text-right">Subtotal</th>
                          <th className="p-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempPecas.map((item, idx) => {
                          const spec = pecas.find(p => p.id === item.pecaId);
                          return (
                            <tr key={idx} className="border-b border-white/5 text-slate-300">
                              <td className="p-3 font-semibold text-white">
                                <div>{spec?.descricao || "Componente"}</div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {spec?.sku || "N/A"}</div>
                              </td>
                              <td className="p-3 text-slate-400 font-mono text-[10px]">{spec?.fabricante || "-"}</td>
                              <td className="p-3 text-center font-bold">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    updateTempPeca(idx, "quantidade", val);
                                  }}
                                  className="w-16 bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-center font-bold text-white text-xs focus:ring-1 focus:ring-orange-550 focus:outline-none"
                                />
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[10px] text-slate-500">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.precoUnitario}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                                      updateTempPeca(idx, "precoUnitario", val);
                                    }}
                                    className="w-24 bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-right font-bold text-orange-400 text-xs focus:ring-1 focus:ring-orange-550 focus:outline-none"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-right text-orange-400 font-bold">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removePartFromTempList(idx)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit triggers for new budget */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black rounded-xl text-xs transition duration-150 shadow-lg cursor-pointer"
                >
                  {editingOrcamentoId ? "Salvar Alterações" : "Registrar Orçamento"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Filtering Row toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs bg-white/5 border border-white/10 p-4 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por Cliente, Placa do Veículo, ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500"
          />
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <span className="text-slate-400 whitespace-nowrap hidden sm:inline">Filtrar Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="todos">Todos os Orçamentos</option>
            <option value="Pendente">Pendente de Análise</option>
            <option value="Autorizado Parcial">Aprovado Parcialmente</option>
            <option value="Autorizado Total">Aprovado Totalmente</option>
            <option value="Expirado">Prazo Expirado</option>
          </select>
        </div>
      </div>

      {/* Grid of existing Budgets */}
      {filteredOrcamentos.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/50 border border-white/10 rounded-2xl">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-350 font-bold text-sm">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-slate-505 mt-1 text-slate-500">Altere o termo de pesquisa ou adicione um novo orçamento técnico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrcamentos.map(orc => {
            const client = clientes.find(c => c.id === orc.clienteId);
            const vehicle = veiculos.find(v => v.id === orc.veiculoId);
            const piecesTotal = orc.pecasUtilizadas.reduce((acc, curr) => acc + (curr.quantidade * curr.precoUnitario), 0);
            
            // Format state badge styling
            let statusColor = "bg-amber-500/10 border-amber-500/20 text-amber-300";
            if (orc.status === "Autorizado Total") statusColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
            if (orc.status === "Autorizado Parcial") statusColor = "bg-blue-500/10 border-blue-500/20 text-blue-300";
            if (orc.status === "Expirado") statusColor = "bg-rose-500/12 border-rose-500/20 text-rose-400";

            return (
              <motion.div
                key={orc.id}
                layout
                onDoubleClick={() => { openOrcamentoDetail(orc); setIsOrcamentoMaximized(true); }}
                className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/15 hover:shadow-xl hover:shadow-orange-950/5 transition-all duration-150 flex flex-col justify-between cursor-pointer select-none"
                title="Dê duplo clique para abrir em tela maior"
              >
                {/* Header card indicator info */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase">#[{orc.id.toUpperCase()}]</span>
                    <span className={`text-[9.5px] px-2.5 py-1 rounded-md font-extrabold border ${statusColor}`}>
                      {orc.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-black text-white hover:underline cursor-pointer">
                        {client?.nome || "Cliente não encontrado"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-450 text-orange-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {vehicle ? `${vehicle.marca} ${vehicle.modelo} [${vehicle.placa}]` : "Sem veículo"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      Expira em: <strong className="text-slate-300">{orc.dataValidade}</strong>
                    </span>
                    <span className="font-bold text-slate-300">
                      KM: {orc.kmAtual.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-[11px] text-slate-400 italic">
                    <p className="line-clamp-2">"{orc.descricaoProblema || "Nenhuma reclamação fornecida"}"</p>
                  </div>
                </div>

                {/* Footer sum total & interactive operations */}
                <div className="bg-slate-950/50 border-t border-white/10 p-4.5 flex items-center justify-between gap-2.5 mt-auto">
                  <div className="text-left">
                    <div className="text-[9.5px] uppercase font-bold tracking-wider text-slate-500">Estimativa Total</div>
                    <div className="text-sm font-black text-orange-400">{formatCurrency(orc.valorTotal)}</div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handlePrintOrcamento(orc)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/10 transition flex items-center justify-center cursor-pointer"
                      title="Imprimir Orçamento"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStartEditOrcamento(orc)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-lg border border-white/10 transition flex items-center justify-center cursor-pointer"
                      title="Editar Orçamento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => { openOrcamentoDetail(orc); setIsOrcamentoMaximized(true); }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-white/10 transition flex items-center justify-center cursor-pointer"
                      title="Abrir Ampliado (Tela Maior)"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openOrcamentoDetail(orc)}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-550 text-slate-950 font-black rounded-lg text-xxs transition flex items-center gap-1 shadow-lg shadow-orange-950/40 cursor-pointer"
                    >
                      <span>Analisar & Aprovar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review & Selective Execution Approval Modal */}
      {selectedOrcamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isOrcamentoMaximized ? "max-w-6xl w-[95vw] h-[90vh]" : "max-w-2xl w-full max-h-[90vh]"
          }`}>
            
            {/* Header segment of Modal */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-base font-extrabold text-white">Análise do Orçamento #{selectedOrcamento.id.toUpperCase()}</h3>
                  <p className="text-xxs text-slate-400">Cliente: <strong className="text-slate-300">{getClientNome(selectedOrcamento.clienteId)}</strong> | Veículo: <strong className="text-slate-300">{getVehicleDesc(selectedOrcamento.veiculoId)}</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOrcamentoMaximized(!isOrcamentoMaximized)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  title={isOrcamentoMaximized ? "Restaurar tamanho" : "Maximizar tela"}
                >
                  {isOrcamentoMaximized ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedOrcamento(null); setIsOrcamentoMaximized(false); }}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-450 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Modal Body with items checkboxes */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
              
              {conversionSuccessFeed && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Sucesso!</strong> Ordem de Serviço <strong>#{conversionSuccessFeed.toUpperCase()}</strong> foi gerada com os itens selecionados!
                    </span>
                  </div>
                </div>
              )}

              <div className={isOrcamentoMaximized ? "grid grid-cols-1 lg:grid-cols-12 gap-6 space-y-0" : "space-y-6"}>
                {/* Left/Top Column in Maximized View: Scope & Information */}
                <div className={isOrcamentoMaximized ? "lg:col-span-5 space-y-6" : "space-y-6"}>
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-white/5 space-y-2">
                    <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Escopo Original do Orçamento</h4>
                    <p><strong>Sintoma:</strong> <span className="italic">"{selectedOrcamento.descricaoProblema || "Nenhum informado"}"</span></p>
                    <p><strong>Serviços Planejados:</strong> <span className="italic">"{selectedOrcamento.servicosOrcados || "Técnicos gerais"}"</span></p>
                  </div>

                  {/* Vehicle History Box (Section 2 - Facilitar reorçamentação no futuro) */}
                  <div className="bg-slate-950/25 border border-white/10 rounded-xl p-4 space-y-2">
                    <h4 className="font-black text-[10px] uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      Histórico do veículo: {getVehicleDesc(selectedOrcamento.veiculoId)}
                    </h4>
                    <p className="text-slate-400 text-xxs leading-snug">
                      Os itens não autorizados pelo cliente no ROI imediato permanecerão salvos no chassi/placa deste veículo com o status "Pendente" ou "Autorizado Parcial", garantindo que a oficina possa resgatar as oportunidades em visitas futuras sem redigitar as especificações ou preços.
                    </p>
                  </div>
                </div>

                {/* Right/Bottom Column in Maximized View: Selection Checklist */}
                <div className={isOrcamentoMaximized ? "lg:col-span-7 space-y-6" : "space-y-6"}>
                  <div className="space-y-3.5">
                <h4 className="text-xs uppercase font-extrabold text-orange-400 border-b border-white/5 pb-1">Seleção Seletiva para Execuções (Converter para OS)</h4>
                
                {/* Labor row selector */}
                <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  selectedOrcamento.maoDeObraAprovada 
                    ? "bg-slate-950/40 border-emerald-500/30 text-slate-430 opacity-70" 
                    : checkedMaoDeObra 
                      ? "bg-orange-500/5 border-orange-500/30 text-white" 
                      : "bg-slate-950/20 border-white/5 text-slate-300"
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedOrcamento.maoDeObraAprovada ? (
                      <CheckCheck className="w-4.5 h-4.5 text-emerald-550 text-emerald-400 shrink-0" />
                    ) : (
                      <input
                        id="check-labor-item"
                        type="checkbox"
                        checked={checkedMaoDeObra}
                        onChange={(e) => setCheckedMaoDeObra(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-white/20 text-orange-600 bg-slate-950 focus:ring-orange-500"
                      />
                    )}
                    <div>
                      <span className="font-bold">Mão de Obra Técnica / Execução de Serviços</span>
                      {selectedOrcamento.maoDeObraAprovada && (
                        <span className="block text-[10px] text-emerald-400 font-bold">✓ Já Convertido para Ordem de Serviço</span>
                      )}
                    </div>
                  </div>
                  <strong className="text-slate-200">{formatCurrency(selectedOrcamento.valorMaoDeObra)}</strong>
                </div>

                {/* Table of pieces with checkbox select column */}
                <div className="bg-slate-950/30 border border-white/5 rounded-xl overflow-hidden mt-4">
                  <div className="p-3 bg-slate-950 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-white/5">
                    Componentes e Peças de Reposição
                  </div>
                  
                  {selectedOrcamento.pecasUtilizadas.length === 0 ? (
                    <div className="p-4 text-center text-slate-550 italic">Nenhum item físico listado neste orçamento.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {selectedOrcamento.pecasUtilizadas.map((item, index) => {
                        const spec = pecas.find(p => p.id === item.pecaId);
                        const isAlreadyApproved = item.aprovada;
                        const isChecked = !!checkedPecas[`${item.pecaId}-${index}`];

                        return (
                          <div 
                            key={`${item.pecaId}-${index}`} 
                            className={`p-3.5 flex items-center justify-between gap-3 text-xs ${
                              isAlreadyApproved 
                                ? "bg-slate-950/40 opacity-70" 
                                : isChecked 
                                  ? "bg-orange-500/5 text-white" 
                                  : "bg-transparent text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isAlreadyApproved ? (
                                <CheckCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                              ) : (
                                <input
                                  id={`check-part-item-${index}`}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setCheckedPecas({
                                      ...checkedPecas,
                                      [`${item.pecaId}-${index}`]: e.target.checked
                                    });
                                  }}
                                  className="w-4.5 h-4.5 rounded border-white/20 text-orange-600 bg-slate-950 focus:ring-orange-500"
                                />
                              )}
                              <div>
                                <span className="font-bold text-slate-200">{spec?.descricao || "Componente"}</span>
                                <span className="block text-[10px] text-slate-460 text-slate-400 font-mono mt-0.5">{spec?.fabricante || "-"} • Preço unitário: {formatCurrency(item.precoUnitario)}</span>
                                {isAlreadyApproved && (
                                  <span className="block text-[10px] text-emerald-400 font-bold">✓ Já Convertido para Ordem de Serviço</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="block font-black text-slate-100">Qtde: {item.quantidade}</span>
                              <strong className="block text-orange-450 text-[11px] text-orange-400">{formatCurrency(item.quantidade * item.precoUnitario)}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

                </div>
              </div>
            </div>

            {/* Footer triggers in modal */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-slate-950 text-xs">
              <div>
                <div className="text-slate-500 uppercase font-black tracking-wider text-[8.5px]">Aprovação Executiva</div>
                <div className="text-slate-350 text-xxs">Valor selecionado para conversão em OS</div>
                <strong className="text-base text-orange-400 font-black">
                  {formatCurrency(
                    ((checkedMaoDeObra && !selectedOrcamento.maoDeObraAprovada) ? selectedOrcamento.valorMaoDeObra : 0) +
                    selectedOrcamento.pecasUtilizadas.reduce((acc, curr, index) => {
                      const isChecked = !!checkedPecas[`${curr.pecaId}-${index}`];
                      return acc + (isChecked && !curr.aprovada ? (curr.quantidade * curr.precoUnitario) : 0);
                    }, 0)
                  )}
                </strong>
              </div>

              <div className="flex gap-3 animate-fadeIn">
                <button
                  onClick={() => setSelectedOrcamento(null)}
                  className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Sair
                </button>

                <button
                  onClick={() => handleStartEditOrcamento(selectedOrcamento)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-white/10 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Editar Orçamento"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Orçamento</span>
                </button>

                <button
                  onClick={handleConvertToOS}
                  className="px-4.5 py-2.5 bg-orange-650 hover:bg-orange-600 bg-orange-605 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-950/60 cursor-pointer text-xs"
                >
                  <FileCheck className="w-4.5 h-4.5 text-white" />
                  <span>Gerar OS Autorizada</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
