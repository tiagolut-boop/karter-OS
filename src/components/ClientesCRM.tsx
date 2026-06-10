import React, { useState, useEffect } from "react";
import { Cliente, Veiculo, OrdemServico, Orcamento } from "../types";
import { 
  UserPlus, 
  Search, 
  MessageCircle, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  Plus, 
  Car, 
  Cake, 
  ChevronRight, 
  AlertCircle,
  Hash,
  Activity,
  CheckCircle,
  Eye,
  Trash2,
  Phone,
  Upload
} from "lucide-react";
import { simulateDetranAPI } from "../dataStore";

interface ClientesCRMProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  ordens: OrdemServico[];
  orcamentos?: Orcamento[];
  onNavigate?: (tab: string, arg?: any) => void;
  selectedClienteId: string | null;
  onSelectClienteId: (id: string | null) => void;
  onUpdateClientes: (newClientes: Cliente[]) => void;
  onUpdateVeiculos: (newVeiculos: Veiculo[]) => void;
}

// Helpers to repair common encoding issues in pasted datasets
export function fixEncoding(text: string): string {
  if (!text) return "";
  return text
    .replace(/IRMOS/g, "IRMÃOS")
    .replace(/CONSTRUES/g, "CONSTRUÇÕES")
    .replace(/Joo/g, "João")
    .replace(/Jos/g, "José")
    .replace(/Antnio/g, "Antônio")
    .replace(/So/g, "São")
    .replace(/Rogrio/g, "Rogério")
    .replace(/Petrpolis/g, "Petrópolis")
    .replace(/Vrzea/g, "Várzea")
    .replace(/Centenrio/g, "Centenário")
    .replace(/Sebastio/g, "Sebastião")
    .replace(/Jnior/g, "Júnior")
    .replace(/AUTOMVEIS/g, "AUTOMÓVEIS")
    .replace(/AMLI/g, "AMÉLI")
    .replace(/Conceio/g, "Conceição")
    .replace(/Crstvo/g, "Cristóvão")
    .replace(/Cristvo/g, "Cristóvão")
    .replace(/Cndido/g, "Cândido")
    .replace(/Rus/g, "Réus")
    .replace(/Ris/g, "Réis")
    .replace(/Ã/g, "Á")
    .replace(/\uFFFD/g, (m, offset, str) => {
      const prev = str.slice(Math.max(0, offset - 4), offset);
      const next = str.slice(offset + 1, offset + 5);
      if (prev.toLowerCase().includes("jo")) return "ã";
      if (prev.toLowerCase().includes("jos")) return "é";
      if (prev.toLowerCase().includes("ant")) return "ô";
      if (next.toLowerCase().includes("o")) return "ã";
      if (next.toLowerCase().includes("e")) return "ê";
      if (prev.toLowerCase().includes("s")) return "ã";
      return "o";
    });
}

export default function ClientesCRM({
  clientes,
  veiculos,
  ordens,
  orcamentos = [],
  onNavigate,
  selectedClienteId,
  onSelectClienteId,
  onUpdateClientes,
  onUpdateVeiculos
}: ClientesCRMProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Import from Excel/CSV states
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportText(text);
      setImportStatus(`Arquivo "${file.name}" carregado com sucesso!\nClique em "Processar e Importar" para efetivar a carga.`);
    };
    reader.onerror = () => {
      setImportStatus("Erro ao ler o arquivo selecionado.");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // New Client Form State
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [formError, setFormError] = useState("");

  // New Vehicle state for current client
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [motor, setMotor] = useState("");
  const [cor, setCor] = useState("");
  const [km, setKm] = useState(0);
  const [chassi, setChassi] = useState("");
  const [renavam, setRenavam] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("");
  const [detranLoading, setDetranLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [vehicleNotice, setVehicleNotice] = useState("");

  // Phone mask automatic helper
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.length > 11) clean = clean.slice(0, 11);
    
    // Mask format: (XX) XXXXX-XXXX
    if (clean.length <= 2) {
      setTelefone(clean);
    } else if (clean.length <= 7) {
      setTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    } else {
      setTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`);
    }
  };

  // CPF mask helper
  const handleCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.length > 14) clean = clean.slice(0, 14);

    if (clean.length <= 11) {
      // CPF mask 3+3+3+2
      if (clean.length <= 3) setCpfCnpj(clean);
      else if (clean.length <= 6) setCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3)}`);
      else if (clean.length <= 9) setCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`);
      else setCpfCnpj(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`);
    } else {
      // CNPJ mask 2+3+3+4+2
      if (clean.length <= 12) setCpfCnpj(`${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`);
      else setCpfCnpj(`${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`);
    }
  };

  // Check if a birthday sits in June (mês 06) and current date matches
  const checkBirthdayMonth = (dob: string) => {
    if (!dob) return false;
    const parts = dob.split("-");
    const month = parts[1];
    return month === "06"; // June
  };

  const handleCreateCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !endereco.trim() || !dataNascimento || !telefone || !cpfCnpj) {
      setFormError("Nome, Telefone, CPF/CNPJ, Endereço e Data de Nascimento são obrigatórios!");
      return;
    }

    const cleanProposed = cpfCnpj.replace(/\D/g, "");
    if (cleanProposed) {
      const exists = clientes.some(c => {
        const cleanExisting = c.cpfCnpj.replace(/\D/g, "");
        if (cleanProposed.length >= 11 && cleanExisting.length >= 11) {
          return cleanExisting === cleanProposed;
        }
        return c.cpfCnpj.trim().toLowerCase() === cpfCnpj.trim().toLowerCase();
      });
      if (exists) {
        setFormError("Erro: Já existe um cliente cadastrado com este CPF/CNPJ!");
        return;
      }
    }

    const newCliente: Cliente = {
      id: "cli_" + Date.now(),
      nome,
      email: email || "sem@email.com",
      telefone,
      cpfCnpj,
      endereco,
      dataNascimento,
      tipo: tipo || (cpfCnpj.replace(/\D/g, "").length > 11 ? "PJ" : "PF")
    };

    onUpdateClientes([...clientes, newCliente]);
    onSelectClienteId(newCliente.id); // open newly created client

    // Reset Form
    setNome("");
    setEmail("");
    setTelefone("");
    setCpfCnpj("");
    setEndereco("");
    setDataNascimento("");
    setTipo("PF");
    setFormError("");
    setShowAddForm(false);
  };

  // Simulated Detran lookup click within owner vehicle form
  const handleDetranLookup = async () => {
    if (!placa.trim()) {
      setVehicleError("Informe a placa do veículo primeiro!");
      setVehicleNotice("");
      return;
    }
    setVehicleError("");
    setVehicleNotice("");
    setDetranLoading(true);
    try {
      const result = await simulateDetranAPI(placa);
      setMarca(result.marca);
      setModelo(result.modelo);
      setAno(result.ano);
      setMotor(result.motor);
      setCor(result.cor);
      setChassi(result.chassi || "");
      setRenavam(result.renavam || "");
      setMunicipio(result.municipio || "");
      setUf(result.uf || "");

      if (result.api_status === "simulated") {
        if (result.api_error && (result.api_error.includes("APIBRASIL_TOKEN") || result.api_error.includes("Secrets"))) {
          setVehicleNotice("⚠️ A APIBrasil paga não foi configurada nos Secrets da aplicação. O sistema gerou dados fictícios realistas de simulação.");
        } else {
          setVehicleNotice(`⚠️ A APIBrasil oficial retornou falha (${result.api_error || "Limite/Saldo esgotado"}). Dados gerados por simulação no sistema.`);
        }
      } else {
        setVehicleNotice(`✅ Veículo real consultado com sucesso na base de dados oficial via ${result.api_source === "apibrasil_pago" ? "APIBrasil Agregados" : "API de Placas FIPE"}!`);
      }
    } catch (e: any) {
      setVehicleError("Incompatibilidade temporária com banco DETRAN.");
    } finally {
      setDetranLoading(false);
    }
  };

  const handleAddVehicle = (e: React.FormEvent, ownerId: string) => {
    e.preventDefault();
    if (!placa || !marca || !modelo || !ano) {
      setVehicleError("Placa, marca, modelo e ano são obrigatórios!");
      return;
    }

    const newV: Veiculo = {
      id: "vei_" + Date.now(),
      clienteId: ownerId,
      placa: placa.toUpperCase().trim(),
      marca,
      modelo,
      ano,
      motor: motor || "1.0",
      cor: cor || "Prata",
      km: Number(km) || 0,
      chassi: chassi || undefined,
      renavam: renavam || undefined,
      municipio: municipio || undefined,
      uf: uf || undefined,
    };

    onUpdateVeiculos([...veiculos, newV]);

    // Reset vehicle form variables
    setPlaca("");
    setMarca("");
    setModelo("");
    setAno("");
    setMotor("");
    setCor("");
    setKm(0);
    setChassi("");
    setRenavam("");
    setMunicipio("");
    setUf("");
    setVehicleError("");
    setVehicleNotice("");
    setShowAddVehicleForm(false);
  };

  // WhatsApp loyalty template trigger
  const triggerWhatsApp = (tel: string, name: string) => {
    const cleanNo = tel.replace(/\D/g, "");
    const text = `Olá, ${name}! Sou o especialista técnico do time Karter'OS. Passando para desejar um maravilhoso feliz aniversário neste mês de Junho! Preparamos para você e sua máquina um bônus especial: 10% OFF em qualquer higienização de ar-condicionado ou balanceamento neste mês. Vamos celebrar? 🎂🚗`;
    window.open(`https://wa.me/55${cleanNo}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // General chat template trigger
  const triggerNormalWhatsApp = (tel: string, name: string) => {
    const cleanNo = tel.replace(/\D/g, "");
    const text = `Olá, ${name}! Gostaríamos de atualizar o status da revisão técnica do seu veículo na Karter'OS. Você poderia confirmar o recebimento?`;
    window.open(`https://wa.me/55${cleanNo}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // CSV paste importer handler
  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      setImportStatus("Cole as linhas do Excel primeiro!");
      return;
    }

    try {
      const lines = importText.split("\n");
      const newClientes: Cliente[] = [];

      lines.forEach((line, index) => {
        // Ignora cabeçalhos ou linhas vazias
        if (!line.trim() || line.includes("Tipo Pessoa") || line.toLowerCase().includes("razao social") || line.startsWith("ID;")) {
          return;
        }

        // Divide por ponto e vírgula
        const parts = line.split(";");
        if (parts.length < 5) return;

        // Limpa aspas e formata os dados
        const cleanVal = (val: string) => val ? val.replace(/^["']|["']$/g, "").trim() : "";

        const id_pasted = cleanVal(parts[0]);
        const tipoPessoa = cleanVal(parts[1]).toUpperCase() as "PF" | "PJ";
        const docRaw = cleanVal(parts[3]);
        
        let cpfCnpjPasted = docRaw;
        // Se CPF/CNPJ estiver vazio na planilha, gera um marcador ou herda o próprio ID
        if (!cpfCnpjPasted) {
          cpfCnpjPasted = `ID-${id_pasted || Date.now() + "-" + index}`;
        }
        
        const nomePasted = fixEncoding(cleanVal(parts[4])) || fixEncoding(cleanVal(parts[5]));
        
        let enderecoPasted = fixEncoding(cleanVal(parts[6]));
        const numeroPasted = cleanVal(parts[7]);
        const bairroPasted = fixEncoding(cleanVal(parts[8]));
        const cidadePasted = fixEncoding(cleanVal(parts[11]));
        const ufPasted = cleanVal(parts[13]);
        
        if (numeroPasted) enderecoPasted += `, ${numeroPasted}`;
        if (bairroPasted) enderecoPasted += ` - ${bairroPasted}`;
        if (cidadePasted) enderecoPasted += ` - ${cidadePasted}`;
        if (ufPasted) enderecoPasted += ` - ${ufPasted}`;

        const telefonePasted = cleanVal(parts[15]) || cleanVal(parts[16]) || "(49) 99999-9999";
        const emailPasted = cleanVal(parts[18]) || "sem@email.com";
        let nascimentoPasted = cleanVal(parts[23]);
        
        if (!nascimentoPasted || nascimentoPasted === "0000-00-00") {
          nascimentoPasted = "1980-01-01";
        }

        if (nomePasted) {
          newClientes.push({
            id: `cli_${id_pasted || Date.now() + "_" + index}`,
            nome: nomePasted,
            email: emailPasted,
            telefone: telefonePasted,
            cpfCnpj: cpfCnpjPasted,
            endereco: enderecoPasted || "Não informado",
            dataNascimento: nascimentoPasted,
            tipo: tipoPessoa === "PJ" || tipoPessoa === "PF" ? tipoPessoa : (cpfCnpjPasted.replace(/\D/g, "").length > 11 ? "PJ" : "PF")
          });
        }
      });

      if (newClientes.length === 0) {
        setImportStatus("Nenhum cliente válido pôde ser importado. Certifique-se de copiar as linhas completas do Excel.");
        return;
      }

      // Evitar duplicados analisando ID e CPF/CNPJ existentes
      const existingDocSet = new Set(clientes.map(c => c.cpfCnpj.replace(/\D/g, "")));
      const existingIdSet = new Set(clientes.map(c => c.id));
      
      const filteredNew = newClientes.filter(c => {
        const cleanDoc = c.cpfCnpj.replace(/\D/g, "");
        if (cleanDoc && existingDocSet.has(cleanDoc)) return false;
        if (existingIdSet.has(c.id)) return false;
        return true;
      });

      if (filteredNew.length === 0) {
        setImportStatus(`Os clientes copiados da planilha já constam na base cadastral.`);
        return;
      }

      const skippedCount = newClientes.length - filteredNew.length;

      onUpdateClientes([...clientes, ...filteredNew]);
      setImportStatus(`Carga de dados executada com sucesso!\n✨ ${filteredNew.length} novos clientes integrados à oficina.${skippedCount > 0 ? `\n(Aviso: ${skippedCount} clientes duplicados já cadastrados foram desconsiderados.)` : ""}`);
      setImportText("");
    } catch (err: any) {
      setImportStatus(`Erro no processamento da carga: ${err.message}`);
    }
  };

  const filteredClientes = selectedClienteId
    ? clientes.filter(c => c.id === selectedClienteId)
    : clientes.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cpfCnpj.includes(searchTerm) ||
        c.telefone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);
  const clientVehicles = selectedCliente ? veiculos.filter(v => v.clienteId === selectedCliente.id) : [];
  const clientOS = selectedCliente ? ordens.filter(o => o.clienteId === selectedCliente.id) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Left Column (5/12) - Client Search and List */}
      <div className="lg:col-span-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded-xl border border-white/10">
            <div className="flex flex-col">
              <h3 className="font-bold text-white text-xs pl-2">Clientes & CRM</h3>
              <span className="text-[10px] text-orange-400 font-bold pl-2 font-mono">
                {clientes.length} Cadastrados
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                id="import-client-toggle-btn"
                onClick={() => { setShowImportForm(!showImportForm); setShowAddForm(false); onSelectClienteId(null); }}
                className={`text-[10px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  showImportForm ? "bg-orange-600/30 text-orange-400 border border-orange-500/30" : "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                }`}
                title="Importar Clientes (Colar do Excel)"
              >
                <span>Importar Planilha</span>
              </button>
              <button
                id="add-client-toggle-btn"
                onClick={() => { setShowAddForm(!showAddForm); setShowImportForm(false); onSelectClienteId(null); }}
                className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="crm-search-inp"
              type="text"
              placeholder="Buscar por nome, telefone, CPF..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 bg-slate-950/40 text-white placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedClienteId && (
            <div className="flex justify-between items-center bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-[10px] text-orange-400 font-bold">
              <span>🎯 Filtro ativo: Cliente selecionado</span>
              <button
                type="button"
                onClick={() => {
                  onSelectClienteId(null);
                  setSearchTerm("");
                }}
                className="underline hover:text-orange-300 cursor-pointer ml-2"
              >
                Limpar / Mostrar Todos
              </button>
            </div>
          )}
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5" id="crm-clients-list">
          {filteredClientes.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs text-white/50">
              Nenhum cliente correspondente localizado.
            </div>
          ) : (
            filteredClientes.map(c => {
              const isBirthdayMonth = checkBirthdayMonth(c.dataNascimento);
              const ownVehicles = veiculos.filter(v => v.clienteId === c.id);
              const clientType = c.tipo || (c.cpfCnpj?.replace(/\D/g, "").length > 11 ? "PJ" : "PF");
              return (
                <div
                  key={c.id}
                  onClick={() => { onSelectClienteId(c.id); setShowAddForm(false); setShowImportForm(false); setShowDeleteConfirm(false); }}
                  className={`p-4 cursor-pointer transition flex items-center justify-between ${
                    selectedClienteId === c.id ? "bg-white/10 border-l-4 border-orange-500 text-white font-semibold" : "hover:bg-white/5"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs truncate max-w-[12rem] sm:max-w-none">{c.nome}</h4>
                      <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono font-black shrink-0 ${
                        clientType === "PJ" 
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30" 
                          : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      }`}>
                        {clientType}
                      </span>
                      {isBirthdayMonth && (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xxs px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 whitespace-nowrap">
                          <Cake className="w-2.5 h-2.5" />
                          <span>Mês Niver</span>
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xxs text-slate-400 font-mono flex items-center gap-1">
                      <span>CPF: {c.cpfCnpj}</span>
                      <span>•</span>
                      <span>{c.telefone}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {ownVehicles.length === 0 ? (
                        <span className="text-xxs text-slate-500 italic">Nenhum carro cadastrado</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {ownVehicles.map(v => (
                            <span key={v.id} className="text-xxs bg-white/10 text-orange-400 font-bold px-1.5 py-0.5 rounded border border-white/5 font-mono">
                              {v.placa}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column (7/12) - Details, Create Form, or Add Vehicle */}
      <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl h-[calc(100vh-12rem)] min-h-[500px] flex flex-col overflow-y-auto">
        
        {/* State A: Add New Client Form */}
        {showAddForm && (
          <div className="p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Novo Registro de Cliente</h3>
              <p className="text-xs text-slate-400">Cadastre os dados cadastrais e configure o lembrete de aniversário</p>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-350 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCliente} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    id="new-client-nome-inp"
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    placeholder="Ex: João da Silva Santos"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">E-mail Corporativo</label>
                  <input
                    id="new-client-email-inp"
                    type="email"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    placeholder="Ex: joao@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Celular / WhatsApp *</label>
                  <input
                    id="new-client-phone-inp"
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CPF ou CNPJ *</label>
                  <input
                    id="new-client-cpf-inp"
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    placeholder="Ex: 000.000.000-00"
                    value={cpfCnpj}
                    onChange={(e) => handleCpfChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Cliente *</label>
                  <select
                    id="new-client-tipo-sel"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as "PF" | "PJ")}
                  >
                    <option value="PF" className="bg-slate-950">Pessoa Física (PF)</option>
                    <option value="PJ" className="bg-slate-950">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data de Nascimento (Aniversário) *</label>
                  <input
                    id="new-client-birth-inp"
                    type="date"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/45"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Endereço Residencial *</label>
                  <input
                    id="new-client-address-inp"
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    placeholder="Ex: Rua das Palmeiras, 305 - Centro"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 font-semibold text-slate-300 hover:bg-white/5 rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="save-new-client-btn"
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-white font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State A.2: Import Client CSV Form */}
        {showImportForm && (
          <div className="p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Importador de Clientes</h3>
              <p className="text-xs text-slate-400">Importe seu arquivo CSV ou cole a listagem de clientes do Excel para realizar a carga automática</p>
            </div>

            {importStatus && (
              <div className={`p-3 border text-xs rounded-lg flex items-start gap-2 ${
                importStatus.includes("Erro") || importStatus.includes("inválido") 
                  ? "bg-red-500/10 border-red-500/20 text-red-300" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{importStatus}</span>
              </div>
            )}

            <form onSubmit={handleImportCSV} className="space-y-4 text-xs font-sans">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  dragActive 
                    ? "border-orange-500 bg-orange-500/10 text-white" 
                    : "border-white/20 hover:border-white/40 bg-white/5 text-slate-300"
                }`}
              >
                <input
                  id="csv-file-upload-input"
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="csv-file-upload-input" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <Upload className={`w-8 h-8 mb-2 transition ${dragActive ? "text-white animate-bounce" : "text-orange-400"}`} />
                  <p className="font-bold text-white text-xs">Arraste e solte o arquivo CSV/Excel aqui</p>
                  <p className="text-[10px] text-slate-400 mt-1">ou clique para selecionar de seus arquivos</p>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Ou cole os dados textuais abaixo:
                </label>
                <textarea
                  id="import-csv-textarea"
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950/70 text-white font-mono text-[10px] focus:outline-none focus:ring-2 focus:ring-orange-500/45 placeholder-slate-500"
                  placeholder={`32454630;PJ;Cliente;;\"2 IRMÃOS AUTOMÓVEIS\";\"2 IRMÃOS AUTOMÓVEIS\";\"Avenida Papa João XXIII\";954;Petrópolis;;88505200;LAGES;4209300;SC;;\"493222 4657\";;;;;;;;0000-00-00;;0;0;Ativo;;`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-slate-400 text-[11px] leading-relaxed">
                <p className="font-bold text-slate-300 text-xs text-white">Dica de Importação:</p>
                <p>Nossos algoritmos processam de forma extremamente tolerante o formato padrão do Excel exportado (separador ponto-e-vírgula <code className="font-mono text-white px-1 bg-slate-900 rounded">;</code>).</p>
                <p>O sistema corrige automaticamente erros de acentuação/codificação (como João, José, construções), ignora cabeçalhos, valida aniversários zerados e classifica automaticamente se o cliente é <strong>Pessoa Física (PF)</strong> ou <strong>Pessoa Jurídica (PJ)</strong>.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="px-4 py-2 font-semibold text-slate-300 hover:bg-white/5 rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-csv-import-btn"
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-550 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <span>Processar e Importar</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State B: No Selection and Not creating */}
        {!selectedClienteId && !showAddForm && !showImportForm && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 font-sans">
            <UserPlus className="w-12 h-12 text-slate-500 mb-3" />
            <h3 className="font-bold text-white text-sm">Selecione um Cliente</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Escolha um cliente da listagem à esquerda para visualizar seu perfil, carteira mecânica, histórico de manutenção detalhado, ou para vinculação acelerada de veículos.
            </p>
          </div>
        )}

        {/* State C: Client Profile Detail & Multi-vehicle control */}
        {selectedClienteId && selectedCliente && !showAddForm && !showImportForm && (
          <div className="p-6 space-y-6 text-slate-200">
            
            {/* Header Profiling */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-xl">
              <div className="space-y-1">
                <span className="text-xxs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                  FICHA DO CLIENTE
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedCliente.nome}</h3>
                  {(() => {
                    const selType = selectedCliente.tipo || (selectedCliente.cpfCnpj?.replace(/\D/g, "").length > 11 ? "PJ" : "PF");
                    return (
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider ${
                        selType === "PJ" 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" 
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/20"
                      }`}>
                        {selType === "PJ" ? "PESSOA JURÍDICA (PJ)" : "PESSOA FÍSICA (PF)"}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xxs text-slate-400 font-mono">ID: {selectedCliente.id}</p>
              </div>

              {showDeleteConfirm ? (
                <div className="flex flex-col gap-2 p-3 bg-red-950/45 border border-red-500/25 rounded-xl text-xs w-full max-w-xs sm:w-auto shrink-0 font-sans">
                  <p className="font-bold text-red-400">Deseja realmente excluir este cliente?</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Esta operação é irreversível e removerá permanentemente o cadastro.</p>
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded text-xxs transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateClientes(clientes.filter(c => c.id !== selectedCliente.id));
                        onSelectClienteId(null);
                        setShowDeleteConfirm(false);
                      }}
                      className="px-2.5 py-1.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded text-xxs transition cursor-pointer"
                    >
                      Sim, Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    id="crm-whatsapp-chat-btn"
                    onClick={() => triggerNormalWhatsApp(selectedCliente.telefone, selectedCliente.nome)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Conversar no WhatsApp</span>
                  </button>

                  <button
                    id="crm-delete-client-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 font-bold text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Excluir cadastro de cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Cliente</span>
                  </button>
                </div>
              )}
            </div>

            {/* Campaign Alert Banner (Birthday campaign!) */}
            {checkBirthdayMonth(selectedCliente.dataNascimento) && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-orange-400 animate-bounce" />
                  <span className="font-bold text-xs">Atenção CRM: Aniversariante de Junho!</span>
                </div>
                <p className="text-xxs text-slate-300 leading-relaxed">
                  Este cliente está celebrando seu aniversário este mês. Envie um bônus especial no WhatsApp agora mesmo para fidelizar o relacionamento e garantir sua próxima revisão de suspensão ou óleo.
                </p>
                <button
                  id={`crm-birthday-bonus-btn-${selectedCliente.id}`}
                  onClick={() => triggerWhatsApp(selectedCliente.telefone, selectedCliente.nome)}
                  className="bg-orange-600 hover:bg-orange-550 text-white font-bold text-xxs px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Cake className="w-3.5 h-3.5" />
                  <span>Disparar Campanha de Aniversário</span>
                </button>
              </div>
            )}

            {/* Unified Chronological History - ALWAYS AT THE VERY TOP OF THE PROFILE DETAILS */}
            {(() => {
              const mergedHistory = [
                ...clientOS.map(o => ({ ...o, type: "os" as const })),
                ...(orcamentos || []).filter(orc => orc.clienteId === selectedCliente.id).map(orc => ({ ...orc, type: "orcamento" as const }))
              ].sort((a, b) => {
                const dateA = a.dataAbertura || "";
                const dateB = b.dataAbertura || "";
                if (dateA !== dateB) return dateB.localeCompare(dateA);
                return b.id.localeCompare(a.id);
              });

              return (
                <div className="bg-slate-900/60 p-5 border border-white/10 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                        <span>Histórico de OS & Orçamentos ({mergedHistory.length})</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Dê um clique no item abaixo para ver as opções e abrir no gerenciador</p>
                    </div>
                  </div>

                  {mergedHistory.length === 0 ? (
                    <div className="text-center py-6 px-4 text-xs text-slate-450 italic bg-white/5 border border-white/5 rounded-xl">
                      Nenhum serviço ou orçamento registrado no sistema para este proprietário.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {mergedHistory.map(item => {
                        const isExpanded = expandedHistoryId === item.id;
                        const isOs = item.type === "os";
                        const itemTypeLabel = isOs ? "Ordem de Serviço" : "Orçamento";

                        return (
                          <div 
                            key={item.id}
                            className={`border rounded-xl transition duration-150 overflow-hidden ${
                              isExpanded 
                                ? "bg-slate-900 border-orange-500/50 shadow-md ring-1 ring-orange-500/20" 
                                : "bg-white/5 border-white/5 hover:border-white/15 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isExpanded) {
                                setExpandedHistoryId(item.id);
                              } else {
                                setExpandedHistoryId(null);
                              }
                            }}
                          >
                            <div className="p-3.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 border rounded tracking-wider ${
                                    isOs 
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/25" 
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                  }`}>
                                    {itemTypeLabel.toUpperCase()} #{item.id.replace("orc_", "").replace("os_", "").toUpperCase()}
                                  </span>
                                  <span className="text-slate-400 text-xxs font-semibold font-mono">{item.dataAbertura}</span>
                                </div>
                                <p className="text-xxs text-slate-300 mt-1.5 max-w-sm sm:max-w-md truncate">
                                  {item.descricaoProblema || "Nenhum problema relatado."}
                                </p>
                              </div>

                              <div className="text-right whitespace-nowrap shrink-0 ml-3">
                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                                  item.status === "Concluído" || item.status === "Autorizado Total"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : item.status === "Cancelado"
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {item.status}
                                </span>
                                <p className="font-black text-white text-xs mt-1.5 font-mono">R$ {item.valorTotal.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Dropdown Options List on Single Click */}
                            {isExpanded && (
                              <div 
                                className="p-3 bg-slate-950/50 border-t border-white/5 space-y-2"
                                onClick={(e) => e.stopPropagation() /* Prevent double toggle click propagation */}
                              >
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isOs) {
                                        onNavigate?.("ordens", item);
                                      } else {
                                        onNavigate?.("orcamentos", item);
                                      }
                                    }}
                                    className="flex-1 bg-orange-600 hover:bg-orange-550 text-white font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-xxs transition cursor-pointer"
                                  >
                                    <Eye className="w-3" />
                                    <span>EDITAR SERVIÇO / OS</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isOs) {
                                        onNavigate?.("ordens", item);
                                      } else {
                                        onNavigate?.("orcamentos", item);
                                      }
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-xxs transition cursor-pointer"
                                  >
                                    <FileText className="w-3" />
                                    <span>Cupom / Imprimir</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const text = `Olá! Segue resumo de seu atendimento de ${itemTypeLabel} #${item.id.toUpperCase()}:\n\n🔧 Serviço: ${item.descricaoProblema}\n💰 Valor Total: R$ ${item.valorTotal.toFixed(2)}\n\nObrigado!`;
                                      const url = `https://api.whatsapp.com/send?phone=55${selectedCliente.telefone.replace(/\D/g, "")}&text=${encodeURIComponent(text)}`;
                                      window.open(url, "_blank");
                                    }}
                                    className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-xxs transition cursor-pointer"
                                  >
                                    <MessageCircle className="w-3" />
                                    <span>Zap</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-400 text-xxs uppercase tracking-wider">E-mail de Contato</h4>
                  <p className="text-white font-bold mt-0.5">{selectedCliente.email}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-400 text-xxs uppercase tracking-wider">Celular / Telefone</h4>
                  <p className="text-white font-mono font-bold mt-0.5">{selectedCliente.telefone}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-400 text-xxs uppercase tracking-wider">CPF / CNPJ</h4>
                  <p className="text-white font-mono font-bold mt-0.5">{selectedCliente.cpfCnpj}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-400 text-xxs uppercase tracking-wider">Aniversário</h4>
                  <p className="text-white font-mono font-bold mt-0.5">{selectedCliente.dataNascimento}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-lg col-span-1 md:col-span-2 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-400 text-xxs uppercase tracking-wider">Endereço de Cadastro</h4>
                  <p className="text-white font-bold mt-0.5">{selectedCliente.endereco}</p>
                </div>
              </div>
            </div>

            {/* Profile Multi-veículo Section */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    <Car className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>Garagem do Cliente ({clientVehicles.length})</span>
                  </h4>
                  <p className="text-xxs text-slate-400">Este cliente possui perfil multiveículos cadastrado no sistema</p>
                </div>

                <button
                  id="add-vehicle-to-garage-btn"
                  onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
                  className="bg-white/5 hover:bg-white/10 text-slate-200 text-xxs font-bold py-1.5 px-3 rounded-lg border border-white/10 flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  <span>Vincular Novo Carro</span>
                </button>
              </div>

              {/* Add Vehicle Inline Sub-Form */}
              {showAddVehicleForm && (
                <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl space-y-4 text-xs text-slate-200">
                  <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                    <span className="font-bold text-white">Novo Carro para {selectedCliente.nome}</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddVehicleForm(false)} 
                      className="text-slate-400 hover:text-white text-xxs"
                    >
                      Fechar
                    </button>
                  </div>

                  {vehicleError && (
                    <p className="text-red-400 bg-red-500/10 p-2 rounded text-xxs border border-red-500/20">{vehicleError}</p>
                  )}

                  {vehicleNotice && (
                    <p className={`p-2.5 rounded text-xxs border font-medium leading-relaxed ${
                      vehicleNotice.startsWith("✅") 
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>{vehicleNotice}</p>
                  )}

                  <form onSubmit={(e) => handleAddVehicle(e, selectedCliente.id)} className="space-y-3 font-sans">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Placa Mercosul *</label>
                        <input
                          id="new-veh-placa-inp"
                          type="text"
                          required
                          placeholder="Ex: ABC1D23"
                          className="w-full px-3 py-2 rounded border border-white/10 bg-slate-950/40 text-white focus:outline-none uppercase font-mono text-xs"
                          value={placa}
                          onChange={(e) => setPlaca(e.target.value)}
                        />
                      </div>
                      
                      <div className="self-end pb-0.5 shrink-0">
                        <button
                          id="detran-lookup-btn"
                          type="button"
                          onClick={handleDetranLookup}
                          disabled={detranLoading}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xxs px-4 py-2.5 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition duration-150"
                        >
                          {detranLoading ? (
                            <span className="animate-spin w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Search className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>BUSCAR</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xxs italic">
                      Dica: O botão "BUSCAR" busca marcas e especificações realistas automaticamente para otimizar o tempo!
                    </p>

                    <div className="mb-2">
                      <label className="block text-xxs font-semibold text-slate-300 mb-1">Modelo do Veículo *</label>
                      <input
                        id="new-veh-modelo-inp"
                        type="text"
                        required
                        placeholder="Ex: Gol 1.6 Mi Power Total Flex"
                        className="w-full px-2.5 py-2.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs font-semibold"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Marca *</label>
                        <input
                          id="new-veh-marca-inp"
                          type="text"
                          required
                          placeholder="Ex: Fiat"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={marca}
                          onChange={(e) => setMarca(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Ano *</label>
                        <input
                          id="new-veh-ano-inp"
                          type="text"
                          required
                          placeholder="Ex: 2017"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={ano}
                          onChange={(e) => setAno(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Motor</label>
                        <input
                          id="new-veh-motor-inp"
                          type="text"
                          placeholder="Ex: 1.4 MPI"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={motor}
                          onChange={(e) => setMotor(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Cor</label>
                        <input
                          id="new-veh-cor-inp"
                          type="text"
                          placeholder="Ex: Cinza"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={cor}
                          onChange={(e) => setCor(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">KM Atual</label>
                        <input
                          id="new-veh-km-inp"
                          type="number"
                          placeholder="Ex: 45000"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={km}
                          onChange={(e) => setKm(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">RENAVAM</label>
                        <input
                          id="new-veh-renavam-inp"
                          type="text"
                          placeholder="Ex: 1234567890"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs font-mono"
                          value={renavam}
                          onChange={(e) => setRenavam(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Chassi</label>
                        <input
                          id="new-veh-chassi-inp"
                          type="text"
                          placeholder="Ex: 9BW..."
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs font-mono uppercase"
                          value={chassi}
                          onChange={(e) => setChassi(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">Município</label>
                        <input
                          id="new-veh-municipio-inp"
                          type="text"
                          placeholder="Ex: São Paulo"
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs"
                          value={municipio}
                          onChange={(e) => setMunicipio(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-semibold text-slate-300 mb-1">UF Estado</label>
                        <input
                          id="new-veh-uf-inp"
                          type="text"
                          placeholder="Ex: SP"
                          maxLength={2}
                          className="w-full px-2.5 py-1.5 rounded border border-white/10 bg-slate-950/40 text-white text-xs uppercase"
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddVehicleForm(false)}
                        className="px-3.5 py-1.5 rounded bg-white/5 border border-white/5 text-slate-300 font-semibold text-xxs cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        id="save-new-linked-veh-btn"
                        type="submit"
                        className="px-3.5 py-1.5 rounded bg-orange-600 text-white font-semibold text-xxs hover:bg-orange-550 cursor-pointer"
                      >
                        Confirmar Vínculo
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Linked Vehicles list */}
              {clientVehicles.length === 0 ? (
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-xs text-slate-450">
                  Nenhum veículo vinculado a este proprietário ainda.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {clientVehicles.map(v => (
                    <div key={v.id} className="p-4 bg-white/5 border border-white/10 rounded-xl shadow-lg flex items-center gap-3 relative overflow-hidden group hover:border-orange-500/30 transition">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1 text-xs text-slate-200">
                        <span className="text-xxs font-mono font-bold bg-slate-950 text-orange-400 px-1.5 py-0.5 border border-white/5 rounded tracking-wide font-mono">
                          {v.placa}
                        </span>
                        <h5 className="font-extrabold text-white mt-1.5 truncate">{v.marca} {v.modelo}</h5>
                        <p className="text-xxs text-slate-400 font-medium">Ano {v.ano} • Motor {v.motor} • Cor {v.cor}</p>
                        <p className="text-xxs text-orange-400 font-bold mt-1">KM: {v.km.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
