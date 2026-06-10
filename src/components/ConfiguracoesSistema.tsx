import React, { useState } from "react";
import { Operador, OficinaConfig } from "../types";
import { motion } from "motion/react";
import { 
  Settings, 
  Users, 
  ShieldAlert, 
  Trash2, 
  PlusCircle, 
  Lock, 
  Unlock, 
  KeyRound,
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  FolderLock,
  Mail
} from "lucide-react";

interface ConfiguracoesSistemaProps {
  operadores: Operador[];
  config: OficinaConfig;
  onUpdateOperadores: (newOps: Operador[]) => void;
  onUpdateConfig: (newConfig: OficinaConfig) => void;
}

const AVAILABLE_MODULES = [
  { id: "dashboard", label: "Dashboard / Visão Geral" },
  { id: "clientes", label: "Clientes & CRM" },
  { id: "veiculos", label: "Frota de Veículos" },
  { id: "estoque", label: "Peças & Controle de Estoque" },
  { id: "orcamentos", label: "Gestão de Orçamentos" },
  { id: "ordens", label: "Ordens de Serviço (OS)" },
  { id: "mecanicos", label: "Equipe Técnica & Comissões" },
  { id: "fiscal", label: "Módulo Fiscal (Emissão NF)" },
  { id: "fechamento", label: "Fechamento Administrativo / Caixa" }
];

export default function ConfiguracoesSistema({
  operadores,
  config,
  onUpdateOperadores,
  onUpdateConfig
}: ConfiguracoesSistemaProps) {
  // Navigation inside Settings
  const [activeSubTab, setActiveSubTab] = useState<"operadores" | "empresa">("operadores");

  // General Company/Oficina states
  const [nomeOficina, setNomeOficina] = useState(config.nomeOficina || "");
  const [telefone, setTelefone] = useState(config.telefone || "");
  const [endereco, setEndereco] = useState(config.endereco || "");
  const [requireEvidence, setRequireEvidence] = useState(config.requireEvidenceToClose || false);
  const [discountPercent, setDiscountPercent] = useState<number>(config.standardDiscountLimitPercent || 10);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || "");
  const [showLogoInNF, setShowLogoInNF] = useState(config.showLogoInNF !== false);
  const [showLogoInOrcamento, setShowLogoInOrcamento] = useState(config.showLogoInOrcamento !== false);
  const [showLogoInOS, setShowLogoInOS] = useState(config.showLogoInOS !== false);
  const [adminProfilePicUrl, setAdminProfilePicUrl] = useState(config.adminProfilePicUrl || "");
  const [email, setEmail] = useState(config.email || "");
  
  const [empresaSavedSuccess, setEmpresaSavedSuccess] = useState(false);

  // New Operator credentials
  const [newNome, setNewNome] = useState("");
  const [newUsuario, setNewUsuario] = useState("");
  const [newSenha, setNewSenha] = useState("");
  const [opRole, setOpRole] = useState<"admin" | "mecanico" | "atendente">("atendente");
  const [selectedModules, setSelectedModules] = useState<string[]>(["dashboard"]);
  const [opError, setOpError] = useState("");
  const [opSuccess, setOpSuccess] = useState("");

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Admin password change states
  const [adminOldPassword, setAdminOldPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminPwdSuccess, setAdminPwdSuccess] = useState("");
  const [adminPwdError, setAdminPwdError] = useState("");

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPwdError("");
    setAdminPwdSuccess("");

    const currentSaved = localStorage.getItem("admin_custom_password") || "123456";
    if (adminOldPassword !== currentSaved) {
      setAdminPwdError("A senha atual do administrador digitada está incorreta.");
      return;
    }

    if (!adminNewPassword || !adminConfirmPassword) {
      setAdminPwdError("As novas senhas não podem estar em branco.");
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPwdError("A confirmação da nova senha não confere.");
      return;
    }

    localStorage.setItem("admin_custom_password", adminNewPassword);
    setAdminPwdSuccess("Senha do administrador master atualizada com soberba segurança!");
    setAdminOldPassword("");
    setAdminNewPassword("");
    setAdminConfirmPassword("");
  };

  // Helper file uploader function
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm and Save General Company Settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OficinaConfig = {
      nomeOficina: nomeOficina.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      requireEvidenceToClose: requireEvidence,
      standardDiscountLimitPercent: Number(discountPercent) || 0,
      logoUrl,
      showLogoInNF,
      showLogoInOrcamento,
      showLogoInOS,
      adminProfilePicUrl,
      email: email.trim()
    };
    onUpdateConfig(updated);
    setEmpresaSavedSuccess(true);
    setTimeout(() => {
      setEmpresaSavedSuccess(false);
    }, 3000);
  };

  // Toggle module selection for new operator
  const handleToggleModule = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  // Add a new Operator
  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsuario.trim().toLowerCase();

    if (!newNome.trim() || !cleanUser || !newSenha) {
      setOpError("Todos os campos do operador são obrigatórios!");
      return;
    }

    if (cleanUser === "admin" || cleanUser === "adm") {
      setOpError("Nome de usuário reservado para o administrador master!");
      return;
    }

    // Check pre-existing username
    const exists = operadores.some(o => o.usuario.toLowerCase() === cleanUser);
    if (exists) {
      setOpError("Já existe um operador com este usuário cadastrado!");
      return;
    }

    const newOp: Operador = {
      id: "ope_" + Date.now(),
      nome: newNome.trim(),
      usuario: cleanUser,
      senha: newSenha,
      role: opRole,
      funcionarioId: opRole === "mecanico" ? "mec_1" : undefined,
      modulosPermitidos: [...selectedModules]
    };

    onUpdateOperadores([...operadores, newOp]);
    setNewNome("");
    setNewUsuario("");
    setNewSenha("");
    setSelectedModules(["dashboard"]);
    setOpError("");
    setOpSuccess(`Operador ${newOp.nome} adicionado com sucesso!`);
    setTimeout(() => setOpSuccess(""), 3000);
  };

  // Delete an operator
  const handleDeleteOperator = (opId: string) => {
    if (confirm("Deseja realmente excluir este operador? Ele perderá acesso ao sistema imediatamente.")) {
      const filtered = operadores.filter(o => o.id !== opId);
      onUpdateOperadores(filtered);
    }
  };

  // Enable/disable module for an existing operator directly
  const handleToggleExistingOpPermission = (op: Operador, moduleId: string) => {
    const isPermitted = op.modulosPermitidos.includes(moduleId);
    const updatedModules = isPermitted
      ? op.modulosPermitidos.filter(id => id !== moduleId)
      : [...op.modulosPermitidos, moduleId];

    const updatedOperadores = operadores.map(o => {
      if (o.id === op.id) {
        return { ...o, modulosPermitidos: updatedModules };
      }
      return o;
    });

    onUpdateOperadores(updatedOperadores);
  };

  const togglePasswordVisibility = (opId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [opId]: !prev[opId]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
              Segurança & Sistema
            </span>
            <div className="flex items-center gap-1 text-xs text-orange-400 font-bold bg-orange-500/5 px-2 py-0.5 rounded-md">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Painel Master Admin</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Configurações & Controle de Acesso</h2>
          <p className="text-xs text-slate-400">Configure preferências globais de funcionamento e de permissão de operadores.</p>
        </div>

        {/* Local Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("operadores")}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "operadores" 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cadastro & Permissões ({operadores.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("empresa")}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "empresa" 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dados da Oficina & Regras</span>
          </button>
        </div>
      </div>

      {activeSubTab === "operadores" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form to Register Operators */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-extrabold text-orange-400 flex items-center gap-2">
                  <PlusCircle className="w-4.5 h-4.5 text-orange-450" />
                  Cadastrar Novo Operador
                </h3>
                <p className="text-xxs text-slate-400">Insira as credenciais básicas do operador e defina os módulos delegados</p>
              </div>

              {opError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-400 text-xxs font-semibold rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{opError}</span>
                </div>
              )}

              {opSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xxs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{opSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddOperator} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Martins"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Nome de Usuário</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: gabriel"
                      value={newUsuario}
                      onChange={(e) => setNewUsuario(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Senha de Acesso</label>
                    <input
                      type="password"
                      required
                      placeholder="Ex: 1234"
                      value={newSenha}
                      onChange={(e) => setNewSenha(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Cargo / Papel no Sistema</label>
                  <select
                    value={opRole}
                    onChange={(e) => setOpRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  >
                    <option value="atendente">Atendente (Vendas, Orçamentos, CRM)</option>
                    <option value="mecanico">Mecânico (Acesso limitado a OS e Painel de Execução)</option>
                    <option value="admin">Administrador Auxiliar (Acesso geral)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Permitir Acesso aos Módulos</label>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 max-h-56 overflow-y-auto space-y-2">
                    {AVAILABLE_MODULES.map(item => {
                      const isSelected = selectedModules.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleModule(item.id)}
                          className="w-full text-left flex items-center justify-between p-2 rounded-lg border text-xxs transition font-medium cursor-pointer"
                          style={{
                            borderColor: isSelected ? "rgba(249, 115, 22, 0.25)" : "rgba(255,255,255,0.05)",
                            backgroundColor: isSelected ? "rgba(249, 115, 22, 0.05)" : "transparent",
                            color: isSelected ? "#fed7aa" : "#94a3b8"
                          }}
                        >
                          <span>{item.label}</span>
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-orange-500 border-orange-500" : "border-slate-600"
                          }`}>
                            {isSelected && <span className="text-[9px] text-slate-950 font-black">✓</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-550 hover:from-orange-500 hover:to-orange-450 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-lg shadow-orange-950/40 cursor-pointer"
                >
                  Cadastrar e Ativar Operador
                </button>
              </form>
            </div>
          </div>

          {/* List of Registered Operators and their permissions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Operadores Cadastrados
                  </h3>
                  <p className="text-xxs text-slate-400">Visualize as credenciais e clique diretamente para alterar permissões online</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md">
                  {operadores.length} ATIVOS
                </span>
              </div>

              {operadores.length === 0 ? (
                <p className="text-xs text-center text-slate-500 py-12 italic">Nenhum operador cadastrado no momento.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {operadores.map((op) => {
                    const showPassword = !!showPasswordMap[op.id];
                    return (
                      <div key={op.id} className="bg-slate-950/60 border border-white/5 p-4 rounded-xl space-y-3.5 transition hover:border-orange-500/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-slate-100">{op.nome}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xxs text-slate-400">
                              <span>Usuário: <strong className="text-orange-350">{op.usuario}</strong></span>
                              <span>•</span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span>Senha: <strong>{showPassword ? op.senha : "••••••••"}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(op.id)}
                                  className="text-slate-500 hover:text-white"
                                  title={showPassword ? "Ocultar Senha" : "Exibir Senha"}
                                >
                                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteOperator(op.id)}
                            className="p-2 border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition rounded-lg shrink-0 cursor-pointer"
                            title="Desativar operador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Interactive permitted modules display */}
                        <div className="space-y-1.5">
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Módulos Permitidos (Clique p/ alternar)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_MODULES.map(module => {
                              const isPermitted = op.modulosPermitidos.includes(module.id);
                              return (
                                <button
                                  key={module.id}
                                  onClick={() => handleToggleExistingOpPermission(op, module.id)}
                                  className={`text-[10px] px-2 py-1 rounded-md font-semibold transition border cursor-pointer ${
                                    isPermitted 
                                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                                      : "bg-slate-900 text-slate-500 border-transparent hover:border-white/10"
                                  }`}
                                  title={isPermitted ? "Permitido. Clique para desativar." : "Bloqueado. Clique para permitir."}
                                >
                                  {module.label.split(" (")[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "empresa" && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              Parâmetros Corporativos & Regras Gerais
            </h3>
            <p className="text-xxs text-slate-400">Configure os dados cadastrais que estarão em faturas oficiais e as regras comerciais gerais</p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Nome Fantasia da Oficina</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    requiredMessage="Nome fantasia é obrigatório"
                    value={nomeOficina}
                    onChange={(e) => setNomeOficina(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  />
                  <Building2 className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Telefone Comercial / Atendimento</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-mono"
                  />
                  <Phone className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Endereço Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  />
                  <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">E-mail Comercial / Contato</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  />
                  <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* IDENTIDADE VISUAL & PERFIL SECTION */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-orange-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Identidade Visual, Logo & Perfil do Usuário
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Admin Profile Picture Card */}
                <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-3">
                    {adminProfilePicUrl ? (
                      <div className="relative group shrink-0">
                        <img 
                          src={adminProfilePicUrl} 
                          alt="Foto Perfil" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/45 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setAdminProfilePicUrl("")}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white/10 text-[8px] font-bold"
                          title="Remover foto"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 text-slate-500 text-xxs font-black italic">
                        Sem Foto
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-100 block">Foto de Perfil do Administrador</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Adicione ou altere a imagem de perfil exibida no cabeçalho do sistema.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-850 px-3.5 py-2 border border-white/10 rounded-lg text-xxs font-bold text-slate-300 hover:text-white transition inline-block">
                      Selecionar Foto
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, setAdminProfilePicUrl)} 
                      />
                    </label>
                    {adminProfilePicUrl && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Foto carregada ✓</span>
                    )}
                  </div>
                </div>

                {/* Company Logo Card */}
                <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <div className="relative group shrink-0">
                        <img 
                          src={logoUrl} 
                          alt="Logo Oficina" 
                          className="w-16 h-16 rounded-xl object-contain bg-white/5 border border-orange-500/30 p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white/10 text-[8px] font-bold"
                          title="Remover logotipo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 text-slate-500 text-[10px] font-bold text-center">
                        Sem Logo
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-100 block">Logotipo Oficial da Oficina</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Utilizado para faturamento fiscal, recibos e relatórios unificados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-850 px-3.5 py-2 border border-white/10 rounded-lg text-xxs font-bold text-slate-300 hover:text-white transition inline-block">
                      Upload Logo (PNG/JPG)
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, setLogoUrl)} 
                      />
                    </label>
                    {logoUrl && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Logo carregado ✓</span>
                    )}
                  </div>
                </div>

              </div>

              {/* LOGO PRINT CONFIGS */}
              <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Onde deseja estampar o logotipo no sistema?</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* NF Display Toggle */}
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/65 border border-white/5 hover:border-white/10 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="accent-orange-500 h-4 w-4 bg-slate-800 border-white/10 rounded" 
                      checked={showLogoInNF} 
                      onChange={(e) => setShowLogoInNF(e.target.checked)} 
                    />
                    <div className="flex flex-col">
                      <span className="text-xxs font-bold text-slate-200">Módulo Fiscal (Nota Fiscal)</span>
                      <span className="text-[9px] text-slate-500">Exibir no cabeçalho da fatura</span>
                    </div>
                  </label>

                  {/* Quote/Orcamento Display Toggle */}
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/65 border border-white/5 hover:border-white/10 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="accent-orange-500 h-4 w-4 bg-slate-800 border-white/10 rounded" 
                      checked={showLogoInOrcamento} 
                      onChange={(e) => setShowLogoInOrcamento(e.target.checked)} 
                    />
                    <div className="flex flex-col">
                      <span className="text-xxs font-bold text-slate-200">Orçamentos</span>
                      <span className="text-[9px] text-slate-500">Estampar no PDF de orçamento</span>
                    </div>
                  </label>

                  {/* OS Display Toggle */}
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/65 border border-white/5 hover:border-white/10 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="accent-orange-500 h-4 w-4 bg-slate-800 border-white/10 rounded" 
                      checked={showLogoInOS} 
                      onChange={(e) => setShowLogoInOS(e.target.checked)} 
                    />
                    <div className="flex flex-col">
                      <span className="text-xxs font-bold text-slate-200">Ordens de Serviço (OS)</span>
                      <span className="text-[9px] text-slate-500">Sair impresso na via do cliente</span>
                    </div>
                  </label>

                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-orange-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Regras e Validações Comerciais
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Evidences toggle */}
                <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-205 block text-slate-100">Exigir Evidências de Fotos p/ Conclusão</span>
                    <p className="text-xxs text-slate-400 leading-normal">
                      Se habilitado, impede que uma Ordem de Serviço seja alterada para "Concluído" no sistema sem pelo menos 1 foto anexada.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireEvidence(!requireEvidence)}
                    className={`w-12 h-6.5 shrink-0 rounded-full transition p-1 cursor-pointer flex items-center ${
                      requireEvidence ? "bg-orange-600 justify-end" : "bg-slate-800 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* Discount threshold */}
                <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-100 block">Desconto Máximo Padrão (%)</span>
                    <p className="text-xxs text-slate-400 leading-normal">
                      Define a porcentagem máxima padrão recomendada de desconto que vendedores podem conceder ao aprovar orçamentos.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                      className="bg-slate-900 border border-white/10 rounded-lg py-1 px-3 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-white font-bold"
                    />
                    <span className="text-xxs text-slate-400">% de desconto permitido no balcão</span>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO DE SEGURANÇA E ALTERAÇÃO DE SENHA PRÓPRIA DO GESTOR */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-orange-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-orange-400" />
                Segurança • Alteração de Senha do Administrador Master
              </h4>
              <p className="text-xxs text-slate-400">Atualize sua senha de administrador própria periodicamente para manter a integridade fiscal da sua empresa.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Senha Atual do Administrador</label>
                  <input
                    type="password"
                    placeholder="Sua senha de login master atual"
                    value={adminOldPassword}
                    onChange={(e) => setAdminOldPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Definir Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Nova senha robusta"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Confirmar Nova Senha</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={handleUpdateAdminPassword}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-1.5 rounded-lg text-xxs transition cursor-pointer shrink-0 border border-white/10"
                    >
                      Alterar
                    </button>
                  </div>
                </div>

                {adminPwdError && (
                  <div className="md:col-span-3 text-xxs text-red-400 font-bold bg-red-500/10 border border-red-500/10 p-2.5 rounded-lg">
                    ⚠️ {adminPwdError}
                  </div>
                )}
                {adminPwdSuccess && (
                  <div className="md:col-span-3 text-xxs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/10 p-2.5 rounded-lg border-emerald-500/20">
                    ✓ {adminPwdSuccess}
                  </div>
                )}
              </div>
            </div>

            {empresaSavedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xxs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Configurações atualizadas com sucesso e replicadas no banco de memória do sistema!</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-orange-950/40 cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-4.5 h-4.5" />
                <span>Salvar Todas as Preferências</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
