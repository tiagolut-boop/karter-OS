import React, { useState, useEffect } from "react";
import { Cliente, Veiculo, Peca, Mecanico, OrdemServico, PecaUtilizada, ServicoDetalhado, ServiceEvidence, OficinaConfig } from "../types";
import EVSManager from "./EVSManager";
import { simulateDetranAPI } from "../dataStore";
import { 
  Plus, 
  Trash2, 
  Wrench, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  History, 
  Coins, 
  Calendar, 
  Car, 
  User, 
  Users, 
  PlusCircle, 
  Activity,
  UserCheck,
  CheckCheck,
  Ban,
  Search,
  Sparkles,
  RefreshCw,
  Printer,
  Mail,
  Share2,
  Send,
  Maximize2,
  Minimize2,
  Clock
} from "lucide-react";

interface OrdensServicoProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
  onUpdateOrdens: (newOrdens: OrdemServico[]) => void;
  onUpdatePecas: (newPecas: Peca[]) => void;
  focusedOS?: OrdemServico | null;
  onClearFocusedOS?: () => void;
  onUpdateClientes?: (newClientes: Cliente[]) => void;
  onUpdateVeiculos?: (newVeiculos: Veiculo[]) => void;
  config?: OficinaConfig;
  urlFilter?: string;
}

export default function OrdensServico({
  clientes,
  veiculos,
  pecas,
  mecanicos,
  ordens,
  onUpdateOrdens,
  onUpdatePecas,
  focusedOS,
  onClearFocusedOS,
  onUpdateClientes,
  onUpdateVeiculos,
  config,
  urlFilter
}: OrdensServicoProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [isOSMaximized, setIsOSMaximized] = useState(false);
  const [showDanfePreview, setShowDanfePreview] = useState(false);
  const [danfeOS, setDanfeOS] = useState<OrdemServico | null>(null);

  const [internalFilter, setInternalFilter] = useState<string | null>(null);
  const [osSearchField, setOsSearchField] = useState("");

  // Sync prop filter to internal state
  useEffect(() => {
    if (urlFilter) {
      setInternalFilter(urlFilter);
    } else {
      const params = new URLSearchParams(window.location.search);
      const directFilter = params.get("filter") || params.get("filtro");
      if (directFilter) {
        setInternalFilter(directFilter);
      } else {
        setInternalFilter(null);
      }
    }
  }, [urlFilter]);

  const handleUpdateOSEvidences = (evidences: ServiceEvidence[]) => {
    if (!selectedOS) return;
    const updatedOS = { ...selectedOS, evidences };
    const updatedOrdens = ordens.map(o => o.id === selectedOS.id ? updatedOS : o);
    onUpdateOrdens(updatedOrdens);
    setSelectedOS(updatedOS);
  };

  // Form states
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [mecanicoId, setMecanicoId] = useState("");
  const [kmAtual, setKmAtual] = useState("");
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [servicosRealizados, setServicosRealizados] = useState("");
  const [valorMaoDeObra, setValorMaoDeObra] = useState("0");

  // Autocomplete query search state for customer selection
  const [clientSearch, setClientSearch] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Quick Client on-the-fly shortcut form states
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [qcNome, setQcNome] = useState("");
  const [qcEmail, setQcEmail] = useState("");
  const [qcTelefone, setQcTelefone] = useState("");
  const [qcCpfCnpj, setQcCpfCnpj] = useState("");
  const [qcTipo, setQcTipo] = useState<"PF" | "PJ">("PF");
  const [qcDataNascimento, setQcDataNascimento] = useState("");
  const [qcEndereco, setQcEndereco] = useState("");

  // Optional quick first vehicle binding
  const [qcIncludeVehicle, setQcIncludeVehicle] = useState(true);
  const [qvPlaca, setQvPlaca] = useState("");
  const [qvMarca, setQvMarca] = useState("");
  const [qvModelo, setQvModelo] = useState("");
  const [qvAno, setQvAno] = useState("");

  // Search queries for vehicle and parts
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [partSearchQuery, setPartSearchQuery] = useState("");

  // Quick Vehicle Registration form states (shortcut inside OS builder)
  const [showQuickVehicleForm, setShowQuickVehicleForm] = useState(false);
  const [qvePlaca, setQvePlaca] = useState("");
  const [qveMarca, setQveMarca] = useState("");
  const [qveModelo, setQveModelo] = useState("");
  const [qveAno, setQveAno] = useState("");
  const [qveMotor, setQveMotor] = useState("");
  const [qveCor, setQveCor] = useState("");
  const [qveKm, setQveKm] = useState("");
  const [qveChassi, setQveChassi] = useState("");
  const [qveRenavam, setQveRenavam] = useState("");
  const [qveMunicipio, setQveMunicipio] = useState("");
  const [qveUf, setQveUf] = useState("");
  const [qveDetranLoading, setQveDetranLoading] = useState(false);
  const [qveDetranNotice, setQveDetranNotice] = useState("");

  // Quick Part Registration States
  const [showQuickPartForm, setShowQuickPartForm] = useState(false);
  const [qpSku, setQpSku] = useState("");
  const [qpDescricao, setQpDescricao] = useState("");
  const [qpFabricante, setQpFabricante] = useState("");
  const [qpEstoque, setQpEstoque] = useState("5");
  const [qpPrecoCusto, setQpPrecoCusto] = useState("");
  const [qpPrecoVenda, setQpPrecoVenda] = useState("");

  // Print & Sharing states
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false);
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [sharePhone, setSharePhone] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [simulatingSend, setSimulatingSend] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Interactive Closing (Fechar OS) wizard states
  const [activeCheckoutOSId, setActiveCheckoutOSId] = useState<string | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo" | "">("");
  const [checkoutSelectedDoc, setCheckoutSelectedDoc] = useState<"nfe" | "cupom" | "imprimir" | "">("");
  const [checkoutDiscount, setCheckoutDiscount] = useState<string>("0");
  const [checkoutSplitPayments, setCheckoutSplitPayments] = useState<Record<string, number>>({
    "Dinheiro": 0,
    "Pix": 0,
    "Débito": 0,
    "Crédito": 0,
    "Crédito Parcelado": 0,
  });
  const [checkoutInstallments, setCheckoutInstallments] = useState<number>(1);

  useEffect(() => {
    if (showPrintPreview) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showPrintPreview]);

  useEffect(() => {
    if (showDanfePreview) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showDanfePreview]);

  // Quick form phone and document mask helpers
  const handleQcPhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.length > 11) clean = clean.slice(0, 11);
    if (clean.length <= 2) {
      setQcTelefone(clean);
    } else if (clean.length <= 7) {
      setQcTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    } else {
      setQcTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`);
    }
  };

  const handleQcCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.length > 14) clean = clean.slice(0, 14);

    if (clean.length <= 11) {
      if (clean.length <= 3) setQcCpfCnpj(clean);
      else if (clean.length <= 6) setQcCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3)}`);
      else if (clean.length <= 9) setQcCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`);
      else setQcCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`);
    } else {
      if (clean.length <= 12) setQcCpfCnpj(`${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`);
      else setQcCpfCnpj(`${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`);
    }
  };

  // Quick form submit
  const handleQuickCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcNome.trim() || !qcTelefone.trim() || !qcCpfCnpj.trim() || !qcEndereco.trim() || !qcDataNascimento) {
      setFormError("Nome, Telefone, CPF/CNPJ, Endereço e Data de Nascimento do cliente são de preenchimento obrigatório para cadastrar!");
      return;
    }

    if (qcIncludeVehicle && (!qvPlaca.trim() || !qvMarca.trim() || !qvModelo.trim() || !qvAno.trim())) {
      setFormError("Para incluir o veículo, os campos Placa, Marca, Modelo e Ano são obrigatórios!");
      return;
    }

    if (!onUpdateClientes) {
      setFormError("Interface de gravação de clientes indisponível de forma global.");
      return;
    }

    const cleanProposed = qcCpfCnpj.replace(/\D/g, "");
    if (cleanProposed) {
      const exists = clientes.some(c => {
        const cleanExisting = c.cpfCnpj.replace(/\D/g, "");
        if (cleanProposed.length >= 11 && cleanExisting.length >= 11) {
          return cleanExisting === cleanProposed;
        }
        return c.cpfCnpj.trim().toLowerCase() === qcCpfCnpj.trim().toLowerCase();
      });
      if (exists) {
        setFormError("Erro: Já existe um cliente cadastrado com este CPF/CNPJ!");
        return;
      }
    }

    const newClientId = "cli_" + Date.now();
    const newClientObj: Cliente = {
      id: newClientId,
      nome: qcNome,
      email: qcEmail || "sem@email.com",
      telefone: qcTelefone,
      cpfCnpj: qcCpfCnpj,
      endereco: qcEndereco,
      dataNascimento: qcDataNascimento,
      tipo: qcTipo || (qcCpfCnpj.replace(/\D/g, "").length > 11 ? "PJ" : "PF")
    };

    onUpdateClientes([...clientes, newClientObj]);

    // Also register vehicle if requested
    if (qcIncludeVehicle && onUpdateVeiculos) {
      const newVehicleId = "vei_" + (Date.now() + 1);
      const newVehicleObj: Veiculo = {
        id: newVehicleId,
        clienteId: newClientId,
        placa: qvPlaca.toUpperCase().trim(),
        marca: qvMarca,
        modelo: qvModelo,
        ano: qvAno,
        motor: "1.0",
        cor: "Prata",
        km: 0
      };
      onUpdateVeiculos([...veiculos, newVehicleObj]);
      setVeiculoId(newVehicleId); // select the vehicle as active for this OS
    }

    // Set selected client
    setClienteId(newClientId);

    // Reset quick form state
    setQcNome("");
    setQcEmail("");
    setQcTelefone("");
    setQcCpfCnpj("");
    setQcTipo("PF");
    setQcDataNascimento("");
    setQcEndereco("");
    setQvPlaca("");
    setQvMarca("");
    setQvModelo("");
    setQvAno("");
    setQcIncludeVehicle(true);
    setShowQuickClientForm(false);
    setClientSearch("");
    setFormError("");
  };

  const handleQuickCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qpSku.trim() || !qpDescricao.trim() || !qpFabricante.trim() || !qpPrecoVenda) {
      setFormError("Erro: SKU, Descrição, Fabricante e Preço de Venda da peça são obrigatórios para o cadastro rápido!");
      return;
    }

    const salePrice = Number(qpPrecoVenda);
    if (isNaN(salePrice) || salePrice <= 0) {
      setFormError("Erro: O preço de venda deve ser um número maior que zero.");
      return;
    }

    const costPrice = Number(qpPrecoCusto) || 0;
    const stockQty = Number(qpEstoque) || 0;

    const newPartId = "pec_" + Date.now();
    const newPart: Peca = {
      id: newPartId,
      sku: qpSku.toUpperCase().trim(),
      descricao: qpDescricao.trim(),
      fabricante: qpFabricante.trim(),
      estoque: stockQty,
      precoCusto: costPrice,
      precoVenda: salePrice
    };

    onUpdatePecas([...pecas, newPart]);
    
    // Automatically select the newly created part for addition
    setPecaIdAdicionar(newPartId);

    // Clear fast form inputs
    setQpSku("");
    setQpDescricao("");
    setQpFabricante("");
    setQpEstoque("5");
    setQpPrecoCusto("");
    setQpPrecoVenda("");
    setShowQuickPartForm(false);
    setPartSearchQuery(""); // Clear search filter so the new item shows up
    setFormError("");
  };

  const handleQuickDetranSync = async () => {
    if (!qvePlaca.trim()) {
      setFormError("Erro: É necessário digitar a PLACA para consultar o DETRAN.");
      return;
    }
    setFormError("");
    setQveDetranNotice("");
    setQveDetranLoading(true);

    try {
      const data = await simulateDetranAPI(qvePlaca);
      setQveMarca(data.marca);
      setQveModelo(data.modelo);
      setQveAno(data.ano);
      setQveMotor(data.motor);
      setQveCor(data.cor);
      setQveChassi(data.chassi || "");
      setQveRenavam(data.renavam || "");
      setQveMunicipio(data.municipio || "");
      setQveUf(data.uf || "");

      if (data.api_status === "simulated") {
        if (data.api_error && (data.api_error.includes("APIBRASIL_TOKEN") || data.api_error.includes("Secrets"))) {
          setQveDetranNotice("⚠️ A APIBrasil paga não está configurada nos Secrets da aplicação. Dados fictícios realistas gerados por simulação.");
        } else {
          setQveDetranNotice(`⚠️ A APIBrasil retornou falha (${data.api_error || "Limite/Saldo"}). Dados gerados por simulação no sistema.`);
        }
      } else {
        setQveDetranNotice(`✅ Veículo real consultado com sucesso na base de dados oficial via ${data.api_source === "apibrasil_pago" ? "APIBrasil Agregados" : "API Placas FIPE"}!`);
      }
    } catch (err) {
      setFormError("Erro de comunicação com o sistema de consulta de placas.");
    } finally {
      setQveDetranLoading(false);
    }
  };

  const handleQuickCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setFormError("Erro: Por favor, selecione ou cadastre um cliente primeiro para associar o veículo.");
      return;
    }
    if (!qvePlaca.trim() || !qveMarca.trim() || !qveModelo.trim() || !qveAno.trim()) {
      setFormError("Erro: Placa, Marca, Modelo e Ano são preenchimentos obrigatórios para o cadastro rápido do veículo.");
      return;
    }

    const plateExists = veiculos.some(v => v.placa.toUpperCase() === qvePlaca.toUpperCase().trim());
    if (plateExists) {
      setFormError("Erro: Já existe um veículo registrado com esta placa no sistema!");
      return;
    }

    const newV: Veiculo = {
      id: "vei_" + Date.now(),
      clienteId: clienteId,
      placa: qvePlaca.toUpperCase().trim(),
      marca: qveMarca.trim(),
      modelo: qveModelo.trim(),
      ano: qveAno.trim(),
      motor: qveMotor.trim() || "1.0",
      cor: qveCor.trim() || "Prata",
      km: Number(qveKm) || 0,
      chassi: qveChassi.trim() || undefined,
      renavam: qveRenavam.trim() || undefined,
      municipio: qveMunicipio.trim() || undefined,
      uf: qveUf.trim() || undefined,
    };

    if (onUpdateVeiculos) {
      onUpdateVeiculos([...veiculos, newV]);
    }
    
    // Automatically bind the newly registered vehicle
    setVeiculoId(newV.id);

    // Reset quick form state
    setQvePlaca("");
    setQveMarca("");
    setQveModelo("");
    setQveAno("");
    setQveMotor("");
    setQveCor("");
    setQveKm("");
    setQveChassi("");
    setQveRenavam("");
    setQveMunicipio("");
    setQveUf("");
    setQveDetranNotice("");
    setShowQuickVehicleForm(false);
    setVehicleSearchQuery(""); // Clear search so newly added vehicle shows up instantly
    setFormError("");
  };

  const initWhatsAppShare = (os: OrdemServico) => {
    const client = clientes.find(c => c.id === os.clienteId);
    const vehicle = veiculos.find(v => v.id === os.veiculoId);
    
    const clientName = client?.nome || "Cliente";
    const clientPhone = client?.telefone || "";
    const vehicleName = vehicle ? `${vehicle.marca} ${vehicle.modelo} [${vehicle.placa}]` : "Veículo";
    
    // Build list of parts
    const partsList = os.pecasUtilizadas.map(item => {
      const spec = pecas.find(p => p.id === item.pecaId);
      return `• ${item.quantidade}x ${spec?.descricao || "Peça"} e insumos - Valor Un: ${formatCurrency(item.precoUnitario)}`;
    }).join("\n");
    
    const formattedTotal = formatCurrency(os.valorTotal);
    const formattedLabor = formatCurrency(os.valorMaoDeObra);
    const formattedPartsTotal = formatCurrency(os.valorTotal - os.valorMaoDeObra);

    const text = `🔧 *ORÇAMENTO DE SERVIÇOS - KARTER'OS* 🔧\n\n` + 
                 `Prezado(a) *${clientName}*,\n` + 
                 `Seguem os detalhes e custos estimativos referentes à Ordem de Serviço *#${os.id.toUpperCase()}*:\n\n` +
                 `🚘 *Veículo registrado:* ${vehicleName}\n` +
                 `📊 *Sintoma/Problema:* "${os.descricaoProblema}"\n\n` +
                 `🛠️ *Peças e Insumos necessários:*\n${partsList || "Nenhuma peça/insumo físico listado."}\n\n` +
                 `📈 *Total Mão de Obra Técnica:* ${formattedLabor}\n` +
                 `📦 *Total Insumos/Peças:* ${formattedPartsTotal}\n` +
                 `💰 *VALOR TOTAL CONSOLIDADO:* ${formattedTotal}\n\n` +
                 `Ficamos à sua inteira disposição para aprovação da realização do serviço! Caso concorde, basta nos sinalizar por aqui. Obrigado pela preferência!`;
    
    // Clean phone of non-numeric characters for link
    const numericPhone = clientPhone.replace(/\D/g, "");
    setSharePhone(numericPhone ? (numericPhone.startsWith("55") ? numericPhone : "55" + numericPhone) : "");
    setShareMessage(text);
    setShowWhatsAppShare(true);
    setSendSuccess(false);
    setFormError("");
  };

  const initEmailShare = (os: OrdemServico) => {
    const client = clientes.find(c => c.id === os.clienteId);
    const vehicle = veiculos.find(v => v.id === os.veiculoId);
    
    const clientName = client?.nome || "Cliente";
    const clientEmail = client?.email || "";
    const vehicleName = vehicle ? `${vehicle.marca} ${vehicle.modelo} [${vehicle.placa}]` : "Veículo";
    
    const partsList = os.pecasUtilizadas.map(item => {
      const spec = pecas.find(p => p.id === item.pecaId);
      return `- ${item.quantidade}x ${spec?.descricao || "Peça"} - Unitário: ${formatCurrency(item.precoUnitario)} - Subtotal: ${formatCurrency(item.quantidade * item.precoUnitario)}`;
    }).join("\n");
    
    const formattedTotal = formatCurrency(os.valorTotal);
    const formattedLabor = formatCurrency(os.valorMaoDeObra);
    const formattedPartsTotal = formatCurrency(os.valorTotal - os.valorMaoDeObra);

    const emailBody = `Prezado(a) ${clientName},\n\n` +
                     `Apresentamos abaixo o orçamento detalhado referente aos serviços mecânicos de diagnóstico e reparação no seu veículo em nossa oficina.\n\n` +
                     `==================================================\n` +
                     `DETALHES DO ORÇAMENTO - #${os.id.toUpperCase()}\n` +
                     `==================================================\n` +
                     `• Veículo: ${vehicleName}\n` +
                     `• Diagnóstico Inicial / Sintoma: ${os.descricaoProblema}\n\n` +
                     `RELAÇÃO DE INSUMOS E PEÇAS DE SUBISTITUIÇÃO:\n` +
                     `${partsList || "Nenhuma peça/insumo utilizado."}\n\n` +
                     `RESUMO DOS VALORES:\n` +
                     `- Mão de Obra Técnica: ${formattedLabor}\n` +
                     `- Insumos e Peças: ${formattedPartsTotal}\n` +
                     `==================================================\n` +
                     `VALOR TOTAL DO SERVIÇO: ${formattedTotal}\n` +
                     `==================================================\n\n` +
                     `Para autorizar o início dos serviços ou em caso de quaisquer esclarecimentos adicionais, favor responder a este e-mail ou fazer contato telefônico.\n\n` +
                     `Agradecemos enormemente pela confiança e preferência!\n\n` +
                     `Atenciosamente,\n` +
                     `Equipe de Atendimento - Karter\'OS`;

    setShareEmail(clientEmail);
    setShareMessage(emailBody);
    setShowEmailShare(true);
    setSendSuccess(false);
    setFormError("");
  };

  const handleExecuteSystemPrint = (os: OrdemServico) => {
    const client = clientes.find(c => c.id === os.clienteId);
    const vehicle = veiculos.find(v => v.id === os.veiculoId);
    
    const clientName = client?.nome || "Não cadastrado";
    const clientCpf = client?.cpfCnpj || "Não cadastrado";
    const clientPhone = client?.telefone || "Não cadastrado";
    const clientEmail = client?.email || "Não informado";
    const clientAddress = client?.endereco || "Não informado";

    const vehicleModel = vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "Não cadastrado";
    const vehiclePlate = vehicle?.placa || "Sem placa";
    const vehicleYear = vehicle?.ano || "Não informado";
    const vehicleSpec = vehicle ? `${vehicle.motor} - ${vehicle.cor}` : "Não informado";
    const kmInput = os.kmAtual.toLocaleString();

    // Relação de Peças
    const partsRows = os.pecasUtilizadas.map(item => {
      const partSpec = pecas.find(p => p.id === item.pecaId);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; color: #334155;">
          <td style="padding: 8px 0; font-size: 11px;">${partSpec?.descricao || "Peça de Reposição"} [${partSpec?.sku || "SKU-N/A"}]</td>
          <td style="padding: 8px 0; font-size: 11px;">${partSpec?.fabricante || "-"}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: center;">${item.quantidade}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: right;">${formatCurrency(item.precoUnitario)}</td>
          <td style="padding: 8px 0; font-size: 11px; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(item.quantidade * item.precoUnitario)}</td>
        </tr>
      `;
    }).join("");

    const partsTotal = os.valorTotal - os.valorMaoDeObra;
    const mechanicName = getMecanicoNome(os.mecanicoId);

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orçamento #${os.id.toUpperCase()} - Karter'OS</title>
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
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${config?.logoUrl && config?.showLogoInOS !== false ? `
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
              <div style="font-weight: 900; font-size: 11px; color: #0f172a; margin-bottom: 4px;">ORÇAMENTO DE SERVIÇO #${os.id.toUpperCase()}</div>
              <div>Data de Emissão: ${os.dataAbertura}</div>
              <div>Telefone: ${config?.telefone || "(11) 98765-4321"}</div>
              <div>E-mail: ${config?.email || "contato@karteros.com.br"} | São Paulo - SP</div>
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
              <p style="margin: 4px 0;"><strong>KM Entrada:</strong> ${kmInput} KM</p>
            </td>
          </tr>
        </table>

        <div class="symptom-box">
          <h3 class="card-title" style="margin-bottom: 6px;">Sintomas & Reclamações Apresentadas</h3>
          <p style="margin: 0; font-style: italic; color: #334155;">"${os.descricaoProblema}"</p>
        </div>

        <h3 class="card-title" style="border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px;">Relação de Peças & Componentes Utilizados</h3>
        ${os.pecasUtilizadas.length === 0 ? `
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
          <div class="summary-row">Serviços Técnicos / Mão de Obra: <strong>${formatCurrency(os.valorMaoDeObra)}</strong></div>
          <div class="total-row">
            <div style="font-size: 10px; text-transform: uppercase; color: #475569; font-weight: bold; margin-bottom: 2px;">Valor Total do Serviço</div>
            <div>${formatCurrency(os.valorTotal)}</div>
          </div>
        </div>

        <table class="signatures">
          <tr>
            <td class="signature-line">
              <div class="signature-bar"></div>
              <div style="font-weight: bold;">${mechanicName}</div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em;">Mecânico Especialista</div>
            </td>
            <td style="width: 16%;"></td>
            <td class="signature-line">
              <div class="signature-bar"></div>
              <div style="font-weight: bold;">${clientName}</div>
              <div style="color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em;">Cliente Autorizador</div>
            </td>
          </tr>
        </table>

        <div class="disclaimer">
          Este documento constitui um orçamento prévio válido por 10 dias de acordo com o Art. 40 do Código de Defesa do Consumidor brasileiro.<br />
          Karter'OS Gestão e Controle - Criado via AI Studio
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

  const handleExecuteDanfePrint = (os: OrdemServico) => {
    const danfeCliente = clientes.find(c => c.id === os.clienteId);
    const danfeVeiculo = veiculos.find(v => v.id === os.veiculoId);
    const danfeMecanico = mecanicos.find(m => m.id === os.mecanicoId);
    const danfePecas = os.pecasUtilizadas || [];
    const danfeServicos = os.servicosDetalhados || [];
    
    const totalPecas = danfePecas.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
    const totalServicos = os.valorMaoDeObra || 0;
    const desconto = os.fechamentoAdm?.desconto || 0;
    const totalLiquido = Math.max(0, os.valorTotal - desconto);
    
    // Format date beautifully
    const emissionDate = os.dataConclusao 
      ? os.dataConclusao.split("-").reverse().join("/") 
      : new Date().toLocaleDateString("pt-BR");
      
    const randomChave = os.nfeChave || "3523064508930100010555001" + Math.floor(100000000 + Math.random() * 900000000) + "103829104";

    const productRowsHtml = danfePecas.map((item, idx) => {
      const original = getPecaDetail(item.pecaId);
      const partsSku = original?.sku || `SKU-${item.pecaId.slice(0,4).toUpperCase()}`;
      const partsDesc = original?.descricao || "PEÇA AUTOMOTIVA / INSUMO";
      const partsValUnit = item.precoUnitario.toFixed(2).replace(".", ",");
      const partsTotal = (item.quantidade * item.precoUnitario).toFixed(2).replace(".", ",");

      return `
        <tr style="border-bottom: 1px solid #000;">
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">${partsSku}</td>
          <td style="padding: 3px; border-right: 1px solid #000; font-weight: bold; text-transform: uppercase;">${partsDesc}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">8708.29.99</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">0102</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">5102</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">UN</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">${item.quantidade}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right;">R$ ${partsValUnit}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; font-weight: bold;">R$ ${partsTotal}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; text-align: center; color: #555;">0%</td>
        </tr>
      `;
    }).join("");

    let serviceRowsHtml = "";
    if (danfeServicos.length > 0) {
      serviceRowsHtml = danfeServicos.map((srv, idx) => {
        const srvDesc = srv.descricao;
        const srvVal = srv.valor.toFixed(2).replace(".", ",");
        return `
          <tr style="border-bottom: 1px solid #000; background-color: #f9fafb;">
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">SRV-0${idx+1}</td>
            <td style="padding: 3px; border-right: 1px solid #000; font-weight: bold; text-transform: uppercase;">REPARAÇÕES AUTOMOTIVAS: ${srvDesc}</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">-</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">0400</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">5933</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">SV</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">1</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: right;">R$ ${srvVal}</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: right; font-weight: bold;">R$ ${srvVal}</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
            <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
            <td style="padding: 3px; text-align: center; color: #555;">0%</td>
          </tr>
        `;
      }).join("");
    } else if (totalServicos > 0) {
      serviceRowsHtml = `
        <tr style="border-bottom: 1px solid #000; background-color: #f9fafb;">
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">SRV-01</td>
          <td style="padding: 3px; border-right: 1px solid #000; font-weight: bold; text-transform: uppercase;">SERVIÇOS TÉCNICOS INTEGRADOS DE MÃO DE OBRA MECÂNICA GERAL EM VEÍCULO</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">-</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">0400</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">5933</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">SV</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: center;">1</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right;">R$ ${totalServicos.toFixed(2).replace(".", ",")}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; font-weight: bold;">R$ ${totalServicos.toFixed(2).replace(".", ",")}</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; border-right: 1px solid #000; text-align: right; color: #555;">0,00</td>
          <td style="padding: 3px; text-align: center; color: #555;">0%</td>
        </tr>
      `;
    }

    let pagamentoHtml = "";
    if (os.fechamentoAdm?.valoresPagoSplit) {
      const keys = Object.keys(os.fechamentoAdm.valoresPagoSplit).filter(
        (m) => (os.fechamentoAdm?.valoresPagoSplit?.[m] || 0) > 0
      );
      if (keys.length > 0) {
        pagamentoHtml = keys.map((method) => {
          const val = os.fechamentoAdm?.valoresPagoSplit?.[method] || 0;
          return `
            <div style="border: 1px solid #ccc; border-radius: 4px; padding: 2px 6px; background: #f9fafb; display: inline-block; margin-right: 8px; font-size: 8px;">
              <span style="font-weight: bold; color: #555; text-transform: uppercase;">${method}:</span>
              <strong style="color: #000; font-family: monospace;">R$ ${val.toFixed(2).replace(".", ",")}</strong>
            </div>
          `;
        }).join("");
      }
    }
    if (!pagamentoHtml) {
      pagamentoHtml = `
        <div style="border: 1px solid #ccc; border-radius: 4px; padding: 2px 6px; background: #f9fafb; display: inline-block; margin-right: 8px; font-size: 8px;">
          <span style="font-weight: bold; color: #555; text-transform: uppercase;">Forma:</span>
          <strong>${os.fechamentoAdm?.formaPagamento || "Dinheiro"} - R$ ${totalLiquido.toFixed(2).replace(".", ",")}</strong>
        </div>
      `;
    }

    if (os.fechamentoAdm?.parcelasCredito && os.fechamentoAdm.parcelasCredito > 1) {
      const creditVal = os.fechamentoAdm?.valoresPagoSplit?.["Crédito"] || os.fechamentoAdm?.valoresPagoSplit?.["Crédito Parcelado"] || totalLiquido;
      const calcParc = (creditVal / os.fechamentoAdm.parcelasCredito).toFixed(2).replace(".", ",");
      pagamentoHtml += `
        <div style="border: 1px solid #f59e0b; border-radius: 4px; padding: 2px 6px; background: #fef3c7; display: inline-block; font-size: 8px; color: #b45309;">
          <span style="font-weight: bold; text-transform: uppercase;">Parcelamento:</span>
          <strong>${os.fechamentoAdm?.parcelasCredito}x de R$ ${calcParc}</strong>
        </div>
      `;
    }

    const printHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>DANFE - NF-e #${randomChave.slice(-14, -5)}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
            font-size: 9px;
            line-height: 1.25;
          }
          .border-black { border: 1px solid #000; }
          .border-b-black { border-bottom: 1px solid #000; }
          .border-r-black { border-right: 1px solid #000; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .p-1 { padding: 4px; }
          .p-2 { padding: 8px; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding: 3px;
          }
          td {
            padding: 3px;
          }
          
          @media print {
            body { padding: 0; margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <!-- 1. SE RECEBIMENTO SLIP (COMPROVANTE DE RECEBIMENTO) -->
        <div class="border-black mb-1 p-1" style="display: grid; grid-template-columns: 9fr 3fr; font-size: 8px;">
          <div class="border-r-black font-bold" style="padding-right: 5px;">
            RECEBEMOS DE <span class="uppercase">${config?.nomeOficina || "oficina mecânica karter"}</span> OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO. EMISSÃO: ${emissionDate} - VALOR TOTAL: R$ ${totalLiquido.toFixed(2).replace(".", ",")}
          </div>
          <div class="text-center" style="display: flex; flex-direction: column; justify-content: center;">
            <span class="font-bold">NF-e</span>
            <span class="font-bold" style="font-size: 10px;">Nº ${randomChave.slice(-14, -5)}</span>
            <span>Série 1</span>
          </div>
        </div>
        
        <div class="border-black mb-2 p-1" style="display: grid; grid-template-columns: 3fr 9fr; font-size: 8px;">
          <div class="border-r-black" style="height: 25px;">
            <div style="font-size: 7px; color: #555;">DATA DE RECEBIMENTO</div>
          </div>
          <div style="height: 25px;">
            <div style="font-size: 7px; color: #555;">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</div>
          </div>
        </div>

        <!-- 2. EMISSOR, IDENTIFICACAO DANFE, BARCODE -->
        <div class="border-black mb-1" style="display: grid; grid-template-columns: 5fr 3fr 4fr;">
          <!-- Emissor -->
          <div class="border-r-black p-1" style="display: flex; align-items: center; gap: 8px;">
            ${config?.logoUrl && config?.showLogoInNF !== false ? `
              <img src="${config.logoUrl}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; border: 1px solid #ccc; padding: 2px;" referrerPolicy="no-referrer" />
            ` : `
              <div style="width: 55px; height: 55px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; background: #eee; font-weight: bold; font-size: 8px;">LOGO</div>
            `}
            <div style="flex: 1; min-width: 0;">
              <h1 style="font-size: 10px; font-weight: bold; margin: 0; text-transform: uppercase;">${config?.nomeOficina || "KARTER'OS MECÂNICA AUTOMOTIVA"}</h1>
              <p style="font-size: 7.5px; margin: 2px 0 0 0; font-weight: bold;">${config?.endereco || "RUA DAS FLORES, 150 - CENTRO - SÃO PAULO/SP"}</p>
              <p style="font-size: 7.5px; margin: 2px 0 0 0;">CEP: 01310-200 | Tel: ${config?.telefone || "(11) 98765-4321"}</p>
              <p style="font-size: 7.5px; margin: 2px 0 0 0; font-weight: bold;">E-mail: ${config?.email || "contato@karteros.com"}</p>
            </div>
          </div>

          <!-- Danfe indicator block -->
          <div class="border-r-black text-center" style="display: flex; flex-direction: column; justify-content: space-between; padding: 4px;">
            <div>
              <h2 style="font-size: 12px; font-weight: bold; margin: 0; letter-spacing: 2px;">DANFE</h2>
              <p style="font-size: 7px; color: #444; margin: 2px 0; font-weight: bold; line-height: 1.1;">DOCUMENTO AUXILIAR DA<br/>NOTA FISCAL ELETRÔNICA</p>
            </div>
            <div style="display: flex; justify-content: space-around; align-items: center; font-size: 8px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 2px 0;">
              <span style="font-size: 6.5px; line-height: 1.1;">0 - ENTRADA<br/>1 - SAÍDA</span>
              <div style="border: 1px solid #000; font-weight: bold; padding: 2px 6px; background: #f3f4f6; font-size: 10px;">1</div>
            </div>
            <div>
              <p style="font-weight: bold; font-size: 10px; margin: 0;">Nº ${randomChave.slice(-14, -5)}</p>
              <p style="font-size: 7.5px; margin: 0; font-weight: bold;">SÉRIE: 1 - PÁG: 1/1</p>
            </div>
          </div>

          <!-- Barcode and Chave de Acesso -->
          <div class="p-1" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: flex-end; height: 26px; justify-content: center; background: #fff;">
              ${Array.from({ length: 32 }).map((_, i) => {
                const width = (i % 3 === 0) ? 2 : (i % 4 === 0) ? 3 : 1;
                const margin = (i % 5 === 0) ? 2 : 0;
                return `<span style="display: inline-block; background: #000; height: 100%; width: ${width}px; margin-right: ${margin}px;"></span>`;
              }).join("")}
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block; text-transform: uppercase;">CHAVE DE ACESSO</span>
              <span style="font-family: monospace; font-size: 8px; font-weight: bold; word-break: break-all; text-align: center; display: block; border: 1px solid #ccc; padding: 2px; background: #f9fafb;">
                ${randomChave.replace(/(.{4})/g, "$1 ")}
              </span>
            </div>
            <div style="font-size: 7px; text-align: center; border-top: 1px solid #eee; margin-top: 3px; padding-top: 2px; color: #555; font-weight: bold;">
              Consulta de autenticidade no site nacional da NF-e
            </div>
          </div>
        </div>

        <!-- 3. NATUREZA DA OPERACAO, PROTOCOLO -->
        <table class="border-black mb-1" style="border-collapse: collapse; font-size: 8px;">
          <tr>
            <td class="border-r-black" style="width: 50%; padding: 4px;">
              <span style="font-size: 6px; color: #555; display: block;">NATUREZA DA OPERAÇÃO</span>
              <span style="font-weight: bold; font-size: 9px; text-transform: uppercase;">VENDA DE AUTOPEÇAS E PRESTAÇÃO DE SERVIÇOS</span>
            </td>
            <td style="width: 50%; padding: 4px;">
              <span style="font-size: 6px; color: #555; display: block;">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
              <span style="font-weight: bold; font-size: 9px;">1352600293883 ${emissionDate} 10:14:45</span>
            </td>
          </tr>
        </table>

        <div class="border-black mb-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; font-size: 8px;">
          <div class="border-r-black p-1">
            <span style="font-size: 6px; color: #555; display: block;">INSCRIÇÃO ESTADUAL</span>
            <span style="font-weight: bold;">260247227</span>
          </div>
          <div class="border-r-black p-1">
            <span style="font-size: 6px; color: #555; display: block;">INSC. ESTADUAL DO SUBST. TRIB.</span>
            <span style="font-weight: bold;">ISENTO</span>
          </div>
          <div class="p-1">
            <span style="font-size: 6px; color: #555; display: block;">CNPJ DO EMISSOR</span>
            <span style="font-weight: bold;">45.089.301/0001-05</span>
          </div>
        </div>

        <!-- 4. DESTINATÁRIO / REMETENTE -->
        <div class="border-black mb-1">
          <div style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">DESTINATÁRIO / REMETENTE</div>
          <div style="display: grid; grid-template-columns: 7fr 3fr 2fr; font-size: 8px; padding: 4px; gap: 4px;">
            <div>
              <span style="font-size: 6px; color: #555; display: block;">NOME / RAZÃO SOCIAL</span>
              <span style="font-weight: bold; font-size: 9px; text-transform: uppercase;">${danfeCliente?.nome || "CLIENTE CONSUMIDOR FINAL"}</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">CNPJ / CPF</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeCliente?.cpfCnpj || "000.000.000-00"}</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">DATA EMISSÃO</span>
              <span style="font-weight: bold;">${emissionDate}</span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 6fr 3fr 2fr 1fr; font-size: 8px; padding: 4px; gap: 4px; border-top: 1px solid #eee;">
            <div>
              <span style="font-size: 6px; color: #555; display: block;">ENDEREÇO</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeCliente?.endereco || "Rua Geral da Oficina Motora"}</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">BAIRRO / DISTRITO</span>
              <span style="font-weight: bold; text-transform: uppercase;">CENTRO</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">CEP</span>
              <span style="font-weight: bold;">89810-250</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">UF</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeVeiculo?.uf || "SP"}</span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 5fr 3fr 4fr; font-size: 8px; padding: 4px; gap: 4px; border-top: 1px solid #eee;">
            <div>
              <span style="font-size: 6px; color: #555; display: block;">MUNICÍPIO</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeVeiculo?.municipio || "São Paulo"}</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">FONE / FAX</span>
              <span style="font-weight: bold;">${danfeCliente?.telefone || "(11) 90000-1111"}</span>
            </div>
            <div>
              <span style="font-size: 6px; color: #555; display: block;">INSCRIÇÃO ESTADUAL</span>
              <span style="font-weight: bold;">ISENTO</span>
            </div>
          </div>
        </div>

        <!-- 5. FATURA / DUPLICATAS -->
        <div class="border-black mb-1">
          <div style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">DADOS DE PAGAMENTOS E FATURA</div>
          <div style="padding: 4px;">
            ${pagamentoHtml}
          </div>
        </div>

        <!-- 6. CÁLCULO DO IMPOSTO -->
        <div class="border-black mb-1" style="font-size: 8px;">
          <div style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">CÁLCULO DO IMPOSTO</div>
          <div style="display: grid; grid-template-columns: repeat(9, 1fr); text-align: center; border-bottom: 1px solid #000;">
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">BASE CÁLC. ICMS</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO ICMS</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">BASE CÁLC. ICMS ST</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO ICMS ST</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">V. IMP. IMPORTAÇÃO</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">V. ICMS UF REMET.</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO FCP</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO PIS</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="p-1" style="background: #f9fafb;">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">V. TOTAL PRODUTOS</span>
              <span style="font-weight: bold; font-family: monospace;">R$ ${totalPecas.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(9, 1fr); text-align: center;">
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO FRETE</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO SEGURO</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1" style="background-color: #fef2f2;">
              <span style="font-size: 5px; color: #991b1b; display: block; font-weight: bold; white-space: nowrap;">DESCONTO</span>
              <span style="font-weight: bold; color: #dc2626; font-family: monospace;">R$ ${desconto.toFixed(2).replace(".", ",")}</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">OUTRAS DESPESAS</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">VALOR DO IPI</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">V. ICMS UF DEST.</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">TRIBUTOS APROX.</span>
              <span style="font-weight: bold; font-family: monospace;">R$ ${(totalLiquido * 0.1345).toFixed(2).replace(".", ",")}</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block; white-space: nowrap;">COFINS</span>
              <span style="font-weight: bold;">R$ 0,00</span>
            </div>
            <div class="p-1" style="background-color: #e5e7eb; font-weight: bold;">
              <span style="font-size: 5.5px; display: block; white-space: nowrap;">V. TOTAL DA NOTA</span>
              <span style="font-weight: bold; font-size: 10px; font-family: monospace;">R$ ${totalLiquido.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        <!-- 7. TRANSPORTADOR / VOLUMES TRANSPORTADOS -->
        <table class="border-black mb-1" style="font-size: 8px;">
          <tr>
            <td colspan="6" style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">TRANSPORTADOR / VOLUMES TRANSPORTADOS</td>
          </tr>
          <tr>
            <td class="border-r-black" style="width: 35%;">
              <span style="font-size: 5px; color: #555; display: block;">RAZÃO SOCIAL</span>
              <span style="font-weight: bold; text-transform: uppercase;">O PRÓPRIO ADQUIRENTE</span>
            </td>
            <td class="border-r-black" style="width: 25%;">
              <span style="font-size: 5px; color: #555; display: block;">FRETE POR CONTA</span>
              <span style="font-weight: bold; text-transform: uppercase;">9 - SEM FRETE (RETIRADA)</span>
            </td>
            <td class="border-r-black" style="width: 10%;">
              <span style="font-size: 5px; color: #555; display: block;">CÓDIGO ANTT</span>
              <span style="font-weight: bold;">-</span>
            </td>
            <td class="border-r-black" style="width: 10%;">
              <span style="font-size: 5px; color: #555; display: block;">PLACA</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeVeiculo?.placa || "-"}</span>
            </td>
            <td class="border-r-black" style="width: 5%;">
              <span style="font-size: 5px; color: #555; display: block;">UF</span>
              <span style="font-weight: bold; text-transform: uppercase;">${danfeVeiculo?.uf || "-"}</span>
            </td>
            <td style="width: 15%;">
              <span style="font-size: 5px; color: #555; display: block;">CNPJ / CPF</span>
              <span style="font-weight: bold;">-</span>
            </td>
          </tr>
        </table>

        <!-- 8. DADOS DO PRODUTO / SERVIÇO TABLE -->
        <div class="border-black mb-1" style="overflow-x: hidden;">
          <div style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">DADOS DOS PRODUTOS E SERVIÇOS</div>
          <table style="font-size: 7px; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 1px solid #000; font-weight: bold;">
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 8%;">CÓDIGO</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: left; width: 35%;">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 8%;">NCM/SH</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 4%;">CST</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 4%;">CFOP</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 4%;">UN</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: center; width: 4%;">QTD</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: right; width: 8%;">VLR. UNIT</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: right; width: 10%;">VLR. TOTAL</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: right; width: 5%;">BC ICMS</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: right; width: 5%;">VLR. ICMS</th>
                <th style="padding: 2px; border-right: 1px solid #000; text-align: right; width: 5%;">VLR. IPI</th>
                <th style="padding: 2px; text-align: center; width: 3%;">ALIQ</th>
              </tr>
            </thead>
            <tbody>
              ${productRowsHtml}
              ${serviceRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- 9. CÁLCULO DO ISSQN -->
        <div class="border-black mb-1" style="font-size: 8px;">
          <div style="background-color: #e5e7eb; font-weight: bold; font-size: 7px; padding: 2px 4px; border-bottom: 1px solid #000; text-transform: uppercase;">CÁLCULO DO ISSQN</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center;">
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block;">INSCRIÇÃO MUNICIPAL</span>
              <span style="font-weight: bold;">3508912-3</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block;">VALOR TOTAL DOS SERVIÇOS</span>
              <span style="font-weight: bold; font-family: monospace;">R$ ${totalServicos.toFixed(2).replace(".", ",")}</span>
            </div>
            <div class="border-r-black p-1">
              <span style="font-size: 5px; color: #555; display: block;">BASE DE CÁLCULO DO ISSQN</span>
              <span style="font-weight: bold; font-family: monospace;">R$ ${totalServicos.toFixed(2).replace(".", ",")}</span>
            </div>
            <div class="p-1" style="background: #f9fafb;">
              <span style="font-size: 5px; color: #555; display: block;">VALOR DO ISSQN (5%)</span>
              <span style="font-weight: bold; font-family: monospace;">R$ ${(totalServicos * 0.05).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        <!-- 10. DADOS ADICIONAIS -->
        <div class="border-black" style="display: grid; grid-template-columns: 8fr 4fr; font-size: 8px; min-height: 60px;">
          <div class="border-r-black p-1" style="font-family: monospace; font-size: 6.5px; line-height: 1.25; text-transform: uppercase;">
            <span style="font-weight: bold; font-size: 7px; display: block; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-bottom: 2px;">INFORMAÇÕES COMPLEMENTARES</span>
            DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. OPERAÇÃO EM CONFORMIDADE COM REGULAÇÕES ESTADUAIS. REFERENTE À ORDEM DE SERVIÇO Nº <strong style="font-size: 7.5px;">#${os.id.toUpperCase()}</strong>.
            ${danfeVeiculo ? `
              <div style="font-family: Arial, sans-serif; font-weight: bold; border-top: 1px solid #eee; margin-top: 3px; padding-top: 3px; color: #333;">
                🚙 VEÍCULO: ${danfeVeiculo.marca} ${danfeVeiculo.modelo} | PLACA: <span style="background: #eee; padding: 1px 3px; border: 1px solid #ccc; border-radius: 2px;">${danfeVeiculo.placa}</span> | MOTOR: ${danfeVeiculo.motor || "1.0"} | COR: ${danfeVeiculo.cor || "PRETO"} | KM ENTRADA: ${os.kmAtual} KM.
              </div>
            ` : ""}
            <div style="font-size: 5.5px; color: #777; margin-top: 2px;">CONSULTA DIGITAL REALIZADA WITH SUCESSO - PADRÃO CONJUGADO DE AUTOPEÇAS E FLUIDOS</div>
          </div>
          <div class="p-1 text-center" style="display: flex; flex-direction: column; justify-content: space-between; font-family: monospace; font-size: 6px; background-color: #f9fafb;">
            <span style="font-weight: bold; font-size: 7px; text-transform: uppercase; display: block; text-align: left;">RESERVA AO FISCO</span>
            <div style="font-weight: bold; color: #999; margin: auto;">
              HASH DE SEGURANÇA SEFAZ:<br/>${randomChave.slice(0, 16).toLowerCase()}
            </div>
          </div>
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

    try {
      const printIframe = document.createElement("iframe");
      printIframe.id = "temp-print-danfe-iframe-" + Date.now();
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
            }, 5000);
          }
        }, 400);
      }
    } catch (err) {
      console.warn("Fallback to popup window print due to iframe restriction:", err);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
      } else {
        window.print();
      }
    }
  };

  
  // Temporary dynamic parts addition states
  const [pecaIdAdicionar, setPecaIdAdicionar] = useState("");
  const [pecaQtdAdicionar, setPecaQtdAdicionar] = useState("1");
  const [pecaMecanicoAdicionar, setPecaMecanicoAdicionar] = useState(""); // optional mechanic for individual piece
  const [pecasEscolhidas, setPecasEscolhidas] = useState<PecaUtilizada[]>([]);
  
  // OS Editing states
  const [editingOSId, setEditingOSId] = useState<string | null>(null);

  // Advanced service/labor and individual mechanic state variables
  const [servicosDetalhados, setServicosDetalhados] = useState<ServicoDetalhado[]>([]);
  const [descServicoAdicionar, setDescServicoAdicionar] = useState("");
  const [valueServicoAdicionar, setValueServicoAdicionar] = useState("");
  const [mecanicoServicoAdicionar, setMecanicoServicoAdicionar] = useState("");

  const [formError, setFormError] = useState("");

  // Auto trigger form if focused from dashboard
  useEffect(() => {
    if (focusedOS) {
      if (focusedOS.id === "new_os_trigger") {
        setShowAddForm(true);
        setSelectedOS(null);
        // Reset full form fields to default for a fresh OS
        setClienteId("");
        setVeiculoId("");
        setMecanicoId("");
        setKmAtual("");
        setDescricaoProblema("");
        setServicosRealizados("");
        setValorMaoDeObra("0");
        setPecasEscolhidas([]);
        setClientSearch("");
        setFormError("");
        if (onClearFocusedOS) {
          onClearFocusedOS();
        }
      } else {
        setSelectedOS(focusedOS);
        setShowAddForm(false);
      }
    }
  }, [focusedOS, onClearFocusedOS]);

  // Derived: Filter vehicles belonging to the selected client
  const clientVehicles = veiculos.filter(v => v.clienteId === clienteId);

  // Derived: Immediate maintenance history by selected vehicle plate
  const selectedVehicle = veiculos.find(v => v.id === veiculoId);
  const vHistory = ordens.filter(os => os.veiculoId === veiculoId && os.status === "Concluído");

  // Get current KM of selected vehicle to prefill
  useEffect(() => {
    if (selectedVehicle) {
      setKmAtual(selectedVehicle.km.toString());
    } else {
      setKmAtual("");
    }
  }, [veiculoId, selectedVehicle]);

  // Helper dynamic calculations
  const partsCost = pecasEscolhidas.reduce((sum, p) => sum + (p.quantidade * p.precoUnitario), 0);
  const calculatedTotal = partsCost + (Number(valorMaoDeObra) || 0);

  const getPecaDetail = (id: string) => {
    return pecas.find(p => p.id === id);
  };

  const handleAddPartToTable = () => {
    if (!pecaIdAdicionar) return;
    const qty = Number(pecaQtdAdicionar);
    if (isNaN(qty) || qty <= 0) {
      setFormError("Informe uma quantidade válida!");
      return;
    }

    const availablePeca = pecas.find(p => p.id === pecaIdAdicionar);
    if (!availablePeca) return;

    // Check inventory stock warning
    if (qty > availablePeca.estoque) {
      setFormError(`Quantidade indisponível em estoque! Máximo disponível: ${availablePeca.estoque} unidades.`);
      return;
    }

    setFormError("");

    // check if already added
    const existingIndex = pecasEscolhidas.findIndex(p => p.pecaId === pecaIdAdicionar);
    if (existingIndex > -1) {
      const updated = [...pecasEscolhidas];
      const newQty = updated[existingIndex].quantidade + qty;
      if (newQty > availablePeca.estoque) {
        setFormError(`Estoque excedido na soma! Máximo: ${availablePeca.estoque} unidades.`);
        return;
      }
      updated[existingIndex].quantidade = newQty;
      setPecasEscolhidas(updated);
    } else {
      setPecasEscolhidas([
        ...pecasEscolhidas,
        {
          pecaId: pecaIdAdicionar,
          quantidade: qty,
          precoUnitario: availablePeca.precoVenda,
          mecanicoId: pecaMecanicoAdicionar || undefined
        }
      ]);
    }

    // Reset part select states
    setPecaIdAdicionar("");
    setPecaQtdAdicionar("1");
    setPecaMecanicoAdicionar("");
  };

  const handleRemovePartFromTable = (index: number) => {
    const updated = [...pecasEscolhidas];
    updated.splice(index, 1);
    setPecasEscolhidas(updated);
  };

  const handleAddDetailedService = () => {
    if (!descServicoAdicionar.trim()) {
      setFormError("Informe a descrição do serviço!");
      return;
    }
    const val = parseFloat(valueServicoAdicionar);
    if (isNaN(val) || val < 0) {
      setFormError("Informe um valor de serviço válido!");
      return;
    }
    if (!mecanicoServicoAdicionar) {
      setFormError("Por favor, selecione o técnico responsável pelo serviço!");
      return;
    }

    setFormError("");

    const newService: ServicoDetalhado = {
      id: "srv_" + Date.now() + "_" + Math.floor(Math.random() * 100),
      descricao: descServicoAdicionar.trim(),
      valor: val,
      mecanicoId: mecanicoServicoAdicionar
    };

    const updatedServices = [...servicosDetalhados, newService];
    setServicosDetalhados(updatedServices);

    // Auto calculate valorMaoDeObra to match sum of services
    const sum = updatedServices.reduce((acc, curr) => acc + curr.valor, 0);
    setValorMaoDeObra(String(sum));

    // Reset fields
    setDescServicoAdicionar("");
    setValueServicoAdicionar("");
    setMecanicoServicoAdicionar("");
  };

  const handleRemoveDetailedService = (id: string) => {
    const updatedServices = servicosDetalhados.filter(s => s.id !== id);
    setServicosDetalhados(updatedServices);
    
    // Auto calculate valorMaoDeObra to match sum of services
    const sum = updatedServices.reduce((acc, curr) => acc + curr.valor, 0);
    setValorMaoDeObra(String(sum));
  };

  // Create new or edit service order
  const handleSaveOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !veiculoId || !mecanicoId || !kmAtual || !descricaoProblema) {
      setFormError("Por favor, preencha todos os campos obrigatórios da ordem!");
      return;
    }

    // Double check inventory bounds (accounting for previous state if in edit mode)
    let finalPecasList = [...pecas];
    if (editingOSId) {
      const originalOS = ordens.find(o => o.id === editingOSId);
      if (originalOS) {
        // Re-credit original pieces back to virtual stock check list
        for (const orig of originalOS.pecasUtilizadas) {
          finalPecasList = finalPecasList.map(p => {
            if (p.id === orig.pecaId) {
              return { ...p, estoque: p.estoque + orig.quantidade };
            }
            return p;
          });
        }
      }
    }

    for (const item of pecasEscolhidas) {
      const virtualPeca = finalPecasList.find(p => p.id === item.pecaId);
      if (virtualPeca && item.quantidade > virtualPeca.estoque) {
        setFormError(`Estoque esgotado para a peça "${virtualPeca.descricao}" ou insuficiente para salvar estas alterações.`);
        return;
      }
    }

    // Now decrement the new chosen pieces from the virtual list (which already re-credited originals if editing)
    const updatedPecasList = finalPecasList.map(p => {
      const choice = pecasEscolhidas.find(choiceItem => choiceItem.pecaId === p.id);
      if (choice) {
        return { ...p, estoque: p.estoque - choice.quantidade };
      }
      return p;
    });

    onUpdatePecas(updatedPecasList);

    // Auto-generate solution list text from detailed services if none was written explicitly
    const finalServicosRealizados = servicosRealizados.trim() && servicosRealizados !== "Em andamento"
      ? servicosRealizados
      : (servicosDetalhados.length > 0 
          ? servicosDetalhados.map(s => `${s.descricao} (${getMecanicoNome(s.mecanicoId)})`).join(", ") 
          : "Em andamento");

    const osData: OrdemServico = {
      ...(editingOSId ? ordens.find(o => o.id === editingOSId) : {}),
      id: editingOSId || ("os_" + Date.now()),
      veiculoId,
      clienteId,
      mecanicoId,
      dataAbertura: editingOSId ? (ordens.find(o => o.id === editingOSId)?.dataAbertura || "2026-06-01") : "2026-06-01",
      status: "Em Andamento",
      kmAtual: Number(kmAtual) || 0,
      descricaoProblema,
      servicosRealizados: finalServicosRealizados,
      pecasUtilizadas: pecasEscolhidas,
      servicosDetalhados: servicosDetalhados,
      valorMaoDeObra: Number(valorMaoDeObra) || 0,
      valorTotal: calculatedTotal,
    };

    if (editingOSId) {
      const updatedOrdens = ordens.map(o => o.id === editingOSId ? osData : o);
      onUpdateOrdens(updatedOrdens);
      setSelectedOS(osData);
    } else {
      onUpdateOrdens([...ordens, osData]);
    }

    // Update vehicle km on save order
    const updatedVehicles = veiculos.map(v => {
      if (v.id === veiculoId) {
        return { ...v, km: Number(kmAtual) };
      }
      return v;
    });
    // Triggers update for linked vehicles
    const mockSaveEvent = new CustomEvent("veiculos-updated", { detail: updatedVehicles });
    window.dispatchEvent(mockSaveEvent);

    // reset state
    setClienteId("");
    setVeiculoId("");
    setMecanicoId("");
    setKmAtual("");
    setDescricaoProblema("");
    setServicosRealizados("");
    setValorMaoDeObra("0");
    setPecasEscolhidas([]);
    setServicosDetalhados([]);
    setEditingOSId(null);
    setFormError("");
    setShowAddForm(false);
  };

  const handleOSDoubleClick = (o: OrdemServico) => {
    if (o.status === "Em Andamento") {
      setEditingOSId(o.id);
      setClienteId(o.clienteId);
      setVeiculoId(o.veiculoId);
      setMecanicoId(o.mecanicoId);
      setKmAtual(String(o.kmAtual));
      setDescricaoProblema(o.descricaoProblema);
      setServicosRealizados(o.servicosRealizados);
      setValorMaoDeObra(String(o.valorMaoDeObra));
      setPecasEscolhidas(o.pecasUtilizadas || []);
      setServicosDetalhados(o.servicosDetalhados || []);
      setShowAddForm(true);
      setSelectedOS(null);
      if (onClearFocusedOS) onClearFocusedOS();
    } else {
      setSelectedOS(o);
      setShowAddForm(false);
      setIsOSMaximized(true);
      if (onClearFocusedOS) onClearFocusedOS();
    }
  };

  // Order status transitions (Complete / Cancel)
  const handleUpdateStatus = (osId: string, nextStatus: "Concluído" | "Cancelado") => {
    const updated = ordens.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          status: nextStatus,
          dataConclusao: nextStatus === "Concluído" ? "2026-06-01" : undefined
        };
      }
      return os;
    });
    onUpdateOrdens(updated);
    
    // update focused item display
    const nextItem = updated.find(x => x.id === osId);
    if (nextItem) setSelectedOS(nextItem);
  };

  const handleReopenOS = (os: OrdemServico) => {
    const updated = ordens.map(item => {
      if (item.id === os.id) {
        return {
          ...item,
          status: "Em Andamento" as const,
          dataConclusao: undefined,
          nfeEmitida: false,
          nfeChave: undefined,
          nfseEmitida: false,
          nfseChave: undefined,
          fechamentoAdm: undefined
        };
      }
      return item;
    });
    onUpdateOrdens(updated);

    // load into editing fields
    setEditingOSId(os.id);
    setClienteId(os.clienteId);
    setVeiculoId(os.veiculoId);
    setMecanicoId(os.mecanicoId);
    setKmAtual(String(os.kmAtual));
    setDescricaoProblema(os.descricaoProblema);
    setServicosRealizados(os.servicosRealizados);
    setValorMaoDeObra(String(os.valorMaoDeObra));
    setPecasEscolhidas(os.pecasUtilizadas || []);
    setServicosDetalhados(os.servicosDetalhados || []);
    setShowAddForm(true);
    setSelectedOS(null);
    setIsOSMaximized(false);
    if (onClearFocusedOS) onClearFocusedOS();
  };

  // Automated dynamic checkout routing & finalizing routine
  const handleCheckoutFinalize = (
    osId: string, 
    paymentMethod: "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo", 
    docOption: "nfe" | "cupom" | "imprimir",
    discountAmount: number,
    splitPaymentRecords: Record<string, number>,
    installmentOption: number
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const generatedChave = "352606" + "45089301000105" + "55" + "001" + Math.floor(100000000 + Math.random() * 900000000);

    const updated = ordens.map(os => {
      if (os.id === osId) {
        const finalEstTotal = Math.max(0, os.valorTotal - discountAmount);
        return {
          ...os,
          status: "Concluído" as const,
          dataConclusao: todayStr,
          fechamentoAdm: {
            formaPagamento: paymentMethod,
            taxaCartaoPercentual: paymentMethod.includes("Cartão") || paymentMethod.includes("Débito") || paymentMethod.includes("Crédito") ? 2.5 : 0,
            custoPecasOrigem: {},
            custoPecasFornecedor: {},
            custoPecasReais: {},
            comissaoMecanicoOriginal: os.valorMaoDeObra * 0.1,
            comissaoMecanicoFinal: os.valorMaoDeObra * 0.1,
            impostosCustosExtras: 0,
            checklistValidados: [],
            lucroLiquidoCalculado: Math.max(0, finalEstTotal - (os.valorMaoDeObra * 0.1)),
            contabilizadoEm: todayStr,
            desconto: discountAmount,
            valoresPagoSplit: splitPaymentRecords,
            parcelasCredito: installmentOption
          },
          // Conditionally auto-emit NF-e or NFS-e / NFC-e depending on routing
          nfeEmitida: docOption === "nfe" || docOption === "cupom",
          nfeChave: docOption === "nfe" || docOption === "cupom" ? generatedChave : undefined,
          nfseEmitida: docOption === "nfe",
          nfseChave: docOption === "nfe" ? "2026" + Math.floor(100000 + Math.random() * 900000) + "A" : undefined,
        };
      }
      return os;
    });

    onUpdateOrdens(updated);
    
    // Reset wizard states
    setActiveCheckoutOSId(null);
    setCheckoutPaymentMethod("");
    setCheckoutSelectedDoc("");
    setCheckoutDiscount("0");
    setCheckoutSplitPayments({
      "Dinheiro": 0,
      "Pix": 0,
      "Débito": 0,
      "Crédito": 0,
      "Crédito Parcelado": 0,
    });
    setCheckoutInstallments(1);

    // Update current selected item
    const nextItem = updated.find(x => x.id === osId);
    if (nextItem) setSelectedOS(nextItem);

    // If print option chosen, trigger physical screen print helper instantly
    if (docOption === "imprimir") {
      setShowPrintPreview(true);
    } else if (docOption === "nfe" || docOption === "cupom") {
      setDanfeOS(nextItem || null);
      setShowDanfePreview(true);
    }
  };

  const getClienteNome = (id: string) => {
    return clientes.find(c => c.id === id)?.nome || "Não identificado";
  };

  const getVeiculoFmt = (id: string) => {
    const v = veiculos.find(vei => vei.id === id);
    return v ? `${v.marca} ${v.modelo} [${v.placa}]` : "Ficha ausente";
  };

  const getMecanicoNome = (id: string) => {
    return mecanicos.find(m => m.id === id)?.nome || "Mecânico Geral";
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const renderCheckoutWizard = (os: OrdemServico) => {
    if (os.status !== "Em Andamento") return null;

    const isWizardActive = activeCheckoutOSId === os.id;

    // Calculations for split payment and discount
    const numDiscount = Math.max(0, parseFloat(checkoutDiscount) || 0);
    const totalOS = os.valorTotal;
    const liquidoAPagar = Math.max(0, totalOS - numDiscount);
    const totalLancado = Object.keys(checkoutSplitPayments).reduce((sum, key) => sum + (checkoutSplitPayments[key] || 0), 0);
    const restantePendente = parseFloat((liquidoAPagar - totalLancado).toFixed(2));

    const handleSplitPaymentChange = (method: string, value: number) => {
      const val = Math.max(0, value);
      setCheckoutSplitPayments(prev => ({
        ...prev,
        [method]: val
      }));
    };

    const handleAutoFillRemaining = (method: string) => {
      setCheckoutSplitPayments(prev => {
        const currentOtherTotal = Object.keys(prev)
          .filter(m => m !== method)
          .reduce((sum, key) => sum + (prev[key] || 0), 0);
        const fillingVal = Math.max(0, liquidoAPagar - currentOtherTotal);
        return {
          ...prev,
          [method]: parseFloat(fillingVal.toFixed(2))
        };
      });
    };

    return (
      <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-xl mt-6">
        {!isWizardActive ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1 text-left w-full sm:w-auto">
              <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Encerramento de Ordem de Serviço</span>
              </h4>
              <p className="text-[10px] text-slate-300">Deseja finalizar esta OS registrando pagamento e faturamento eletrônico?</p>
            </div>
            <button
              type="button"
              id="init-checkout-btn"
              onClick={() => {
                setActiveCheckoutOSId(os.id);
                setCheckoutDiscount("0");
                setCheckoutSplitPayments({
                  "Dinheiro": 0,
                  "Pix": 0,
                  "Débito": 0,
                  "Crédito": 0,
                  "Crédito Parcelado": 0,
                });
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <CheckCheck className="w-4 h-4" />
              <span>FECHAR ORDEM DE SERVIÇO</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
              <div>
                <h4 id="checkout-title-label" className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCheck className="w-4 h-4" />
                  <span>Encerramento da OS #{os.id.toUpperCase()}</span>
                </h4>
                <p className="text-[10px] text-slate-300">Complete as etapas de desconto e divisão do pagamento para liquidar o saldo:</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveCheckoutOSId(null);
                  setCheckoutDiscount("0");
                  setCheckoutSplitPayments({
                    "Dinheiro": 0,
                    "Pix": 0,
                    "Débito": 0,
                    "Crédito": 0,
                    "Crédito Parcelado": 0,
                  });
                }}
                className="text-slate-400 hover:text-red-400 transition text-xxs font-bold"
              >
                Cancelar
              </button>
            </div>

            {/* Painel Financeiro e Descontos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-left">
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <span>💰 Ajuste de Valores / Desconto</span>
                </h5>
                <div className="space-y-1">
                  <label className="text-xxs text-slate-450 block font-medium">Desconto Especial Concedido (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xxs font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500"
                      value={checkoutDiscount}
                      placeholder="0,00"
                      onChange={(e) => {
                        const val = e.target.value;
                        setCheckoutDiscount(val);
                      }}
                    />
                  </div>
                  <p className="text-[9.5px] text-slate-400 italic">O valor do desconto concedido será descriminado nos relatórios de fluxo de caixa.</p>
                </div>
              </div>

              {/* Balanço e Comparação */}
              <div className="space-y-1.5 font-sans justify-center flex flex-col border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                <div className="flex justify-between text-xxs text-slate-400">
                  <span>Valor Total Original:</span>
                  <span className="font-mono text-slate-300">{formatCurrency(totalOS)}</span>
                </div>
                {numDiscount > 0 && (
                  <div className="flex justify-between text-xxs text-red-400">
                    <span>Desconto Concedido:</span>
                    <span className="font-mono">- {formatCurrency(numDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-extrabold text-white">
                  <span>Líquido a Receber:</span>
                  <span className="font-mono text-emerald-400">{formatCurrency(liquidoAPagar)}</span>
                </div>
                <div className="flex justify-between text-xxs text-slate-400 border-t border-white/5 pt-1 mt-1">
                  <span>Total Lançado:</span>
                  <span className="font-mono text-white">{formatCurrency(totalLancado)}</span>
                </div>

                <div className="flex justify-between text-[11px] font-black pt-1">
                  <span>Status do Saldo:</span>
                  {restantePendente > 0 ? (
                    <span className="text-amber-400 font-mono">Pendente: {formatCurrency(restantePendente)}</span>
                  ) : restantePendente < 0 ? (
                    <span className="text-red-450 font-mono">Excesso: {formatCurrency(Math.abs(restantePendente))}</span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">✓ LIQUIDADO</span>
                  )}
                </div>
              </div>
            </div>

            {/* Divisão Avançada de Pagamento */}
            <div className="space-y-3 text-left">
              <label className="block text-[10px] font-black text-slate-350 uppercase tracking-widest">
                Etapa 1: Distribua as formas de recebimento (Suporta multi-pagamento simultâneo)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { key: "Dinheiro", label: "💵 Dinheiro" },
                  { key: "Pix", label: "📱 Pix" },
                  { key: "Débito", label: "💳 Débito" },
                  { key: "Crédito", label: "💳 Crédito" },
                  { key: "Crédito Parcelado", label: "📈 Créd. Parcelado" }
                ].map(op => {
                  const val = checkoutSplitPayments[op.key] || 0;
                  return (
                    <div key={op.key} className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 space-y-1.5 hover:border-white/10 transition flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-200 block mb-1">{op.label}</span>
                        <div className="relative">
                          <span className="absolute left-1.5 top-1.5 text-[10px] font-bold text-slate-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={val === 0 ? "" : val}
                            placeholder="0,00"
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value) || 0;
                              handleSplitPaymentChange(op.key, parsed);
                            }}
                            className="w-full bg-slate-900 border border-white/5 rounded px-1 py-1 pl-5 text-[11px] font-mono text-white text-right focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoFillRemaining(op.key)}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-emerald-400 text-[9px] font-bold py-1 mt-2.5 rounded transition text-center cursor-pointer"
                      >
                        Pagar Pendente
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Installment Selector for Credit Payments */}
              {((checkoutSplitPayments["Crédito"] || 0) > 0 || (checkoutSplitPayments["Crédito Parcelado"] || 0) > 0) && (
                <div className="bg-slate-950/60 p-4 border border-teal-500/20 rounded-xl space-y-2 mt-3 animate-fadeIn text-left">
                  <label className="block text-[10px] font-black text-slate-305 text-teal-400 uppercase tracking-widest">
                    💳 Parcelas do Cartão de Crédito
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-1/3">
                      <select
                        value={checkoutInstallments}
                        onChange={(e) => setCheckoutInstallments(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                          const totalCC = (checkoutSplitPayments["Crédito"] || 0) + (checkoutSplitPayments["Crédito Parcelado"] || 0);
                          const quotaStr = (totalCC / n).toFixed(2);
                          return (
                            <option key={n} value={n}>
                              {n}x {n === 1 ? "à vista" : `de R$ ${quotaStr}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Aprovado no cartão de crédito em <strong>{checkoutInstallments}x</strong>. As taxas administrativas serão provisionadas baseado nestas parcelas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Etapa Final (Destino de Emissão Fiscal / Impressão) - Exibida quando saldo fechado */}
            {restantePendente === 0 ? (
              <div className="space-y-4 pt-4 border-t border-white/10 animate-fadeIn text-left">
                <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Etapa 2: Saldo integral liquidado. Escolha onde salvar e finalize a OS</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option A: Emitir NF-e (DANFE / Produtos) */}
                  <button
                    type="button"
                    onClick={() => {
                      const nonZeros = Object.keys(checkoutSplitPayments).filter((m) => (checkoutSplitPayments[m] || 0) > 0);
                      const pMethodStr = nonZeros.length > 1 
                        ? "Múltiplo" as const
                        : nonZeros.length === 1 ? nonZeros[0] as "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo" : "Dinheiro" as const;

                      setCheckoutSelectedDoc("nfe");
                      handleCheckoutFinalize(os.id, pMethodStr, "nfe", numDiscount, checkoutSplitPayments, checkoutInstallments);
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/60 hover:bg-white/5 transition text-left cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-xxs">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Emitir Nota Fiscal (NF-e)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Registra as vias de pagamento e emite Nota Fiscal de produtos (DANFE) contendo as peças utilizadas.
                    </p>
                    <span className="text-[9.5px] font-black text-white block pt-1 hover:underline">Emitir e Finalizar OS →</span>
                  </button>

                  {/* Option B: Emitir Cupom Fiscal (NFC-e) */}
                  <button
                    type="button"
                    onClick={() => {
                      const nonZeros = Object.keys(checkoutSplitPayments).filter((m) => (checkoutSplitPayments[m] || 0) > 0);
                      const pMethodStr = nonZeros.length > 1 
                        ? "Múltiplo" as const
                        : nonZeros.length === 1 ? nonZeros[0] as "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo" : "Dinheiro" as const;

                      setCheckoutSelectedDoc("cupom");
                      handleCheckoutFinalize(os.id, pMethodStr, "cupom", numDiscount, checkoutSplitPayments, checkoutInstallments);
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/60 hover:bg-white/5 transition text-left cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-xxs">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Emitir Cupom Fiscal (NFC-e)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Registra as vias de pagamento e emite Cupom Fiscal de venda ao consumidor no varejo.
                    </p>
                    <span className="text-[9.5px] font-black text-white block pt-1 hover:underline">Emitir Cupom e Finalizar OS →</span>
                  </button>

                  {/* Option C: Apenas Imprimir OS */}
                  <button
                    type="button"
                    onClick={() => {
                      const nonZeros = Object.keys(checkoutSplitPayments).filter((m) => (checkoutSplitPayments[m] || 0) > 0);
                      const pMethodStr = nonZeros.length > 1 
                        ? "Múltiplo" as const
                        : nonZeros.length === 1 ? nonZeros[0] as "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo" : "Dinheiro" as const;

                      setCheckoutSelectedDoc("imprimir");
                      handleCheckoutFinalize(os.id, pMethodStr, "imprimir", numDiscount, checkoutSplitPayments, checkoutInstallments);
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/60 hover:bg-white/5 transition text-left cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-xxs">
                      <Printer className="w-3.5 h-3.5" />
                      <span>Apenas Imprimir a OS</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Fecha o serviço lançando os recebíveis no caixa da oficina e abre direto o formulário de impressão.
                    </p>
                    <span className="text-[9.5px] font-black text-white block pt-1 hover:underline">Imprimir Cupom / Via da OS →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-left flex items-start gap-2.5 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0 mt-1"></span>
                <p className="text-xxs text-amber-200">
                  {restantePendente > 0 
                    ? `Distribuição de pagamentos pendente: Foi lançado R$ ${totalLancado.toFixed(2)} de R$ ${liquidoAPagar.toFixed(2)}. Lance o saldo pendente de R$ ${restantePendente.toFixed(2)} (ou clique em "Pagar Pendente" ao lado de qualquer método) para habilitar as opções de emissão.`
                    : `Distribuição incorreta: Os valores ultrapassaram o líquido da OS em R$ ${Math.abs(restantePendente).toFixed(2)}. Corrija os inputs de pagamento para fechar a Ordem.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans text-white">
      
      {/* Left Column (5/12) - OS Overview list */}
      <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-white text-sm">Ordens de Serviço</h3>
            <p className="text-xxs text-slate-400">Atividades técnicas em aberto ou faturadas</p>
          </div>

          <button
            id="toggle-new-os-form-btn"
            onClick={() => { setShowAddForm(!showAddForm); setSelectedOS(null); if (onClearFocusedOS) onClearFocusedOS(); }}
            className="p-1.5 bg-orange-600 hover:bg-orange-550 text-white rounded-lg flex items-center justify-center transition cursor-pointer"
            title="Abrir Nova Ordem"
          >
            <Plus className="w-4 h-4 text-slate-900" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-4 py-3 border-b border-white/5 bg-slate-950/25 flex flex-col gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, placa ou ID..."
              value={osSearchField}
              onChange={(e) => setOsSearchField(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xxs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-semibold"
            />
          </div>

          {(internalFilter === "today" || internalFilter === "hoje") ? (
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-between text-xxs font-semibold text-orange-300 animate-fadeIn">
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-orange-400" />
                Filtrado: Serviços de Hoje
              </span>
              <button
                type="button"
                onClick={() => {
                  setInternalFilter(null);
                  window.history.pushState(null, "", "/ordens-servico");
                }}
                className="text-[10px] text-orange-400 hover:text-white hover:bg-orange-500/20 transition px-1.5 py-0.5 rounded cursor-pointer shrink-0 font-bold"
              >
                Limpar
              </button>
            </div>
          ) : (internalFilter === "andamento" || internalFilter === "pending") ? (
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xxs font-semibold text-amber-300 animate-fadeIn">
              <span className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-spin-slow" />
                Filtrado: Serviços Em Andamento
              </span>
              <button
                type="button"
                onClick={() => {
                  setInternalFilter(null);
                  window.history.pushState(null, "", "/ordens-servico");
                }}
                className="text-[10px] text-amber-400 hover:text-white hover:bg-amber-500/20 transition px-1.5 py-0.5 rounded cursor-pointer shrink-0 font-bold"
              >
                Limpar
              </button>
            </div>
          ) : null}
        </div>

        {/* List of Orders */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {(() => {
            const list = ordens.filter(o => {
              if (osSearchField) {
                const query = osSearchField.trim().toLowerCase();
                const client = clientes.find(c => c.id === o.clienteId);
                const clientNome = client ? client.nome.toLowerCase() : "";
                const veiculo = veiculos.find(v => v.id === o.veiculoId);
                const vehicleDesc = veiculo ? `${veiculo.marca} ${veiculo.modelo} ${veiculo.placa}`.toLowerCase() : "";
                const osIdShort = o.id.toLowerCase().slice(-6);
                const osIdFull = o.id.toLowerCase();
                if (
                  !clientNome.includes(query) && 
                  !vehicleDesc.includes(query) && 
                  !osIdShort.includes(query) && 
                  !osIdFull.includes(query)
                ) {
                  return false;
                }
              }
              if (internalFilter === "today" || internalFilter === "hoje") {
                const todayStr = "2026-06-01";
                const realTodayStr = new Date().toISOString().split("T")[0];
                return o.dataAbertura === todayStr || o.dataAbertura === realTodayStr;
              }
              if (internalFilter === "andamento" || internalFilter === "pending") {
                return o.status === "Em Andamento";
              }
              return true;
            });

            if (list.length === 0) {
              return (
                <div className="p-6 text-center text-slate-505 text-slate-400 text-xs">
                  Nenhuma ordem de serviço localizada.
                </div>
              );
            }

            return list.map(o => (
            <div
              key={o.id}
              onClick={() => { setSelectedOS(o); setShowAddForm(false); if (onClearFocusedOS) onClearFocusedOS(); }}
              onDoubleClick={() => handleOSDoubleClick(o)}
              className={`p-4 cursor-pointer transition flex flex-col gap-1.5 select-none ${
                selectedOS?.id === o.id ? "bg-white/10 border-l-4 border-orange-500 text-white" : "hover:bg-white/5"
              }`}
              title={o.status === "Em Andamento" ? "Dê duplo clique para EDITAR esta OS" : "Dê duplo clique para expandir em tela maior"}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xxs font-bold text-orange-400 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                  #{o.id.toUpperCase().slice(-6)}
                </span>
                
                <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                  o.status === "Concluído" ? "bg-emerald-550/10 text-emerald-400 border border-emerald-500/20" :
                  o.status === "Cancelado" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                }`}>
                  {o.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs truncate">{getClienteNome(o.clienteId)}</h4>
                <p className="text-xxs text-slate-450 truncate mt-0.5 font-medium">{getVeiculoFmt(o.veiculoId)}</p>
              </div>

              <div className="flex justify-between items-center text-xxs font-sans text-slate-400 font-medium">
                <span>Abertura: {o.dataAbertura}</span>
                <span className="font-bold text-slate-205 text-white">{formatCurrency(o.valorTotal)}</span>
              </div>

              {/* Explicit Option to Open */}
              <div className="flex justify-end mt-1 pt-1.5 border-t border-white/5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOS(o);
                    setShowAddForm(false);
                    setIsOSMaximized(true);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-white rounded border border-white/5 font-extrabold text-[9px] flex items-center gap-1 transition-all"
                  title="Abrir em Tela Maior (Ampliado)"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>Abrir Ampliado</span>
                </button>
              </div>
            </div>
          ));
        })()}
        </div>
      </div>

      {/* Right Column (7/12) - Creation, Details or History displays */}
      <div className="lg:col-span-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl h-[calc(100vh-12rem)] min-h-[500px] flex flex-col overflow-y-auto">
        
        {/* State A: Add New Service Order Form */}
        {showAddForm && (
          <div className="p-6 space-y-6">
            <div className="border-b border-white/10 pb-3 flex justify-between items-center bg-slate-900/40 p-4 rounded-xl">
              <div>
                <h3 className="text-base font-bold text-orange-400">
                  {editingOSId ? `Editar Ordem de Serviço #${editingOSId.toUpperCase().slice(-6)}` : "Iniciar Nova OS Operacional"}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingOSId 
                    ? "Altere as peças, valores de custos, mão de obra e técnicos vinculados independentes por serviço" 
                    : "Reconheça o cliente, veja a memória de diagnósticos e declare o serviço"}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setEditingOSId(null);
                  setClienteId("");
                  setVeiculoId("");
                  setMecanicoId("");
                  setKmAtual("");
                  setDescricaoProblema("");
                  setServicosRealizados("");
                  setValorMaoDeObra("0");
                  setPecasEscolhidas([]);
                  setServicosDetalhados([]);
                  setShowAddForm(false);
                }} 
                className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white rounded-lg text-xxs transition duration-150 cursor-pointer animate-pulse"
              >
                Voltar/Cancelar
              </button>
            </div>

            {formError && (
              <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xxs rounded flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
              
              {/* Form parameters inputs left */}
              <form onSubmit={handleSaveOS} className="md:col-span-7 space-y-4 font-sans">
                
                <div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xxs font-semibold text-slate-300 uppercase">Cliente Solicitante *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickClientForm(!showQuickClientForm);
                          setClienteId("");
                          setVeiculoId("");
                          setClientSearch("");
                          setFormError("");
                        }}
                        className="text-orange-400 hover:text-orange-350 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{showQuickClientForm ? "Pesquisar Existente" : "Cadastrar Novo Cliente (Atalho)"}</span>
                      </button>
                    </div>

                    {showQuickClientForm ? (
                      /* On-The-Fly Quick Client & Vehicle Registration Sub-form */
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 mt-1.5 text-slate-200">
                        <span className="font-bold text-orange-400 text-xxs block border-b border-orange-500/20 pb-1.5 uppercase tracking-wide">
                          Cadastrar Novo Cliente & Veículo
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">Nome Completo *</label>
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="Ex: Pedro de Alencar"
                              value={qcNome}
                              onChange={(e) => setQcNome(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">E-mail</label>
                            <input
                              type="email"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="Ex: pedro@mail.com"
                              value={qcEmail}
                              onChange={(e) => setQcEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">Celular / WhatsApp *</label>
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="(49) 99999-9999"
                              value={qcTelefone}
                              onChange={(e) => handleQcPhoneChange(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">CPF ou CNPJ *</label>
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="Ex: 000.000.000-00"
                              value={qcCpfCnpj}
                              onChange={(e) => handleQcCpfChange(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">Tipo</label>
                            <select
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none"
                              value={qcTipo}
                              onChange={(e) => setQcTipo(e.target.value as "PF" | "PJ")}
                            >
                              <option value="PF" className="bg-slate-950">Pessoa Física (PF)</option>
                              <option value="PJ" className="bg-slate-950">Pessoa Jurídica (PJ)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-0.5">Aniversário *</label>
                            <input
                              type="date"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none"
                              value={qcDataNascimento}
                              onChange={(e) => setQcDataNascimento(e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-slate-300 font-medium block mb-0.5">Endereço Completo *</label>
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                              placeholder="Ex: Av. Belisário Ramos, 207 - Centro, Lages - SC"
                              value={qcEndereco}
                              onChange={(e) => setQcEndereco(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Optional Vehicle Binding section */}
                        <div className="border-t border-white/10 pt-2.5 mt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold text-xxs">
                            <input
                              type="checkbox"
                              checked={qcIncludeVehicle}
                              onChange={(e) => setQcIncludeVehicle(e.target.checked)}
                              className="rounded accent-orange-550"
                            />
                            <span>CADASTRAR E VINCULAR PRIMEIRO VEÍCULO JUNTAMENTE</span>
                          </label>

                          {qcIncludeVehicle && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/40 p-3 rounded-lg border border-white/5">
                              <div>
                                <label className="text-slate-400 block mb-0.5">Placa *</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded text-white font-mono uppercase"
                                  placeholder="ABC-1234 / ABC1D23"
                                  value={qvPlaca}
                                  onChange={(e) => setQvPlaca(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-0.5">Marca *</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded text-white"
                                  placeholder="Ex: Volkswagen"
                                  value={qvMarca}
                                  onChange={(e) => setQvMarca(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-0.5">Modelo *</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded text-white"
                                  placeholder="Ex: Gol G6 1.6"
                                  value={qvModelo}
                                  onChange={(e) => setQvModelo(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-0.5">Ano *</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded text-white"
                                  placeholder="Ex: 2018"
                                  value={qvAno}
                                  onChange={(e) => setQvAno(e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2.5 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowQuickClientForm(false);
                              setFormError("");
                            }}
                            className="px-3 py-1.5 bg-white/5 text-slate-300 font-bold rounded text-xxs transition hover:bg-white/10"
                          >
                            Voltar para Pesquisa
                          </button>
                          <button
                            type="button"
                            onClick={handleQuickCreateSave}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-550 text-white font-bold rounded text-xxs transition shadow"
                          >
                            Criar e Selecionar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Searchable Autocomplete Combobox Select */
                      <div className="relative mt-1">
                        {clienteId ? (
                          /* Selected client state display block */
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              {(() => {
                                const selCliObj = clientes.find(c => c.id === clienteId);
                                if (!selCliObj) return <span className="text-red-400 italic">Cliente contatado não encontrado</span>;
                                const cType = selCliObj.tipo || (selCliObj.cpfCnpj?.replace(/\D/g, "").length > 11 ? "PJ" : "PF");
                                return (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white text-xs truncate block max-w-[15rem]">
                                        {selCliObj.nome}
                                      </span>
                                      <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold tracking-wider shrink-0 ${
                                        cType === "PJ"
                                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      }`}>
                                        {cType}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono">CPF/CNPJ: {selCliObj.cpfCnpj} | Cel: {selCliObj.telefone}</p>
                                  </div>
                                );
                              })()}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setClienteId("");
                                setVeiculoId("");
                                setClientSearch("");
                              }}
                              className="p-1.5 px-3 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xxs transition cursor-pointer"
                            >
                              Alterar
                            </button>
                          </div>
                        ) : (
                          /* Suggestions search input field */
                          <div className="relative">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/40 text-xs"
                                placeholder="Pesquisar por nome do cliente, telefone ou CPF..."
                                value={clientSearch}
                                onChange={(e) => {
                                  setClientSearch(e.target.value);
                                  setShowClientSuggestions(true);
                                }}
                                onFocus={() => setShowClientSuggestions(true)}
                              />
                              {clientSearch && (
                                <button
                                  type="button"
                                  onClick={() => setClientSearch("")}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {showClientSuggestions && (
                              <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-slate-950 border border-white/15 rounded-lg shadow-2xl divide-y divide-white/5">
                                {(() => {
                                  const q = clientSearch.toLowerCase().trim();
                                  const suggestions = clientes.filter(c => 
                                    c.nome.toLowerCase().includes(q) ||
                                    c.cpfCnpj.includes(q) ||
                                    c.telefone.includes(q)
                                  );

                                  if (suggestions.length === 0) {
                                    return (
                                      <div className="p-3 text-center text-slate-500 italic text-xxs">
                                        Nenhum cliente correspondente.
                                      </div>
                                    );
                                  }

                                  return suggestions.map(c => {
                                    const cType = c.tipo || (c.cpfCnpj?.replace(/\D/g, "").length > 11 ? "PJ" : "PF");
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          setClienteId(c.id);
                                          setVeiculoId("");
                                          setShowClientSuggestions(false);
                                        }}
                                        className="w-full text-left p-2.5 hover:bg-white/10 transition flex flex-col gap-0.5 cursor-pointer text-xxs"
                                      >
                                        <div className="flex items-center justify-between gap-2.5 w-full">
                                          <span className="font-bold text-white truncate text-xs">{c.nome}</span>
                                          <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold tracking-wider shrink-0 mb-0.5 ${
                                            cType === "PJ"
                                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                          }`}>
                                            {cType}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">CPF/CNPJ: {c.cpfCnpj} | Cel: {c.telefone}</span>
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xxs font-semibold text-slate-300 uppercase">Veículo do Cliente *</label>
                    {clienteId && !showQuickVehicleForm && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickVehicleForm(true);
                          setQvePlaca("");
                          setQveMarca("");
                          setQveModelo("");
                          setQveAno("");
                          setQveMotor("");
                          setQveCor("");
                          setQveKm(kmAtual || "");
                          setQveChassi("");
                          setQveRenavam("");
                          setQveMunicipio("");
                          setQveUf("");
                          setQveDetranNotice("");
                        }}
                        className="text-orange-400 hover:text-orange-350 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Cadastrar Novo Veículo (Atalho)</span>
                      </button>
                    )}
                  </div>
                  {clienteId ? (
                    <div className="space-y-2 animate-fadeIn">
                      {!showQuickVehicleForm && (
                        <>
                          <div className="relative">
                            <Search className="w-3 h-3 text-orange-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Pesquisar veículo por Placa, Modelo ou Marca..."
                              className="w-full pl-7 pr-7 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/40 text-[11px]"
                              value={vehicleSearchQuery}
                              onChange={(e) => setVehicleSearchQuery(e.target.value)}
                            />
                            {vehicleSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setVehicleSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <select
                            id="os-vehicle-sel"
                            required
                            className="w-full px-2.5 py-2 rounded-lg border border-white/10 bg-slate-900 text-white text-xs focus:outline-none"
                            value={veiculoId}
                            onChange={(e) => setVeiculoId(e.target.value)}
                          >
                            {(() => {
                              const queriedVehicles = clientVehicles.filter(v => 
                                v.marca.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                                v.modelo.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                                v.placa.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
                              );
                              return (
                                <>
                                  <option value="" className="bg-slate-950">
                                    {queriedVehicles.length === 0 
                                      ? "Nenhum veículo correspondente..." 
                                      : `Selecione um carro (${queriedVehicles.length} filtrados)...`}
                                  </option>
                                  {queriedVehicles.map(v => (
                                    <option key={v.id} value={v.id} className="bg-slate-950">
                                      {v.marca} {v.modelo} [{v.placa}]
                                    </option>
                                  ))}
                                </>
                              );
                            })()}
                          </select>
                        </>
                      )}

                      {showQuickVehicleForm ? (
                        <div className="bg-slate-900/95 p-4 border border-orange-500/25 rounded-2xl space-y-3.5 shadow-xl shadow-black/50 animate-fadeIn text-[11px] relative">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-extrabold text-orange-400 text-xxs uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Cadastro Rápido de Veículo
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowQuickVehicleForm(false);
                                setFormError("");
                              }}
                              className="text-xxs font-extrabold text-red-400 hover:text-red-300 px-1 py-0.5"
                            >
                              Cancelar
                            </button>
                          </div>

                          {/* DETRAN integration row */}
                          <div className="bg-slate-950/45 p-2.5 rounded-xl space-y-2 border border-white/5">
                            <span className="text-slate-300 block text-[9px] uppercase font-bold tracking-wider">Busca de Placa Oficial (DETRAN)</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="DIGITE A PLACA AQUI..."
                                value={qvePlaca}
                                onChange={(e) => setQvePlaca(e.target.value.toUpperCase())}
                                className="px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xxs font-mono flex-1 focus:outline-none focus:ring-1 focus:ring-orange-500/40 uppercase"
                              />
                              <button
                                type="button"
                                disabled={qveDetranLoading}
                                onClick={handleQuickDetranSync}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-extrabold rounded-lg text-xxs flex items-center gap-1.5 transition cursor-pointer"
                              >
                                {qveDetranLoading ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-orange-400" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                )}
                                <span>Consultar DETRAN</span>
                              </button>
                            </div>
                            {qveDetranNotice && (
                              <p className="text-[10px] text-slate-300 leading-normal bg-orange-500/5 p-2 rounded-lg border border-orange-500/10 font-sans">{qveDetranNotice}</p>
                            )}
                          </div>

                          {/* Fields grid */}
                          <div className="grid grid-cols-2 gap-2.5 text-xxs">
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Placa *</label>
                              <input
                                type="text"
                                placeholder="Ex: BRA2E19"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono uppercase"
                                value={qvePlaca}
                                onChange={(e) => setQvePlaca(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Marca *</label>
                              <input
                                type="text"
                                placeholder="Ex: Volkswagen"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                                value={qveMarca}
                                onChange={(e) => setQveMarca(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Modelo *</label>
                              <input
                                type="text"
                                placeholder="Ex: Gol Trendline"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                                value={qveModelo}
                                onChange={(e) => setQveModelo(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Ano *</label>
                              <input
                                type="text"
                                placeholder="Ex: 2018"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                                value={qveAno}
                                onChange={(e) => setQveAno(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Motorização</label>
                              <input
                                type="text"
                                placeholder="Ex: 1.6 Flex / 1.0 MPI"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                                value={qveMotor}
                                onChange={(e) => setQveMotor(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Cor</label>
                              <input
                                type="text"
                                placeholder="Ex: Preto / Prata"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                                value={qveCor}
                                onChange={(e) => setQveCor(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Km Inicial</label>
                              <input
                                type="number"
                                placeholder="Ex: 65400"
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono"
                                value={qveKm}
                                onChange={(e) => setQveKm(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Chassi</label>
                              <input
                                type="text"
                                placeholder="Opcional..."
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono uppercase"
                                value={qveChassi}
                                onChange={(e) => setQveChassi(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Renavam</label>
                              <input
                                type="text"
                                placeholder="Opcional..."
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white font-mono uppercase"
                                value={qveRenavam}
                                onChange={(e) => setQveRenavam(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              <div className="col-span-2">
                                <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Município</label>
                                <input
                                  type="text"
                                  placeholder="Ex: São Paulo"
                                  className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white"
                                  value={qveMunicipio}
                                  onChange={(e) => setQveMunicipio(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">UF</label>
                                <input
                                  type="text"
                                  maxLength={2}
                                  placeholder="SP"
                                  className="w-full px-1 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white uppercase font-mono"
                                  value={qveUf}
                                  onChange={(e) => setQveUf(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleQuickCreateVehicle}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-white font-extrabold rounded-lg text-xxs transition shadow shadow-black/25"
                            >
                              Salvar Veículo e Selecionar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 select-none">
                          <button
                            type="button"
                            onClick={() => {
                              setQvePlaca(vehicleSearchQuery.toUpperCase());
                              setQveMarca("");
                              setQveModelo("");
                              setQveAno("");
                              setQveMotor("1.6");
                              setQveCor("Preto");
                              setQveKm("");
                              setQveChassi("");
                              setQveRenavam("");
                              setQveMunicipio("São Paulo");
                              setQveUf("SP");
                              setQveDetranNotice("");
                              setShowQuickVehicleForm(true);
                            }}
                            className="text-xxs text-orange-400 hover:text-orange-350 hover:underline flex items-center gap-1.5 cursor-pointer font-bold transition"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Veículo não encontrado? Cadastrar Novo Veículo (Atalho Rápido)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      disabled
                      className="w-full px-2.5 py-2 rounded-lg border border-white/10 bg-slate-900 text-slate-500 text-xs disabled:opacity-45"
                    >
                      <option value="">Selecione o cliente acima primeiro...</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Atribuir Mecânico *</label>
                    <select
                      id="os-mechanic-sel"
                      required
                      className="w-full px-2.5 py-2 rounded-lg border border-white/10 bg-slate-900 text-white"
                      value={mecanicoId}
                      onChange={(e) => setMecanicoId(e.target.value)}
                    >
                      <option value="" className="bg-slate-950">Técnico executor...</option>
                      {mecanicos.map(m => (
                        <option key={m.id} value={m.id} className="bg-slate-950">{m.nome} ({m.especialidade})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Quilometragem (KM) *</label>
                    <input
                      id="os-km-inp"
                      type="number"
                      required
                      className="w-full px-2.5 py-2 rounded-lg border border-white/10 bg-slate-905 bg-slate-900 text-white focus:outline-none"
                      placeholder="Ex: 72000"
                      value={kmAtual}
                      onChange={(e) => setKmAtual(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Sintomas Declarados / Reclamação *</label>
                  <textarea
                    id="os-problema-txt"
                    rows={2}
                    required
                    placeholder="Ex: Barulho agudo de ferro atritando ao pisar no freio de forma lenta."
                    className="w-full px-2.5 py-2 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none"
                    value={descricaoProblema}
                    onChange={(e) => setDescricaoProblema(e.target.value)}
                  />
                </div>

                {/* Multiple parts selection workspace */}
                <div className="p-4 bg-slate-950/20 border border-white/10 rounded-2xl space-y-3.5">
                  <span className="font-bold text-white block text-xxs uppercase tracking-wider">Adicionar Componentes e Peças Utilizadas</span>
                  
                  {/* Quick Part Registration Shortcut Form */}
                  {showQuickPartForm && (
                    <div className="bg-slate-900/80 p-3.5 border border-orange-500/25 rounded-2xl space-y-3 shadow-lg shadow-black/40 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-extrabold text-orange-400 text-xxs uppercase tracking-wider flex items-center gap-1">
                          <PlusCircle className="w-3.5 h-3.5" />
                          Cadastro Rápido de Peça
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickPartForm(false);
                            setFormError("");
                          }}
                          className="text-xxs font-extrabold text-red-400 hover:text-red-300 px-1 py-0.5"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xxs">
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Descrição / Nome *</label>
                          <input
                            type="text"
                            placeholder="Ex: Pastilha de Freio Dianteira"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs"
                            value={qpDescricao}
                            onChange={(e) => setQpDescricao(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Código SKU *</label>
                          <input
                            type="text"
                            placeholder="Ex: SIL-7844"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono uppercase"
                            value={qpSku}
                            onChange={(e) => setQpSku(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Fabricante *</label>
                          <input
                            type="text"
                            placeholder="Ex: Syl / Bosch"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs"
                            value={qpFabricante}
                            onChange={(e) => setQpFabricante(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Estoque Inicial *</label>
                          <input
                            type="number"
                            placeholder="Ex: 5"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                            value={qpEstoque}
                            onChange={(e) => setQpEstoque(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Preço de Custo (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 42.00"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                            value={qpPrecoCusto}
                            onChange={(e) => setQpPrecoCusto(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Preço de Venda (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 85.00"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                            value={qpPrecoVenda}
                            onChange={(e) => setQpPrecoVenda(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleQuickCreatePart}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-550 text-white font-extrabold rounded-lg text-xxs transition shadow shadow-black/20"
                        >
                          Salvar Peça e Selecionar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Part Search input field */}
                    <div className="relative">
                      <Search className="w-3 h-3 text-orange-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Pesquisar peça por SKU, Descrição ou Fabricante..."
                        className="w-full pl-7 pr-7 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/40 text-[11px]"
                        value={partSearchQuery}
                        onChange={(e) => setPartSearchQuery(e.target.value)}
                      />
                      {partSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPartSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-440 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2.5">
                      <div className="flex-1">
                        <select
                          id="os-part-to-add"
                          className="w-full px-1.5 py-2 rounded border border-white/10 bg-slate-900 text-white text-xs"
                          value={pecaIdAdicionar}
                          onChange={(e) => setPecaIdAdicionar(e.target.value)}
                        >
                          {(() => {
                            const filteredPecas = pecas.filter(p => 
                              p.descricao.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
                              p.sku.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
                              p.fabricante.toLowerCase().includes(partSearchQuery.toLowerCase())
                            );
                            return (
                              <>
                                <option value="" className="bg-slate-950">
                                  {filteredPecas.length === 0 
                                    ? "Nenhuma peça correspondente..." 
                                    : `Selecione a peça (${filteredPecas.length} filtradas)...`}
                                </option>
                                {filteredPecas.map(p => (
                                  <option key={p.id} value={p.id} disabled={p.estoque <= 0} className="bg-slate-950">
                                    {p.descricao} [{p.sku}] ({p.fabricante}) - {p.estoque > 0 ? `Disp: ${p.estoque} un` : "SEM ESTOQUE"} - R$ {p.precoVenda.toFixed(2)}
                                  </option>
                                ))}
                              </>
                            );
                          })()}
                        </select>
                      </div>

                      <div className="w-16 shrink-0">
                        <input
                          id="os-part-qty-to-add"
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          className="w-full px-1.5 py-2 bg-slate-900 text-white rounded border border-white/10 text-xs"
                          value={pecaQtdAdicionar}
                          onChange={(e) => setPecaQtdAdicionar(e.target.value)}
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <select
                          id="os-part-mechanic"
                          className="w-full px-1.5 py-2 rounded border border-white/10 bg-slate-900 text-white text-xs"
                          value={pecaMecanicoAdicionar}
                          onChange={(e) => setPecaMecanicoAdicionar(e.target.value)}
                        >
                          <option value="">Técnico para esta Peça...</option>
                          {mecanicos.map(m => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        id="add-part-to-os-row-btn"
                        type="button"
                        onClick={handleAddPartToTable}
                        className="bg-orange-600 hover:bg-orange-550 text-white font-bold px-3 py-1.5 rounded-lg text-xxs cursor-pointer flex items-center justify-center shrink-0 transition"
                      >
                        <Plus className="w-4 h-4 text-slate-900" />
                      </button>
                    </div>

                    {!showQuickPartForm && (
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => {
                            setQpSku("");
                            setQpDescricao("");
                            setQpFabricante("");
                            setQpEstoque("5");
                            setQpPrecoCusto("");
                            setQpPrecoVenda("");
                            setShowQuickPartForm(true);
                          }}
                          className="text-xxs text-orange-400 hover:text-orange-350 hover:underline flex items-center gap-1 cursor-pointer font-bold mt-1.5 transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Cadastrar Nova Peça no Estoque (Atalho Rápido)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Selected parts listing */}
                  {pecasEscolhidas.length > 0 ? (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {pecasEscolhidas.map((p, idx) => {
                        const original = getPecaDetail(p.pecaId);
                        return (
                          <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-2 text-xxs font-sans text-slate-200">
                            <div className="flex justify-between items-center bg-slate-950/30 p-1.5 rounded">
                              <p className="font-extrabold text-orange-400 truncate max-w-[80%]">
                                {original?.descricao || "Componente avulso"} <span className="text-[10px] text-slate-400 font-mono">[{original?.sku || "N/A"}]</span>
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRemovePartFromTable(idx)}
                                className="text-red-400 hover:text-red-350 p-1 cursor-pointer transition duration-150"
                                title="Remover Peça"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                              <div>
                                <label className="text-slate-400 text-[10px] block font-bold mb-1 uppercase tracking-wider">Quant.</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full px-2 py-1 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                                  value={p.quantidade}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    const updated = [...pecasEscolhidas];
                                    updated[idx].quantidade = val;
                                    setPecasEscolhidas(updated);
                                  }}
                                />
                              </div>

                              <div>
                                <label className="text-slate-404 text-slate-400 text-[10px] block font-bold mb-1 uppercase tracking-wider">Valor Un (R$)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-full px-2 py-1 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                                  value={p.precoUnitario}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    const updated = [...pecasEscolhidas];
                                    updated[idx].precoUnitario = val;
                                    setPecasEscolhidas(updated);
                                  }}
                                />
                              </div>

                              <div>
                                <label className="text-slate-400 text-[10px] block font-bold mb-1 uppercase tracking-wider">Instalador Técnico</label>
                                <select
                                  className="w-full px-1.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-[10px]"
                                  value={p.mecanicoId || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = [...pecasEscolhidas];
                                    updated[idx].mecanicoId = val || undefined;
                                    setPecasEscolhidas(updated);
                                  }}
                                >
                                  <option value="">Técnico Padrão</option>
                                  {mecanicos.map(m => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Subtotal</span>
                                <span className="font-mono text-orange-400 font-extrabold text-[11px]">{formatCurrency(p.quantidade * p.precoUnitario)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xxs italic">Nenhuma peça ou componente adicionado a esta OS ainda.</p>
                  )}
                </div>

                {/* Detailed Services & Labor List Builder */}
                <div className="p-4 bg-slate-950/20 border border-white/10 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-orange-400 block text-xxs uppercase tracking-wider">
                      Serviços de Mão de Obra Detalhados (Técnicos Diferentes)
                    </span>
                    <span className="text-[10px] text-slate-400 italic">Múltiplos executores por OS</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xxs bg-slate-900/40 p-3 rounded-lg border border-white/5">
                    {/* Descricao */}
                    <div className="sm:col-span-5">
                      <label className="text-slate-405 text-slate-400 block mb-1 uppercase font-bold text-[9px]">Nome/Descrição do Serviço</label>
                      <input
                        type="text"
                        placeholder="Ex: Suspensão dianteira / Elétrica geral"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs"
                        value={descServicoAdicionar}
                        onChange={(e) => setDescServicoAdicionar(e.target.value)}
                      />
                    </div>

                    {/* Valor */}
                    <div className="sm:col-span-3">
                      <label className="text-slate-400 block mb-1 uppercase font-bold text-[9px]">Mão de Obra (R$)</label>
                      <input
                        type="number"
                        placeholder="Ex: 150"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-xxs font-mono"
                        value={valueServicoAdicionar}
                        onChange={(e) => setValueServicoAdicionar(e.target.value)}
                      />
                    </div>

                    {/* Tecnico */}
                    <div className="sm:col-span-3">
                      <label className="text-slate-400 block mb-1 uppercase font-bold text-[9px]">Técnico Executor</label>
                      <select
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded text-white text-[11px]"
                        value={mecanicoServicoAdicionar}
                        onChange={(e) => setMecanicoServicoAdicionar(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {mecanicos.map(m => (
                          <option key={m.id} value={m.id}>{m.nome} ({m.especialidade})</option>
                        ))}
                      </select>
                    </div>

                    {/* Action */}
                    <div className="sm:col-span-1 flex items-end justify-center">
                      <button
                        type="button"
                        onClick={handleAddDetailedService}
                        className="bg-orange-600 hover:bg-orange-550 text-slate-900 font-bold p-1.5 rounded-lg text-xxs flex items-center justify-center transition cursor-pointer w-full h-8"
                        title="Adicionar Serviço Técnico"
                      >
                        <Plus className="w-4 h-4 text-slate-905" />
                      </button>
                    </div>
                  </div>

                  {/* List of registered detailed services */}
                  {servicosDetalhados.length > 0 ? (
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {servicosDetalhados.map((s) => {
                        return (
                          <div key={s.id} className="p-2.5 bg-slate-950/40 rounded-lg border border-white/5 flex justify-between items-center text-slate-300 text-xxs">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white truncate">{s.descricao}</p>
                              <p className="text-[10px] text-orange-400 font-medium">Técnico Executor: <span className="font-extrabold">{getMecanicoNome(s.mecanicoId)}</span></p>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-extrabold text-emerald-400">{formatCurrency(s.valor)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDetailedService(s.id)}
                                className="text-red-400 hover:text-red-350 p-1 cursor-pointer"
                                title="Excluir Serviço"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] italic leading-snug">
                      Nenhum serviço individual cadastrado ainda. Pode detalhar serviços acima para associar executores diferentes por tarefa (mão de obra será somada de forma automática), ou preencher o valor global de mão de obra abaixo.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div>
                    <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wider">Custo Mão de Obra (R$) *</label>
                    <input
                      id="os-labor-inp"
                      type="number"
                      className="w-full px-2.5 py-1.5 border border-white/10 rounded-lg focus:outline-none font-bold text-white bg-slate-900"
                      placeholder="Ex: 150.00"
                      value={valorMaoDeObra}
                      onChange={(e) => setValorMaoDeObra(e.target.value)}
                    />
                  </div>

                  <div className="text-right flex flex-col justify-end">
                    <span className="text-xxs text-slate-400 font-bold block uppercase font-sans">Cálculo Dinâmico OS:</span>
                    <span className="text-lg font-black text-orange-400 font-mono leading-tight">
                      {formatCurrency(calculatedTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xxs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-white/5 border border-white/5 text-slate-300 font-bold rounded-lg hover:bg-white/10 transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    id="save-new-os-btn"
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-white font-bold rounded-lg shadow-md transition cursor-pointer"
                  >
                    Abrir Ordem de Serviço
                  </button>
                </div>
              </form>

              {/* Maintenance history memories column (5/12 of details grid) */}
              <div className="md:col-span-5 bg-white/1 rounded-2xl p-4 border border-white/10 h-fit space-y-4 text-slate-200">
                <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <History className="w-4 h-4 text-orange-400" />
                  <h4 className="font-bold text-white text-xxs uppercase tracking-wider">Memória por Placa</h4>
                </div>

                {!veiculoId ? (
                  <p className="text-slate-450 text-xxs italic leading-relaxed">Selecione o veículo do cliente para visualizar o histórico de passagens retroativo do carro de de relance.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-xxs font-sans">
                      <span className="text-slate-405 text-slate-400 block font-medium">Veículo Selecionado</span>
                      <p className="font-extrabold text-white mt-1">{selectedVehicle?.marca} {selectedVehicle?.modelo}</p>
                      <p className="text-xxs font-mono text-orange-400 font-bold mt-0.5">Placa: {selectedVehicle?.placa} | KM: {selectedVehicle?.km.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      <span className="text-[10px] text-orange-300 block font-bold">Passagens Concluídas ({vHistory.length})</span>
                      
                      {vHistory.length === 0 ? (
                        <p className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-slate-450 text-xxs italic text-center">Nenhuma manutenção registrada anteriormente para este carro.</p>
                      ) : (
                        vHistory.map(os => (
                          <div key={os.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xxs leading-relaxed shadow-md">
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="font-bold font-mono text-orange-400">#{os.id.slice(-6).toUpperCase()}</span>
                              <span>{os.dataConclusao}</span>
                            </div>

                            <p className="text-white font-semibold italic">"{os.descricaoProblema}"</p>
                            
                            <p className="text-slate-300 leading-snug">
                              <strong>Solução:</strong> {os.servicosRealizados}
                            </p>

                            {os.pecasUtilizadas.length > 0 && (
                              <div className="pt-1 text-xxs text-slate-400 font-mono space-y-0.5 border-t border-white/5">
                                <span className="font-bold text-slate-450 font-sans block">Peças:</span>
                                {os.pecasUtilizadas.map((p, pidx) => (
                                  <div key={pidx} className="truncate text-orange-355 text-orange-400/80">
                                    - {getPecaDetail(p.pecaId)?.descricao} (x{p.quantidade})
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-1.5 border-t border-white/5 font-bold font-mono text-slate-300">
                              <span>KM: {os.kmAtual.toLocaleString()}</span>
                              <span className="text-white">{formatCurrency(os.valorTotal)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State B: No Selection */}
        {!selectedOS && !showAddForm && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Wrench className="w-12 h-12 text-slate-500 mb-3 animate-spin" style={{ animationDuration: "12s" }} />
            <h3 className="font-bold text-white text-sm">Nenhuma Ordem Selecionada</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Escolha uma ordem na barra lateral para gerenciar, editar serviços realizados, mudar status operacionais ou emitir faturamentos fiscais (NF-e/NFS-e).
            </p>
          </div>
        )}

        {/* State C: Order Details Display */}
        {selectedOS && !showAddForm && (
          <div className="p-6 space-y-6 text-xs text-slate-200">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white/5 border border-white/10 rounded-2xl gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-950 border border-white/5 text-orange-400 px-2 py-0.5 rounded shadow-md">
                    #{selectedOS.id.toUpperCase()}
                  </span>
                  
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                    selectedOS.status === "Concluído" ? "bg-emerald-500/15 text-emerald-450 border border-emerald-500/20" :
                    selectedOS.status === "Cancelado" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                    "bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse"
                  }`}>
                    {selectedOS.status}
                  </span>
                </div>

                <p className="text-xxs text-slate-450 font-mono mt-1">Abertura: {selectedOS.dataAbertura} {selectedOS.dataConclusao ? `| Conclusão: ${selectedOS.dataConclusao}` : ""}</p>
              </div>

              {/* Status updater actions */}
              {selectedOS.status === "Em Andamento" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    id={`complete-os-btn-${selectedOS.id}`}
                    onClick={() => {
                      setActiveCheckoutOSId(selectedOS.id);
                      setCheckoutDiscount("0");
                      setCheckoutSplitPayments({
                        "Dinheiro": 0,
                        "Pix": 0,
                        "Débito": 0,
                        "Crédito": 0,
                        "Crédito Parcelado": 0,
                      });
                      setTimeout(() => {
                        const el = document.getElementById("init-checkout-btn") || document.getElementById("checkout-title-label");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xxs px-3 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-md"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-slate-900" />
                    <span>Fechar OS</span>
                  </button>

                  <button
                    id={`cancel-os-btn-${selectedOS.id}`}
                    onClick={() => handleUpdateStatus(selectedOS.id, "Cancelado")}
                    className="bg-red-550/10 hover:bg-red-550/20 text-red-400 font-bold text-xxs px-3 py-2 rounded-lg border border-red-500/20 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancelar OS</span>
                  </button>
                </div>
              )}

              {(selectedOS.status === "Concluído" || selectedOS.status === "Cancelado") && (
                <div className="flex gap-2 shrink-0">
                  <button
                    id={`reopen-os-btn-${selectedOS.id}`}
                    type="button"
                    onClick={() => handleReopenOS(selectedOS)}
                    className="bg-orange-600 hover:bg-orange-500 text-slate-950 font-black text-xxs px-3.5 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-md shadow-orange-950/25 border border-orange-500/40 animate-fadeIn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reabrir OS</span>
                  </button>
                </div>
              )}
            </div>

            {/* COMPLETED SUCCESS - PRINT OR ISSUE NF PANEL */}
            {selectedOS.status === "Concluído" && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CheckCheck className="w-5 h-5 text-emerald-400" />
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Status atual: Ordem de Serviço Finalizada / Concluída</h4>
                    <p className="text-xxs text-slate-300">Escolha as opções de faturamento fiscal de peças (NF-e) ou faturamento municipal de serviços (NFS-e/RPS) abaixo:</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Imprimir OS / Via do Cliente */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrintPreview(true);
                      setFormError("");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-850 text-white font-black text-xs transition duration-150 shadow-md cursor-pointer text-center"
                  >
                    <Printer className="w-4 h-4 text-orange-400" />
                    <span>Imprimir Cupom / Via OS</span>
                  </button>

                  {/* Option 2: Emitir NF-e (DANFE - Produtos) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOS.nfeEmitida) {
                        setDanfeOS(selectedOS);
                        setShowDanfePreview(true);
                        return;
                      }
                      const today = new Date();
                      const yy = String(today.getFullYear()).slice(-2);
                      const mm = String(today.getMonth() + 1).padStart(2, "0");
                      const randomId = Math.floor(100000000 + Math.random() * 900000000);
                      const randomCode = Math.floor(10000000 + Math.random() * 90000000);
                      const generatedChave = "35" + yy + mm + "45089301000105" + "55" + "001" + String(randomId).padStart(9, "0") + "1" + randomCode + "4";
                      
                      const updated = ordens.map(os => {
                        if (os.id === selectedOS.id) {
                          return { ...os, nfeEmitida: true, nfeChave: generatedChave };
                        }
                        return os;
                      });
                      onUpdateOrdens(updated);
                      const modifiedOS = updated.find(x => x.id === selectedOS.id);
                      if (modifiedOS) {
                        setSelectedOS(modifiedOS);
                        setDanfeOS(modifiedOS);
                        setShowDanfePreview(true);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs transition duration-150 cursor-pointer text-center ${
                      selectedOS.nfeEmitida 
                        ? "bg-slate-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20" 
                        : "bg-orange-600 hover:bg-orange-550 text-white shadow-md shadow-orange-950/50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{selectedOS.nfeEmitida ? "✓ Ver DANFE (NF-e)" : "Emitir NF-e (Peças)"}</span>
                  </button>

                  {/* Option 3: Emitir NFS-e (RPS - Serviços) */}
                  <button
                    type="button"
                    disabled={selectedOS.nfseEmitida}
                    onClick={() => {
                      const updated = ordens.map(os => {
                        if (os.id === selectedOS.id) {
                          return { ...os, nfseEmitida: true, nfseChave: "2026" + Math.floor(100000 + Math.random() * 900000) + "A" };
                        }
                        return os;
                      });
                      onUpdateOrdens(updated);
                      const modifiedOS = updated.find(x => x.id === selectedOS.id);
                      if (modifiedOS) setSelectedOS(modifiedOS);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs transition duration-150 cursor-pointer text-center ${
                      selectedOS.nfseEmitida 
                        ? "bg-slate-950 border border-slate-850 text-slate-500 cursor-not-allowed" 
                        : "bg-orange-600 hover:bg-orange-550 text-white shadow-md shadow-orange-950/50"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>{selectedOS.nfseEmitida ? "✓ NFS-e Emitida (RPS)" : "Emitir NFS-e (Mão de Obra)"}</span>
                  </button>
                </div>

                {/* Simulated transmission confirmation & print layout entry options */}
                {(selectedOS.nfeChave || selectedOS.nfseChave) && (
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-xxs font-mono">
                    <p className="font-extrabold text-white text-[10px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                      <span>DOCUMENTOS TRANSMITIDOS COM SUCESSO</span>
                    </p>
                    <p className="text-slate-400">Nota fiscal transmitida para a SEFAZ de acordo com o padrão homologado. Para salvar as vias em PDF, use as opções rápidas abaixo ou o menu principal "Módulo Fiscal":</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-sans">
                      {selectedOS.nfeChave && (
                        <button
                          type="button"
                          onClick={() => {
                            setDanfeOS(selectedOS);
                            setShowDanfePreview(true);
                          }}
                          className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/60 p-2.5 rounded-lg flex items-center justify-between text-left cursor-pointer w-full"
                        >
                          <span className="text-emerald-450 text-emerald-400 truncate mr-2">DANFE (NF-e) Gerada: #{selectedOS.nfeChave.slice(-10)}</span>
                          <span className="text-[10px] text-white/85 font-black bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">Visualizar DANFE</span>
                        </button>
                      )}
                      {selectedOS.nfseChave && (
                        <div className="bg-slate-900 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-emerald-400 truncate mr-2">RPS (NFS-e) Gerada: {selectedOS.nfseChave}</span>
                          <span className="text-[10px] text-white/80 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded">Salvar PDF</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ações de Impressão e Compartilhamento de Orçamento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-950/40 p-4 border border-orange-500/20 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowPrintPreview(true);
                  setFormError("");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-550 text-white font-extrabold text-xs transition duration-150 shadow-md shadow-orange-950/50 cursor-pointer text-center"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Imprimir Orçamento</span>
              </button>
              
              <button
                type="button"
                onClick={() => initWhatsAppShare(selectedOS)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold text-xs transition duration-150 shadow-md shadow-emerald-950/50 cursor-pointer text-center"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Enviar via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => initEmailShare(selectedOS)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs border border-white/5 transition duration-150 shadow-sm cursor-pointer text-center"
              >
                <Mail className="w-4 h-4 text-orange-400" />
                <span>Enviar via E-mail</span>
              </button>
            </div>

            {/* Entities profiles in columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-start gap-2">
                <User className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xxs text-slate-400 block font-bold">CLIENTE TITULAR</span>
                  <p className="font-extrabold text-white truncate mt-0.5">{getClienteNome(selectedOS.clienteId)}</p>
                  <p className="text-xxs text-slate-450 mt-0.5 truncate">{clientes.find(c => c.id === selectedOS.clienteId)?.telefone}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-start gap-2">
                <Car className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xxs text-slate-400 block font-bold">VEÍCULO / MÁQUINA</span>
                  <p className="font-extrabold text-white truncate mt-0.5">{getVeiculoFmt(selectedOS.veiculoId)}</p>
                  <p className="text-xxs text-slate-450 mt-0.5 font-bold font-mono">KM Entrada: {selectedOS.kmAtual.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xxs text-slate-400 block font-bold">TÉCNICO ASSOCIADO</span>
                  <p className="font-extrabold text-white truncate mt-0.5">{getMecanicoNome(selectedOS.mecanicoId)}</p>
                  <p className="text-xxs text-slate-450 mt-0.5 font-medium">Comissão: {mecanicos.find(m => m.id === selectedOS.mecanicoId)?.comissaoPercentual}%</p>
                </div>
              </div>
            </div>

            {/* Description symptoms */}
            <div className="space-y-2 pb-4 border-b border-white/5">
              <h4 className="font-bold text-white">Sintoma/Problema Informado:</h4>
              <p className="p-3.5 bg-slate-950/40 text-slate-300 rounded-xl border border-white/5 italic">
                "{selectedOS.descricaoProblema}"
              </p>
            </div>

            {/* Solutions / Diagnostics executed */}
            {selectedOS.status === "Concluído" && (
              <div className="space-y-2 pb-4 border-b border-white/5">
                <h4 className="font-bold text-emerald-300">Descrição Técnica da Manutenção / Soluções Efetuadas:</h4>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 rounded-xl whitespace-pre-line leading-relaxed">
                  {selectedOS.servicosRealizados}
                </div>
              </div>
            )}

            {/* List of accessories consumed */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-white">Peças e Peças de Substituição Aplicadas:</h4>

              {selectedOS.pecasUtilizadas.length === 0 ? (
                <p className="text-slate-500 italic text-xxs">Nenhum insumo físico consumido nesta Ordem.</p>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-350 text-xxs uppercase tracking-wider font-bold border-b border-white/10">
                        <th className="p-3">Peça / Insumo</th>
                        <th className="p-3">Fabricante</th>
                        <th className="p-3 text-center">Técnico Instalador</th>
                        <th className="p-3 text-center">Quantidade</th>
                        <th className="p-3 text-right">Valor Unitário</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOS.pecasUtilizadas.map((item, idx) => {
                        const spec = getPecaDetail(item.pecaId);
                        return (
                          <tr key={idx} className="hover:bg-white/5 text-xxs text-slate-300 border-b border-white/5 last:border-0">
                            <td className="p-3 font-bold text-white">{spec?.descricao} [{spec?.sku || "SKU-MOCK"}]</td>
                            <td className="p-3">{spec?.fabricante}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 bg-slate-900 border border-white/10 text-orange-400 rounded text-[10px] font-mono">
                                {item.mecanicoId ? getMecanicoNome(item.mecanicoId) : `${getMecanicoNome(selectedOS.mecanicoId)} (Geral)`}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{item.quantidade}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                            <td className="p-3 text-right font-mono font-extrabold text-orange-400">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detailed technical services and assigned operators */}
            {selectedOS.servicosDetalhados && selectedOS.servicosDetalhados.length > 0 && (
              <div className="space-y-3.5 pt-4 border-t border-white/5">
                <h4 className="font-bold text-white">Serviços Executados e Operadores Técnicos:</h4>
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-350 text-xxs uppercase tracking-wider font-bold border-b border-white/10">
                        <th className="p-3">Descrição Técnica do Serviço Realizado</th>
                        <th className="p-3">Técnico Executor</th>
                        <th className="p-3 text-right">Mão de Obra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOS.servicosDetalhados.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 text-xxs text-slate-300 border-b border-white/5 last:border-0">
                          <td className="p-3 font-extrabold text-white">{item.descricao}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 bg-orange-600/15 border border-orange-500/25 text-orange-400 rounded-full font-bold text-[10px]">
                              {getMecanicoNome(item.mecanicoId)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(item.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Balance total financial layout */}
            <div className="p-5 bg-white/10 border border-white/10 backdrop-blur-xl text-slate-200 rounded-2xl shadow-xl flex justify-between items-center font-sans">
              <div className="space-y-1.5">
                <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">CÁLCULO FINANCEIRO INTEGRAL</p>
                <p className="text-xxs text-slate-350">
                  Mão de Obra Técnica: <span className="font-bold text-white font-mono">{formatCurrency(selectedOS.valorMaoDeObra)}</span>
                </p>
                <p className="text-xxs text-slate-350 font-medium">
                  Sub-Total Peças: <span className="font-bold text-white font-mono">{formatCurrency(selectedOS.valorTotal - selectedOS.valorMaoDeObra)}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xxs text-slate-400 font-bold block uppercase tracking-wider">Valor OS Consolidado</span>
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{formatCurrency(selectedOS.valorTotal)}</span>
              </div>
            </div>

            {/* EVS - Evidências Visuais e Gestão de Imagens */}
            <EVSManager 
              ordem={selectedOS}
              mecanicos={mecanicos}
              pecas={pecas}
              onUpdateEvidences={handleUpdateOSEvidences}
            />

            {/* Sempre na parte inferior - Assistente de Encerramento e Faturamento */}
            {renderCheckoutWizard(selectedOS)}

          </div>
        )}

        {/* Visual Large Modal: EXPANDED SERVICE ORDER IN TELA MAIOR */}
        {isOSMaximized && selectedOS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden text-slate-200">
              
              {/* Header of Modal */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-5 h-5 text-orange-500 animate-pulse" />
                  <div>
                    <h3 className="text-base font-extrabold text-white">Visualização Ampliada - Ordem de Serviço #{selectedOS.id.toUpperCase()}</h3>
                    <p className="text-xxs text-slate-450 text-slate-400">
                      Cliente: <strong className="text-white">{getClienteNome(selectedOS.clienteId)}</strong> | Veículo: <strong className="text-white">{getVeiculoFmt(selectedOS.veiculoId)}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOSMaximized(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title="Fechar visualização"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left side: Information Sheets and Diagnostics profile (4/12 width) */}
                  <div className="lg:col-span-4 space-y-5">
                    
                    {/* Status & Timing Box */}
                    <div className="p-4 bg-slate-950/45 border border-white/5 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Status Geral e Período</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-md border ${
                          selectedOS.status === "Concluído" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                          selectedOS.status === "Cancelado" ? "bg-red-500/15 text-red-500 border-red-500/20" :
                          "bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse"
                        }`}>
                          {selectedOS.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono leading-relaxed text-slate-400 space-y-1">
                        <p>Abertura: <span className="text-white">{selectedOS.dataAbertura}</span></p>
                        {selectedOS.dataConclusao && (
                          <p>Conclusão: <span className="text-emerald-400">{selectedOS.dataConclusao}</span></p>
                        )}
                      </div>
                    </div>

                    {/* Customer Sheet Card */}
                    <div className="p-4 bg-slate-950/20 border border-white/10 rounded-xl flex items-start gap-3">
                      <User className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block tracking-wider">Cliente Solicitante</span>
                        <p className="font-extrabold text-white text-sm truncate mt-0.5">{getClienteNome(selectedOS.clienteId)}</p>
                        {clientes.find(c => c.id === selectedOS.clienteId) && (
                          <div className="text-xxs text-slate-400 mt-1 font-medium space-y-0.5">
                            <p>Telefone: {clientes.find(c => c.id === selectedOS.clienteId)?.telefone}</p>
                            <p>Documento: {clientes.find(c => c.id === selectedOS.clienteId)?.cpfCnpj}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle detail Card */}
                    <div className="p-4 bg-slate-950/20 border border-white/10 rounded-xl flex items-start gap-3">
                      <Car className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block tracking-wider">Veículo do Cliente</span>
                        <p className="font-extrabold text-white text-sm truncate mt-0.5">{getVeiculoFmt(selectedOS.veiculoId)}</p>
                        <p className="text-xxs text-slate-400 mt-1 font-bold font-mono">Quilometragem: {selectedOS.kmAtual.toLocaleString()} KM</p>
                      </div>
                    </div>

                    {/* Technician and operator Assigned */}
                    <div className="p-4 bg-slate-950/20 border border-white/10 rounded-xl flex items-start gap-3">
                      <Users className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block tracking-wider">Equipe de Execução</span>
                        <p className="font-extrabold text-white text-sm truncate mt-0.5">{getMecanicoNome(selectedOS.mecanicoId)}</p>
                        <p className="text-xxs text-slate-400 mt-1 font-medium">Comissão Técnica: {mecanicos.find(m => m.id === selectedOS.mecanicoId)?.comissaoPercentual || 0}%</p>
                      </div>
                    </div>

                    {/* Reported Problem Symptoms section */}
                    <div className="p-4 bg-slate-950/45 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Sintoma Declarado pelo Cliente</span>
                      <p className="italic text-slate-300 bg-slate-950/30 p-3 rounded-lg border border-white/5 leading-relaxed">
                        "{selectedOS.descricaoProblema || "Nenhum informado"}"
                      </p>
                    </div>

                    {/* Maintenance Log actions */}
                    {selectedOS.status === "Concluído" && (
                      <div className="p-4 bg-emerald-950/25 border border-emerald-500/20 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-black text-emerald-300 block tracking-wider">Relatório de Soluções Executadas</span>
                        <p className="whitespace-pre-line text-emerald-400 bg-slate-950/30 p-3 rounded-lg leading-relaxed font-sans">
                          {selectedOS.servicosRealizados}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Right side: Operations & Financial statement (8/12 width) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Operations Quick Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/60 border border-white/10 rounded-xl gap-4">
                      <div>
                        <h4 className="font-bold text-white text-xs">Ações Disponíveis para a OS</h4>
                        <p className="text-xxs text-slate-400">Imprima, envie ao cliente ou conclua o serviço atual</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedOS.status === "Em Andamento" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setIsOSMaximized(false);
                                setActiveCheckoutOSId(selectedOS.id);
                                setCheckoutDiscount("0");
                                setCheckoutSplitPayments({
                                  "Dinheiro": 0,
                                  "Pix": 0,
                                  "Débito": 0,
                                  "Crédito": 0,
                                  "Crédito Parcelado": 0,
                                });
                                setTimeout(() => {
                                  const el = document.getElementById("init-checkout-btn") || document.getElementById("checkout-title-label");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }, 250);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xxs px-3 py-1.5 rounded flex items-center gap-1 transition shadow-md cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Fechar OS</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateStatus(selectedOS.id, "Cancelado");
                              }}
                              className="bg-red-550/10 hover:bg-red-550/20 text-red-405 text-red-400 font-bold text-xxs px-3 py-1.5 rounded border border-red-500/20 flex items-center gap-1 transition cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancelar OS</span>
                            </button>
                          </>
                        )}
                        
                        {(selectedOS.status === "Concluído" || selectedOS.status === "Cancelado") && (
                          <button
                            type="button"
                            onClick={() => {
                              handleReopenOS(selectedOS);
                            }}
                            className="bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold text-xxs px-3 py-1.5 rounded flex items-center gap-1 transition shadow-md cursor-pointer animate-fadeIn"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reabrir OS</span>
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            setShowPrintPreview(true);
                            setFormError("");
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-white/5 transition flex items-center gap-1.5 text-xxs cursor-pointer"
                          title="Imprimir Orçamento"
                        >
                          <Printer className="w-3.5 h-3.5 text-orange-400" />
                          <span>Imprimir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => initWhatsAppShare(selectedOS)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-white/5 transition flex items-center gap-1.5 text-xxs cursor-pointer"
                          title="Enviar via WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => initEmailShare(selectedOS)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-white/5 transition flex items-center gap-1.5 text-xxs cursor-pointer"
                          title="Enviar via E-mail"
                        >
                          <Mail className="w-3.5 h-3.5 text-teal-400" />
                          <span>E-mail</span>
                        </button>
                      </div>
                    </div>

                    {/* Financial Statement banner */}
                    <div className="p-5 bg-white/5 border border-white/10 text-slate-200 rounded-xl shadow mt-1 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Consolidação Financeira</span>
                        <p className="text-xxs text-slate-400">Mão de Obra: <span className="font-bold text-slate-200 font-mono">{formatCurrency(selectedOS.valorMaoDeObra)}</span></p>
                        <p className="text-xxs text-slate-400 font-medium">Insumos/Peças: <span className="font-bold text-slate-200 font-mono">{formatCurrency(selectedOS.valorTotal - selectedOS.valorMaoDeObra)}</span></p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9.5px] text-slate-405 text-slate-400 font-bold block uppercase tracking-wider">VALOR TOTAL OS</span>
                        <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">{formatCurrency(selectedOS.valorTotal)}</span>
                      </div>
                    </div>

                    {/* Parts List */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block border-b border-white/5 pb-1">Peças e Componentes Aplicados</span>
                      {selectedOS.pecasUtilizadas.length === 0 ? (
                        <p className="text-slate-450 italic mt-2">Nenhum componente físico aplicado nesta Ordem.</p>
                      ) : (
                        <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/20 text-xxs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white/5 text-slate-400 border-b border-white/10 uppercase font-black tracking-wider text-[9px]">
                                <th className="p-3">Componente / Peça</th>
                                <th className="p-3">Fabricante</th>
                                <th className="p-3 text-center">Técnico Instalador</th>
                                <th className="p-3 text-center">Unidades</th>
                                <th className="p-3 text-right">Preço Unitário</th>
                                <th className="p-3 text-right">Custo Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedOS.pecasUtilizadas.map((item, idx) => {
                                const spec = getPecaDetail(item.pecaId);
                                return (
                                  <tr key={idx} className="hover:bg-white/5 text-slate-300">
                                    <td className="p-3 font-bold text-white">{spec?.descricao || "Componente"} [{spec?.sku || "SKU"}]</td>
                                    <td className="p-3">{spec?.fabricante || "-"}</td>
                                    <td className="p-3 text-center">
                                      <span className="px-2 py-0.5 bg-slate-900 border border-white/5 text-orange-400 font-bold rounded text-[9.5px]">
                                        {item.mecanicoId ? getMecanicoNome(item.mecanicoId) : `${getMecanicoNome(selectedOS.mecanicoId)} (Geral)`}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-bold">{item.quantidade}</td>
                                    <td className="p-3 text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                                    <td className="p-3 text-right font-mono font-extrabold text-orange-400">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Detailed Services & Assigned Technicians section in Modal */}
                    {selectedOS.servicosDetalhados && selectedOS.servicosDetalhados.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block border-b border-white/5 pb-1">Serviços Técnicos Diferenciados Executados</span>
                        <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/20 text-xxs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white/5 text-slate-400 border-b border-white/10 uppercase font-black tracking-wider text-[9px]">
                                <th className="p-3">Descrição do Serviço Efetuado</th>
                                <th className="p-3">Técnico Executor Responsável</th>
                                <th className="p-3 text-right">Valor Mão de Obra</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedOS.servicosDetalhados.map((item, sIdx) => (
                                <tr key={sIdx} className="hover:bg-white/5 text-slate-300">
                                  <td className="p-3 font-extrabold text-white">{item.descricao}</td>
                                  <td className="p-3">
                                    <span className="px-2.5 py-0.5 bg-orange-600/15 border border-orange-500/25 text-orange-400 rounded-full font-black text-[9.5px]">
                                      {getMecanicoNome(item.mecanicoId)}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400">{formatCurrency(item.valor)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Visual Evidences under modal context */}
                    <div className="p-4 bg-slate-950/20 border border-white/5 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Gerenciador de Evidências Visuais</span>
                      <EVSManager 
                        ordem={selectedOS}
                        mecanicos={mecanicos}
                        pecas={pecas}
                        onUpdateEvidences={handleUpdateOSEvidences}
                      />
                    </div>

                    {/* Sempre na parte inferior - Assistente de Encerramento e Faturamento */}
                    {renderCheckoutWizard(selectedOS)}

                  </div>
                </div>
              </div>

              {/* Footer of Modal */}
              <div className="p-4.5 border-t border-white/5 bg-slate-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOSMaximized(false)}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-550 text-slate-950 font-black rounded-xl text-xs transition duration-150 cursor-pointer shadow-md"
                >
                  <span>Fechar Visualização Ampliada</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL / VIEW: DANFE PREVIEW (NF-e/CUPOM) */}
        {showDanfePreview && danfeOS && (() => {
          const danfeCliente = clientes.find(c => c.id === danfeOS.clienteId);
          const danfeVeiculo = veiculos.find(v => v.id === danfeOS.veiculoId);
          const danfeMecanico = mecanicos.find(m => m.id === danfeOS.mecanicoId);
          const danfePecas = danfeOS.pecasUtilizadas || [];
          const danfeServicos = danfeOS.servicosDetalhados || [];
          
          const totalPecas = danfePecas.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
          const totalServicos = danfeOS.valorMaoDeObra || 0;
          const desconto = danfeOS.fechamentoAdm?.desconto || 0;
          const totalLiquido = Math.max(0, danfeOS.valorTotal - desconto);
          
          // Format date beautifully
          const emissionDate = danfeOS.dataConclusao 
            ? danfeOS.dataConclusao.split("-").reverse().join("/") 
            : new Date().toLocaleDateString("pt-BR");
            
          const randomChave = danfeOS.nfeChave || "3526064508930100010555001" + Math.floor(100000000 + Math.random() * 900000000) + "103829104";

          return (
            <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-4 md:p-8 flex flex-col items-center animate-fadeIn font-sans text-slate-800">
              
              {/* Header Controls for Screen (hidden when printing) */}
              <div className="no-print w-full max-w-4xl bg-slate-900 border border-white/10 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Documento Auxiliar de Nota Fiscal (DANFE)</h3>
                    <p className="text-[10px] text-slate-400">Layout homologado conforme padrões da SEFAZ para oficinas mecânicas.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleExecuteDanfePrint(danfeOS)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xxs transition duration-155 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-1/2 sm:w-auto"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-950" />
                    <span>IMPRIMIR NOTA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDanfePreview(false);
                      setDanfeOS(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-xl text-xxs transition duration-150 cursor-pointer w-1/2 sm:w-auto"
                  >
                    Voltar ao Painel
                  </button>
                </div>
              </div>

              {/* Printable Scroll Container - enables swipe/scroll on mobile so it doesn't break layout */}
              <div className="w-full max-w-4xl overflow-x-auto bg-slate-905 p-1 md:p-0 rounded-2xl border border-white/5 scrollbar-thin">
                
                {/* Paper sheet */}
                <div 
                  id="print-danfe-sheet"
                  className="mx-auto bg-white text-slate-900 p-6 md:p-8 border border-slate-300 w-[800px] shrink-0 font-sans leading-normal"
                >
                  {/* Custom print CSS styles scoped inside */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #print-danfe-sheet, #print-danfe-sheet * {
                        visibility: visible !important;
                      }
                      #print-danfe-sheet {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        box-shadow: none !important;
                        padding: 2.5mm !important;
                        margin: 0 !important;
                        border: none !important;
                        background: white !important;
                        color: black !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}} />

                  {/* 1. SE RECEBIMENTO SLIP (COMPROVANTE DE RECEBIMENTO) */}
                  <div className="border border-black mb-1 p-1 text-[8px] grid grid-cols-12 gap-1 font-sans">
                    <div className="col-span-9 border-r border-black pr-2 select-all leading-normal">
                      RECEBEMOS DE <strong className="uppercase">{config?.nomeOficina || "oficina mecânica karter"}</strong> OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO. EMISSÃO: {emissionDate} - VALOR TOTAL: R$ {totalLiquido.toFixed(2).replace(".", ",")}
                    </div>
                    <div className="col-span-3 text-center flex flex-col justify-center">
                      <span className="font-bold block text-[9px]">NF-e</span>
                      <span className="font-extrabold text-[9px]">Nº {randomChave.slice(-14, -5)}</span>
                      <span className="block">Série 1</span>
                    </div>
                  </div>
                  
                  <div className="border border-black mb-3 p-1 text-[8px] grid grid-cols-12 gap-1 font-sans">
                    <div className="col-span-3 border-r border-black pr-2">
                      <span>DATA DE RECEBIMENTO</span>
                      <div className="h-5"></div>
                    </div>
                    <div className="col-span-9">
                      <span>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                      <div className="h-5"></div>
                    </div>
                  </div>

                  {/* 2. EMISSOR, IDENTIFICACAO DANFE, BARCODE */}
                  <div className="border-t border-x border-black grid grid-cols-12 font-sans">
                    {/* Emissor */}
                    <div className="col-span-5 border-r border-black p-2 flex items-center gap-3">
                      {config?.logoUrl && config?.showLogoInNF !== false ? (
                        <img 
                          src={config.logoUrl} 
                          alt="Logo" 
                          className="w-14 h-14 object-contain bg-white border border-zinc-200 p-0.5 rounded shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 border border-black flex items-center justify-center bg-zinc-100 rounded shrink-0">
                          <span className="font-black text-[9px] text-slate-500">LOGO</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h1 className="font-black text-[10px] leading-tight text-zinc-950 uppercase truncate">{config?.nomeOficina || "KARTER'OS MECÂNICA AUTOMOTIVA"}</h1>
                        <p className="text-[7.5px] text-zinc-700 leading-normal font-semibold truncate">{config?.endereco || "RUA DAS FLORES, 150 - CENTRO - SÃO PAULO/SP"}</p>
                        <p className="text-[7.5px] text-zinc-700 leading-normal">CEP: 01310-200 | Tel: {config?.telefone || "(11) 98765-4321"}</p>
                        <p className="text-[7.5px] text-zinc-700 font-bold truncate">E-mail: {config?.email || "contato@karteros.com"}</p>
                      </div>
                    </div>

                    {/* Danfe indicator block */}
                    <div className="col-span-3 border-r border-black p-1 text-center flex flex-col justify-between">
                      <div>
                        <h2 className="font-black text-[11px] leading-tight text-black tracking-widest">DANFE</h2>
                        <p className="text-[7px] text-gray-700 leading-tight font-bold">DOCUMENTO AUXILIAR DA<br/>NOTA FISCAL ELETRÔNICA</p>
                      </div>
                      <div className="flex justify-around items-center text-[8px] border-y border-black/40 py-0.5">
                        <span className="leading-tight">0 - ENTRADA<br/>1 - SAÍDA</span>
                        <div className="border border-black font-extrabold px-2 py-0.2 bg-zinc-100 text-[9px]">1</div>
                      </div>
                      <div>
                        <p className="font-black text-[10px]">Nº {randomChave.slice(-14, -5)}</p>
                        <p className="text-[7.5px] font-bold">SÉRIE: 1 - PÁG: 1/1</p>
                      </div>
                    </div>

                    {/* Barcode and Chave de Acesso */}
                    <div className="col-span-4 p-2 font-sans flex flex-col justify-between">
                      {/* Visual Barcode mockup */}
                      <div className="flex h-7 items-end overflow-hidden select-none bg-white px-1">
                        {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 4, 2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 1, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 4, 2].map((w, idx) => (
                          <span 
                            key={idx} 
                            className="bg-black block h-full shrink-0" 
                            style={{ 
                              width: `${w * 0.7}px`, 
                              marginRight: idx % 3 === 0 ? "1px" : "0px",
                              opacity: idx % 5 === 0 ? 0.3 : 1
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-1">
                        <span className="text-[6.5px] text-gray-500 font-extrabold block uppercase tracking-wider">CHAVE DE ACESSO</span>
                        <span className="font-mono text-[8px] font-bold select-all tracking-tighter text-slate-900 bg-slate-100 px-1 py-0.5 rounded break-all inline-block w-full text-center border border-slate-200">
                          {randomChave.replace(/(.{4})/g, "$1 ")}
                        </span>
                      </div>
                      <div className="text-[7px] text-center border-t border-black/10 mt-1 pt-0.5 font-bold text-gray-500 leading-tight">
                        Consulta de autenticidade no site nacional da NF-e
                      </div>
                    </div>
                  </div>

                  {/* 3. NATUREZA DA OPERACAO, PROTOCOLO */}
                  <div className="border border-black grid grid-cols-12 text-[8px] font-sans">
                    <div className="col-span-6 border-r border-black p-1">
                      <span className="text-[6.5px] text-gray-500 block uppercase tracking-wider">NATUREZA DA OPERAÇÃO</span>
                      <span className="font-bold text-[8.5px] uppercase">VENDA DE AUTOPEÇAS E PRESTAÇÃO DE SERVIÇOS</span>
                    </div>
                    <div className="col-span-6 p-1">
                      <span className="text-[6.5px] text-gray-500 block uppercase tracking-wider">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                      <strong className="font-sans text-[8.5px]">1352600293883 {emissionDate} 10:14:45</strong>
                    </div>
                  </div>

                  <div className="border-x border-b border-black grid grid-cols-3 text-[8px] font-sans">
                    <div className="p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block">INSCRIÇÃO ESTADUAL</span>
                      <span className="font-bold">260247227</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block">INSC. ESTADUAL DO SUBST. TRIB.</span>
                      <span className="font-bold">ISENTO</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[6.5px] text-gray-500 block">CNPJ DO EMISSOR</span>
                      <span className="font-bold">45.089.301/0001-05</span>
                    </div>
                  </div>

                  {/* 4. DESTINATÁRIO / REMETENTE */}
                  <div className="border border-black mt-1.5 font-sans text-[8px]">
                    <div className="bg-zinc-150 font-black text-[7px] tracking-wide px-2 py-0.5 border-b border-black uppercase bg-zinc-200">DESTINATÁRIO / REMETENTE</div>
                    <div className="grid grid-cols-12 p-1.5 gap-y-1 gap-x-2">
                      <div className="col-span-7">
                        <span className="text-[6.5px] text-gray-500 block font-bold">NOME / RAZÃO SOCIAL</span>
                        <span className="font-extrabold uppercase text-[8.5px]">{danfeCliente?.nome || "CLIENTE CONSUMIDOR FINAL"}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-[6.5px] text-gray-500 block font-bold">CNPJ / CPF</span>
                        <span className="font-bold uppercase">{danfeCliente?.cpfCnpj || "000.000.000-00"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[6.5px] text-gray-500 block font-bold">DATA EMISSÃO</span>
                        <span className="font-bold">{emissionDate}</span>
                      </div>
                      
                      <div className="col-span-6">
                        <span className="text-[6.5px] text-gray-500 block">ENDEREÇO</span>
                        <span className="font-semibold uppercase text-[8px] truncate block">{danfeCliente?.endereco || "Rua Geral da Oficina Motora"}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-[6.5px] text-gray-500 block">BAIRRO / DISTRITO</span>
                        <span className="font-bold uppercase">CENTRO</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[6.5px] text-gray-500 block">CEP</span>
                        <span className="font-bold">89810-250</span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-[6.5px] text-gray-505 block">UF</span>
                        <span className="font-extrabold uppercase">{danfeVeiculo?.uf || "SP"}</span>
                      </div>

                      <div className="col-span-5">
                        <span className="text-[6.5px] text-gray-500 block">MUNICÍPIO</span>
                        <span className="font-bold uppercase truncate block">{danfeVeiculo?.municipio || "São Paulo"}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-[6.5px] text-gray-500 block">FONE / FAX</span>
                        <span className="font-semibold">{danfeCliente?.telefone || "(11) 90000-1111"}</span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-[6.5px] text-gray-500 block">INSCRIÇÃO ESTADUAL</span>
                        <span className="font-bold">ISENTO</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. FATURA / DUPLICATAS */}
                  <div className="border border-black mt-1.5 font-sans text-[8px]">
                    <div className="bg-zinc-150 font-black text-[7px] px-2 py-0.5 border-b border-black uppercase bg-zinc-200">DADOS DE PAGAMENTOS E FATURA</div>
                    <div className="p-1.5 flex flex-wrap gap-x-4 gap-y-1">
                      {danfeOS.fechamentoAdm?.valoresPagoSplit ? (
                        Object.keys(danfeOS.fechamentoAdm.valoresPagoSplit)
                          .filter((m) => (danfeOS.fechamentoAdm?.valoresPagoSplit?.[m] || 0) > 0)
                          .map((method, idx) => {
                            const val = danfeOS.fechamentoAdm?.valoresPagoSplit?.[method] || 0;
                            return (
                              <div key={idx} className="border border-gray-300 rounded px-2 py-0.5 bg-zinc-50 flex items-center gap-1.5">
                                <span className="font-black text-gray-650 uppercase text-[7px]">{method}:</span>
                                <strong className="font-mono text-zinc-900 text-[8px]">R$ {val.toFixed(2).replace(".", ",")}</strong>
                              </div>
                            );
                          })
                      ) : (
                        <div className="border border-gray-300 rounded px-2 py-0.5 bg-zinc-50 flex items-center gap-1.5">
                          <span className="font-black text-gray-600 uppercase text-[7px]">Forma:</span>
                          <strong className="font-mono">{danfeOS.fechamentoAdm?.formaPagamento || "Dinheiro"} - R$ {totalLiquido.toFixed(2).replace(".", ",")}</strong>
                        </div>
                      )}
                      {danfeOS.fechamentoAdm?.parcelasCredito && danfeOS.fechamentoAdm.parcelasCredito > 1 && (
                        <div className="border border-amber-500/20 rounded px-2 py-0.5 bg-amber-50 flex items-center gap-1.5">
                          <span className="font-black text-amber-700 uppercase text-[7px]">Parcelamento:</span>
                          <strong className="text-amber-800 font-sans font-bold">{danfeOS.fechamentoAdm?.parcelasCredito}x Parcelas de R$ {((danfeOS.fechamentoAdm?.valoresPagoSplit?.["Crédito"] || danfeOS.fechamentoAdm?.valoresPagoSplit?.["Crédito Parcelado"] || totalLiquido) / danfeOS.fechamentoAdm.parcelasCredito).toFixed(2).replace(".", ",")}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6. CÁLCULO DO IMPOSTO */}
                  <div className="border border-black mt-1.5 font-sans text-[7.5px]">
                    <div className="bg-zinc-150 font-black text-[7px] px-2 py-0.5 border-b border-black uppercase bg-zinc-200">CÁLCULO DO IMPOSTO</div>
                    <div className="grid grid-cols-9 divide-x divide-black text-center border-b border-black">
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">BASE CÁLC. ICMS</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO ICMS</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">BASE CÁLC. ICMS ST</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO ICMS ST</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">V. IMP. IMPORTAÇÃO</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate font-bold">V. ICMS UF REMET.</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO FCP</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO PIS</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5 bg-zinc-50 font-bold text-black border-l border-black">
                        <span className="text-[6px] text-gray-600 block truncate">V. TOTAL PRODUTOS</span>
                        <span className="font-mono font-bold text-[8px]">R$ {totalPecas.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-9 divide-x divide-black text-center bg-zinc-50/20">
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO FRETE</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO SEGURO</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-550 block font-black text-red-655 truncate leading-tight">DESCONTO</span>
                        <span className="font-mono text-crimson text-red-600 font-bold">R$ {desconto.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">OUTRAS DESPESAS</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR DO IPI</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5 font-bold text-gray-800">
                        <span className="text-[6px] text-gray-500 block truncate">V. ICMS UF DEST.</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-550 block truncate">TRIBUTOS APROX.</span>
                        <span className="font-bold font-mono">R$ {(totalLiquido * 0.1345).toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-505 block truncate">COFINS</span>
                        <span className="font-bold">R$ 0,00</span>
                      </div>
                      <div className="p-0.5 bg-zinc-200 font-black text-slate-950">
                        <span className="text-[6.5px] text-zinc-950 block truncate font-black uppercase">V. TOTAL DA NOTA</span>
                        <span className="font-mono text-[9px] font-black">R$ {totalLiquido.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>

                  {/* 7. TRANSPORTADOR / VOLUMES TRANSPORTADOS */}
                  <div className="border border-black mt-1.5 font-sans text-[7.5px] leading-tight grid grid-cols-12 gap-y-1 p-1 bg-zinc-50/10">
                    <div className="col-span-12 font-black text-[7px] border-b border-black/10 pb-0.5 uppercase mb-1">TRANSPORTADOR / VOLUMES TRANSPORTADOS</div>
                    <div className="col-span-4 border-r border-black/15 pr-1 font-semibold">
                      <span className="text-[5.5px] text-gray-505 block">RAZÃO SOCIAL / TRANSPORTADORA</span>
                      <span className="font-bold uppercase text-[8px]">O PRÓPRIO ADQUIRENTE</span>
                    </div>
                    <div className="col-span-3 border-r border-black/15 px-1 text-center font-semibold">
                      <span className="text-[5.5px] text-gray-505 block">FRETE POR CONTA</span>
                      <span className="font-bold uppercase text-[8px]">9 - SEM FRETE (RETIRADA)</span>
                    </div>
                    <div className="col-span-1 border-r border-black/15 px-1 text-center">
                      <span className="text-[5.5px] text-gray-505 block">CÓDIGO ANTT</span>
                      <span className="font-bold">-</span>
                    </div>
                    <div className="col-span-1 border-r border-black/15 px-1 text-center font-bold">
                      <span className="text-[5.5px] text-gray-505 block">PLACA</span>
                      <span className="font-bold uppercase text-[8px]">{danfeVeiculo?.placa || "-"}</span>
                    </div>
                    <div className="col-span-1 border-r border-black/15 px-1 text-center font-bold">
                      <span className="text-[5.5px] text-gray-505 block">UF</span>
                      <span className="font-bold uppercase text-[8px]">{danfeVeiculo?.uf || "-"}</span>
                    </div>
                    <div className="col-span-2 px-1 font-bold">
                      <span className="text-[5.5px] text-gray-550 block">CNPJ / CPF</span>
                      <span className="font-bold">-</span>
                    </div>
                  </div>

                  {/* 8. DADOS DO PRODUTO / SERVIÇO TABLE */}
                  <div className="border border-black mt-1.5 font-sans overflow-hidden">
                    <div className="bg-zinc-150 font-black text-[7px] px-2 py-0.5 border-b border-black uppercase bg-zinc-200">DADOS DOS PRODUTOS E SERVIÇOS</div>
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-zinc-100 text-[6.5px] font-black border-b border-black divide-x divide-zinc-450 tracking-wider">
                          <th className="p-1 text-center w-11">CÓDIGO</th>
                          <th className="p-1">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                          <th className="p-1 text-center w-12">NCM/SH</th>
                          <th className="p-1 text-center w-8">CST</th>
                          <th className="p-1 text-center w-8">CFOP</th>
                          <th className="p-1 text-center w-8">UN</th>
                          <th className="p-1 text-center w-8">QTD</th>
                          <th className="p-1 text-right w-16">VLR. UNIT</th>
                          <th className="p-1 text-right w-18">VLR. TOTAL</th>
                          <th className="p-1 text-right w-12 border-r border-zinc-300">BC ICMS</th>
                          <th className="p-1 text-right w-12 border-r border-zinc-300">VLR. ICMS</th>
                          <th className="p-1 text-right w-12">VLR. IPI</th>
                          <th className="p-1 text-center w-7">ALIQ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-[7.5px]">
                        {/* Products (Pieces) */}
                        {danfePecas.map((item, idx) => {
                          const original = getPecaDetail(item.pecaId);
                          return (
                            <tr key={`p-${idx}`} className="divide-x divide-zinc-200 leading-tight hover:bg-zinc-50 font-sans">
                              <td className="p-1 text-center font-mono text-[6.5px] font-semibold text-gray-700">{original?.sku || `SKU-${item.pecaId.slice(0,4).toUpperCase()}`}</td>
                              <td className="p-1 font-bold uppercase truncate max-w-[250px]">
                                {original?.descricao || "PEÇA AUTOMOTIVA / INSUMO"}
                              </td>
                              <td className="p-1 text-center font-mono text-[7px]">8708.29.99</td>
                              <td className="p-1 text-center font-mono text-[7px]">0102</td>
                              <td className="p-1 text-center font-mono text-[7px]">5102</td>
                              <td className="p-1 text-center font-bold">UN</td>
                              <td className="p-1 text-center font-bold font-mono">{item.quantidade}</td>
                              <td className="p-1 text-right font-mono font-semibold">R$ {item.precoUnitario.toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono font-bold">R$ {(item.quantidade * item.precoUnitario).toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-center font-mono text-gray-400">0%</td>
                            </tr>
                          );
                        })}

                        {/* Services (labor) which goes as conjugated on standard mechanical invoices */}
                        {danfeServicos.length > 0 ? (
                          danfeServicos.map((srv, idx) => (
                            <tr key={`s-${idx}`} className="divide-x divide-zinc-200 leading-tight hover:bg-zinc-50 bg-gray-50/25">
                              <td className="p-1 text-center font-mono text-[6.5px] text-gray-500 font-bold">SRV-0{idx+1}</td>
                              <td className="p-1 font-semibold uppercase text-slate-800 truncate max-w-[250px]">
                                REPARAÇÕES AUTOMOTIVAS: {srv.descricao}
                              </td>
                              <td className="p-1 text-center font-mono text-[7px] text-gray-400">-</td>
                              <td className="p-1 text-center font-mono text-[7px]">0400</td>
                              <td className="p-1 text-center font-mono text-[7px]">5933</td>
                              <td className="p-1 text-center font-bold">SV</td>
                              <td className="p-1 text-center font-mono font-bold">1</td>
                              <td className="p-1 text-right font-mono font-semibold">R$ {srv.valor.toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono font-bold text-slate-900">R$ {srv.valor.toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-center font-mono text-gray-400">0%</td>
                            </tr>
                          ))
                        ) : (
                          totalServicos > 0 && (
                            <tr className="divide-x divide-zinc-200 leading-tight hover:bg-zinc-50 bg-gray-50/25">
                              <td className="p-1 text-center font-mono text-[6.5px] text-gray-500 font-bold">SRV-01</td>
                              <td className="p-1 font-semibold uppercase text-slate-800">
                                SERVIÇOS TÉCNICOS INTEGRADOS DE MÃO DE OBRA MECÂNICA GERAL EM VEÍCULO
                              </td>
                              <td className="p-1 text-center font-mono text-[7px] text-gray-400">-</td>
                              <td className="p-1 text-center font-mono text-[7px]">0400</td>
                              <td className="p-1 text-center font-mono text-[7px]">5933</td>
                              <td className="p-1 text-center font-bold">SV</td>
                              <td className="p-1 text-center font-mono font-bold">1</td>
                              <td className="p-1 text-right font-mono font-semibold">R$ {totalServicos.toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono font-bold text-slate-900">R$ {totalServicos.toFixed(2).replace(".", ",")}</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-right font-mono text-gray-400">0,00</td>
                              <td className="p-1 text-center font-mono text-gray-400">0%</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 9. CÁLCULO DO ISSQN */}
                  <div className="border border-black mt-1.5 font-sans text-[7.5px] leading-tight">
                    <div className="bg-zinc-150 font-black text-[7px] px-2 py-0.5 border-b border-black uppercase bg-zinc-200">CÁLCULO DO ISSQN</div>
                    <div className="grid grid-cols-4 divide-x divide-black text-center">
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">INSCRIÇÃO MUNICIPAL</span>
                        <span className="font-bold">3508912-3</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">VALOR TOTAL DOS SERVIÇOS</span>
                        <span className="font-bold font-mono">R$ {totalServicos.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="p-0.5">
                        <span className="text-[6px] text-gray-500 block truncate">BASE DE CÁLCULO DO ISSQN</span>
                        <span className="font-bold font-mono">R$ {totalServicos.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="p-0.5 bg-zinc-50 font-bold text-black">
                        <span className="text-[6px] text-gray-600 block truncate">VALOR DO ISSQN (5%)</span>
                        <span className="font-bold font-mono">R$ {(totalServicos * 0.05).toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>

                  {/* 10. DADOS ADICIONAIS */}
                  <div className="border border-black mt-1.5 font-sans text-[7.5px] grid grid-cols-12 min-h-[70px]">
                    <div className="col-span-8 p-1.5 border-r border-black font-mono text-[6.5px] leading-normal uppercase">
                      <span className="font-black text-black block text-[7px] mb-0.5">INFORMAÇÕES COMPLEMENTARES</span>
                      <p className="text-zinc-700">DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. OPERAÇÃO EM CONFORMIDADE COM REGULAÇÕES ESTADUAIS. REFERENTE À ORDEM DE SERVIÇO Nº <strong className="text-black font-black">#{danfeOS.id.toUpperCase()}</strong>.</p>
                      {danfeVeiculo && (
                        <p className="font-sans font-bold text-slate-800 mt-1 leading-normal border-t border-zinc-200 pt-1">
                          🚙 VEÍCULO: {danfeVeiculo.marca} {danfeVeiculo.modelo} | PLACA: <span className="bg-zinc-100 rounded border border-zinc-300 px-1 font-bold text-zinc-900">{danfeVeiculo.placa}</span> | MOTOR: {danfeVeiculo.motor || "1.0"} | COR: {danfeVeiculo.cor || "PRETO"} | KM ENTRADA: {danfeOS.kmAtual} KM.
                        </p>
                      )}
                      <p className="font-semibold text-slate-500 text-[6px] mt-0.5">CONSULTA DIGITAL REALIZADA COM SUCESSO - PADRÃO CONJUGADO DE AUTOPEÇAS E FLUIDOS</p>
                    </div>
                    <div className="col-span-4 p-1.5 bg-zinc-50/10 text-center flex flex-col justify-between font-mono text-[6px] leading-tight select-none">
                      <span className="font-black text-black block text-[7px] uppercase tracking-wider text-left">RESERVA AO FISCO</span>
                      <div className="h-full flex items-center justify-center font-black text-slate-400">
                        HASH DE SEGURANÇA SEFAZ:<br/>{randomChave.slice(0, 16).toLowerCase()}
                      </div>
                    </div>
                  </div>

                  {/* Small credit footer */}
                  <div className="mt-2 text-[6.5px] text-center text-gray-400 font-mono no-print">
                    DANFE gerada dinamicamente via AI Studio para teste e homologação do Módulo Fiscal Karter'OS
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL / VIEW: PRINT BUDGET */}
        {showPrintPreview && selectedOS && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-4 md:p-8 flex flex-col items-center animate-fadeIn font-sans text-slate-800">
            {/* Hidden on actual paper print, visible screen controls */}
            <div className="no-print w-full max-w-4xl bg-slate-900 border border-white/10 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-orange-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm">Visualização de Impressão do Orçamento</h3>
                  <p className="text-xxs text-slate-450">Esta folha foi estruturada para impressão em alta definição e papel A4.</p>
                </div>
              </div>
              <div className="flex gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExecuteSystemPrint(selectedOS)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-slate-950 font-black rounded-xl text-xxs transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-900/30"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-950" />
                  <span>IMPRIMIR AGORA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-xl text-xxs transition duration-150 cursor-pointer"
                >
                  Voltar ao Sistema
                </button>
              </div>
            </div>

            {/* Print Invoicing Sheet */}
            <div 
              id="print-invoice-sheet" 
              className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 md:p-12 mb-8 border border-slate-200"
            >
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #print-invoice-sheet, #print-invoice-sheet * {
                    visibility: visible !important;
                  }
                  #print-invoice-sheet {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    background: white !important;
                    color: black !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}} />

              {/* Corporate Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  {config?.logoUrl && config?.showLogoInOS !== false ? (
                    <img 
                      src={config.logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain bg-white border border-slate-300 p-0.5 rounded shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <div>
                    <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 uppercase">
                      {config?.nomeOficina || "KARTER'OS OFICINA MECÂNICA"}
                    </h1>
                    <p className="text-xxs uppercase font-extrabold text-orange-600 tracking-wider">Manutenção Automotiva de Alta Performance</p>
                    <p className="text-[10px] text-slate-500 mt-1">CNPJ: 14.238.995/0001-82 | Endereço: {config?.endereco || "Av. Nações Unidas, 12551"}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[10px] text-slate-600 font-medium space-y-0.5">
                  <p className="font-black text-xs text-slate-900">ORÇAMENTO DE SERVIÇO #{selectedOS.id.toUpperCase()}</p>
                  <p>Data de Emissão: {selectedOS.dataAbertura}</p>
                  <p>Telefone: {config?.telefone || "(11) 98765-4321"}</p>
                  <p>E-mail: {config?.email || "contato@karteros.com.br"} | São Paulo - SP</p>
                </div>
              </div>

              {/* Stakeholders metadata columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-[11px] leading-relaxed">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xxs mb-2 border-b border-slate-200 pb-1">DADOS DO CLIENTE</h3>
                  {(() => {
                    const c = clientes.find(item => item.id === selectedOS.clienteId);
                    return (
                      <div className="space-y-1 text-slate-700">
                        <p><strong className="text-slate-900">Nome:</strong> {c?.nome || "Não cadastrado"}</p>
                        <p><strong className="text-slate-900">CPF/CNPJ:</strong> {c?.cpfCnpj || "Não cadastrado"}</p>
                        <p><strong className="text-slate-900">Telefone:</strong> {c?.telefone || "Não cadastrado"}</p>
                        <p><strong className="text-slate-900">E-mail:</strong> {c?.email || "Não informado"}</p>
                        <p><strong className="text-slate-900">Endereço:</strong> {c?.endereco || "Não informado"}</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xxs mb-2 border-b border-slate-200 pb-1">DADOS DO VEÍCULO</h3>
                  {(() => {
                    const v = veiculos.find(item => item.id === selectedOS.veiculoId);
                    return (
                      <div className="space-y-1 text-slate-700">
                        <p><strong className="text-slate-900">Marca / Modelo:</strong> {v ? `${v.marca} ${v.modelo}` : "Não cadastrado"}</p>
                        <p><strong className="text-slate-900">Placa:</strong> {v?.placa || "Sem placa"}</p>
                        <p><strong className="text-slate-900">Ano de Fabricação:</strong> {v?.ano || "Não informado"}</p>
                        <p><strong className="text-slate-900">Motorização / Cor:</strong> {v ? `${v.motor} - ${v.cor}` : "Não informado"}</p>
                        <p><strong className="text-slate-900">KM Entrada:</strong> {selectedOS.kmAtual.toLocaleString()} KM</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Symptom Diagnoses Section */}
              <div className="my-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px]">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-xxs mb-2 border-b border-slate-200 pb-1">SINTOMAS & RECLAMAÇÕES APRESENTADAS</h3>
                <p className="italic text-slate-700">"{selectedOS.descricaoProblema}"</p>
              </div>

              {/* Parts & labor breakdown table */}
              <div className="my-6 space-y-3">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-xxs pb-1 border-b-2 border-slate-900">RELAÇÃO DE PEÇAS & COMPONENTES UTILIZADOS</h3>
                {selectedOS.pecasUtilizadas.length === 0 ? (
                  <p className="text-xxs italic text-slate-500">Nenhum componente físico adicionado a este orçamento.</p>
                ) : (
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-350 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="py-2">Descrição da Peça</th>
                        <th className="py-2">Fabricante</th>
                        <th className="py-2 text-center">Quant.</th>
                        <th className="py-2 text-right">Preço Unitário</th>
                        <th className="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedOS.pecasUtilizadas.map((item, index) => {
                        const s = pecas.find(p => p.id === item.pecaId);
                        return (
                          <tr key={index} className="text-slate-700">
                            <td className="py-2">{s?.descricao || "Peça de Reposição"} [{s?.sku || "SKU-N/A"}]</td>
                            <td className="py-2">{s?.fabricante || "-"}</td>
                            <td className="py-2 text-center">{item.quantidade}</td>
                            <td className="py-2 text-right">{formatCurrency(item.precoUnitario)}</td>
                            <td className="py-2 text-right font-bold text-slate-900">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Financial Balance Section */}
              <div className="my-6 border-t border-slate-350 pt-4 flex flex-col items-end text-right text-[11px] leading-relaxed space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-600">Total em Peças de Reposição: <strong className="text-slate-900 font-mono">{formatCurrency(selectedOS.valorTotal - selectedOS.valorMaoDeObra)}</strong></p>
                <p className="text-slate-600">Serviços Técnicos / Mão de Obra: <strong className="text-slate-900 font-mono">{formatCurrency(selectedOS.valorMaoDeObra)}</strong></p>
                <div className="border-t border-slate-300 pt-2 mt-2 w-full max-w-[280px]">
                  <p className="text-xs uppercase font-extrabold text-slate-700">VALOR TOTAL DO SERVIÇO</p>
                  <p className="text-xl font-black text-slate-950 font-mono">{formatCurrency(selectedOS.valorTotal)}</p>
                </div>
              </div>

              {/* Signature area */}
              <div className="grid grid-cols-2 gap-8 pt-16 text-[10px] text-center border-t border-slate-100 mt-12">
                <div className="space-y-1">
                  <p className="mx-auto w-4/5 border-b border-slate-400"></p>
                  <p className="font-extrabold text-slate-900">{getMecanicoNome(selectedOS.mecanicoId)}</p>
                  <p className="text-slate-500 uppercase tracking-widest text-[9px]">Mecânico Especialista</p>
                </div>
                <div className="space-y-1">
                  <p className="mx-auto w-4/5 border-b border-slate-400"></p>
                  <p className="font-extrabold text-slate-900">{getClienteNome(selectedOS.clienteId)}</p>
                  <p className="text-slate-500 uppercase tracking-widest text-[9px]">Cliente Autorizador</p>
                </div>
              </div>

              {/* Disclaimer footer */}
              <p className="text-[9px] text-slate-400 text-center leading-normal mt-12">
                Este documento constitui um orçamento prévio válido por 10 dias de acordo com o Art. 40 do Código de Defesa do Consumidor brasileiro.<br />
                Karter'OS Gestão e Controle - https://ai.studio/build
              </p>
            </div>
          </div>
        )}

        {/* INTERACTIVE MODAL: WHATSAPP GERATOR AND DISPATCHER */}
        {showWhatsAppShare && selectedOS && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col text-white">
              <div className="px-5 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Enviar Orçamento por WhatsApp</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowWhatsAppShare(false);
                    setSendSuccess(false);
                  }}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-slate-350 text-xxs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-extrabold uppercase text-[9px]">Número de WhatsApp do Cliente *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ex: 5511987654321"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="text-slate-500 text-[9px]">Utilize sempre formato completo com DDI (55) + DDD + número.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-extrabold uppercase text-[9px]">Mensagem Formatada do Orçamento</label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-[10.5px] font-mono leading-relaxed focus:outline-none"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!sharePhone) {
                        alert("Digite o número de telefone para enviar!");
                        return;
                      }
                      const url = `https://api.whatsapp.com/send?phone=${sharePhone}&text=${encodeURIComponent(shareMessage)}`;
                      window.open(url, "_blank");
                      setSendSuccess(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition duration-150 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-900" />
                    <span>ABRIR DISPARADOR WHATSAPP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatingSend(true);
                      setTimeout(() => {
                        setSimulatingSend(false);
                        setSendSuccess(true);
                      }, 1800);
                    }}
                    disabled={simulatingSend}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {simulatingSend ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    )}
                    <span>Simular Disparo Rápido</span>
                  </button>
                </div>

                {sendSuccess && (
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-450 font-semibold text-[10.5px] leading-normal animate-fadeIn flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-450 shrink-0" />
                    <span>O orçamento de serviços foi direcionado com absoluto sucesso para o WhatsApp do cliente!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE MODAL: EMAIL SENDER */}
        {showEmailShare && selectedOS && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col text-white">
              <div className="px-5 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Enviar Orçamento por E-mail</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailShare(false);
                    setSendSuccess(false);
                  }}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-slate-350 text-xxs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-extrabold uppercase text-[9px]">E-mail do Destinatário *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-normal"
                    placeholder="cliente@email.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-extrabold uppercase text-[9px]">Conteúdo da Mensagem de Orçamento (E-mail)</label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-[10px] font-mono leading-relaxed scrollbar-thin"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!shareEmail) {
                        alert("Por favor, informe o e-mail do cliente.");
                        return;
                      }
                      const subject = encodeURIComponent(`Orçamento detalhado Karter'OS - #${selectedOS.id.toUpperCase()}`);
                      const body = encodeURIComponent(shareMessage);
                      window.open(`mailto:${shareEmail}?subject=${subject}&body=${body}`);
                      setSendSuccess(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-555 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-900/40 transition duration-150 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-950" />
                    <span>ENVIAR VIA MEU OUTLOOK/EMAIL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatingSend(true);
                      setTimeout(() => {
                        setSimulatingSend(false);
                        setSendSuccess(true);
                      }, 2000);
                    }}
                    disabled={simulatingSend}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {simulatingSend ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    )}
                    <span>Enviar Direto via Servidor</span>
                  </button>
                </div>

                {sendSuccess && (
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-450 font-semibold text-[10.5px] leading-normal animate-fadeIn flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-450 shrink-0" />
                    <span>O Orçamento foi direcionado à fila de envios oficiais de e-mail da oficina para o destinatário !</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
