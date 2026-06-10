import React, { useState, useEffect } from "react";
import { Cliente, Veiculo, Peca, Mecanico, OrdemServico, FechamentoAdmDetails, OSStatus } from "../types";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  DollarSign, 
  Percent, 
  Truck, 
  Wrench, 
  CheckSquare, 
  Square, 
  FileText, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  Coins, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  Search, 
  Building2, 
  Archive, 
  Info, 
  Unlock,
  Package,
  PlusCircle,
  HelpCircle
} from "lucide-react";

interface FechamentoAdministrativoProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  pecas: Peca[];
  ordens: OrdemServico[];
  onUpdateOrdens: (newOrdens: OrdemServico[]) => void;
}

// Preset card fees
const DEFAULT_CARD_FEES = {
  "Dinheiro": 0.0,
  "Pix": 0.0,
  "Débito": 1.40,
  "Crédito": 2.85,
  "Crédito Parcelado": 4.60
};

export default function FechamentoAdministrativo({
  clientes,
  veiculos,
  mecanicos,
  pecas,
  ordens,
  onUpdateOrdens
}: FechamentoAdministrativoProps) {
  // Authentication State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tabs for the closure module
  const [adminTab, setAdminTab] = useState<"auditoria" | "historico" | "dashboard">("auditoria");

  // Selected Order of Service to Auditing
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);

  // States for Card Fees & Payment Settings
  const [formaPagamento, setFormaPagamento] = useState<"Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado">("Dinheiro");
  const [bandeiraCartao, setBandeiraCartao] = useState("");
  const [customTaxa, setCustomTaxa] = useState<string>("0.00");

  // Cost and Deductions States (Keys represent pecaId or specific item indices)
  const [pecasOrigem, setPecasOrigem] = useState<Record<string, "Compra Direta" | "Estoque Existente">>({});
  const [pecasFornecedor, setPecasFornecedor] = useState<Record<string, string>>({});
  const [pecasCustoReal, setPecasCustoReal] = useState<Record<string, string>>({}); // string input for ease of typing

  // Custom Mechanic Commission
  const [comissaoManual, setComissaoManual] = useState<string>("");
  const [comissaoCalculada, setComissaoCalculada] = useState<number>(0);

  // Extras
  const [impostosExtras, setImpostosExtras] = useState<string>("0.00");
  const [observacoes, setObservacoes] = useState("");

  // Audit Checklist state (stores list of item keys checked, e.g., 'pec_1', 'mao-de-obra')
  const [checklistValidados, setChecklistValidados] = useState<string[]>([]);

  // Search query for historical closures
  const [historySearch, setHistorySearch] = useState("");

  // Check storage on load
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem("admin_fechamento_unlocked") === "true";
    if (isUnlocked) {
      setIsAdminUnlocked(true);
    }
  }, []);

  // Handle Admin Authorization
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser.trim() === "Adm" && loginPass === "123456789") {
      setIsAdminUnlocked(true);
      setLoginError("");
      sessionStorage.setItem("admin_fechamento_unlocked", "true");
    } else {
      setLoginError("Credenciais inválidas! Use Login: Adm | Senha: 123456789");
    }
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem("admin_fechamento_unlocked");
    setLoginPass("");
  };

  // Find OS to audit
  const auditingOS = ordens.find(o => o.id === selectedOSId);

  // Pre-fill fields whenever selection changes
  useEffect(() => {
    if (auditingOS) {
      // Find mechanic percentage
      const mec = mecanicos.find(m => m.id === auditingOS.mecanicoId);
      const mecPct = mec ? mec.comissaoPercentual : 10;
      const calculatedCom = (auditingOS.valorMaoDeObra * mecPct) / 100;
      setComissaoCalculada(calculatedCom);
      setComissaoManual(calculatedCom.toFixed(2));

      // Preset parts details
      const initialOrigins: Record<string, "Compra Direta" | "Estoque Existente"> = {};
      const initialSuppliers: Record<string, string> = {};
      const initialCosts: Record<string, string> = {};

      auditingOS.pecasUtilizadas.forEach(p => {
        const matchingPartObj = pecas.find(pt => pt.id === p.pecaId);
        initialOrigins[p.pecaId] = "Estoque Existente";
        initialSuppliers[p.pecaId] = matchingPartObj ? matchingPartObj.fabricante : "Distribuidor Padrão";
        initialCosts[p.pecaId] = matchingPartObj ? matchingPartObj.precoCusto.toFixed(2) : p.precoUnitario.toFixed(2);
      });

      setPecasOrigem(initialOrigins);
      setPecasFornecedor(initialSuppliers);
      setPecasCustoReal(initialCosts);

      // Default payment & extras
      setFormaPagamento("Dinheiro");
      setBandeiraCartao("");
      setCustomTaxa("0.00");
      setImpostosExtras("0.00");
      setObservacoes("");
      setChecklistValidados([]);
    }
  }, [selectedOSId, auditingOS, pecas, mecanicos]);

  // Adjust card fee whenever payment method changes
  useEffect(() => {
    if (formaPagamento && DEFAULT_CARD_FEES.hasOwnProperty(formaPagamento)) {
      setCustomTaxa(DEFAULT_CARD_FEES[formaPagamento as keyof typeof DEFAULT_CARD_FEES].toFixed(2));
    }
  }, [formaPagamento]);

  // Calculations for Net Profit
  const getSubtotalPecasVenda = () => {
    if (!auditingOS) return 0;
    return auditingOS.pecasUtilizadas.reduce((acc, p) => acc + (p.precoUnitario * p.quantidade), 0);
  };

  const getSubtotalPecasCusto = () => {
    if (!auditingOS) return 0;
    return auditingOS.pecasUtilizadas.reduce((acc, p) => {
      const realCost = parseFloat(pecasCustoReal[p.pecaId]) || 0;
      return acc + (realCost * p.quantidade);
    }, 0);
  };

  const getTaxasCartaoValor = () => {
    if (!auditingOS) return 0;
    const taxaPct = parseFloat(customTaxa) || 0;
    return (auditingOS.valorTotal * taxaPct) / 100;
  };

  const getComissaoFinalMecanico = () => {
    return parseFloat(comissaoManual) || 0;
  };

  const getExtrasDeducoesVal = () => {
    return parseFloat(impostosExtras) || 0;
  };

  const getLucroLiquido = () => {
    if (!auditingOS) return 0;
    const bruto = auditingOS.valorTotal;
    const custoPecas = getSubtotalPecasCusto();
    const comissao = getComissaoFinalMecanico();
    const taxasBandeira = getTaxasCartaoValor();
    const impostos = getExtrasDeducoesVal();

    return bruto - custoPecas - comissao - taxasBandeira - impostos;
  };

  const getLucroPercentual = () => {
    if (!auditingOS || auditingOS.valorTotal === 0) return 0;
    return (getLucroLiquido() / auditingOS.valorTotal) * 100;
  };

  // Convert/Simulate importing any Concluded order to administrative audit queue
  const handleSimulateAuditImport = (osId: string) => {
    const updated = ordens.map(o => {
      if (o.id === osId) {
        return { ...o, status: "Aguardando Conferência" as OSStatus };
      }
      return o;
    });
    onUpdateOrdens(updated);
  };

  // Save/Confirm Closure (and set OSStatus as "Arquivada")
  const handleConfirmClosure = () => {
    if (!auditingOS) return;

    // Build the Closure object
    const closureDetails: FechamentoAdmDetails = {
      formaPagamento,
      bandeiraCartao: ["Débito", "Crédito", "Crédito Parcelado"].includes(formaPagamento) ? (bandeiraCartao || "Geral") : undefined,
      taxaCartaoPercentual: parseFloat(customTaxa) || 0,
      custoPecasOrigem: { ...pecasOrigem },
      custoPecasFornecedor: { ...pecasFornecedor },
      custoPecasReais: Object.keys(pecasCustoReal).reduce((acc, k) => {
        acc[k] = parseFloat(pecasCustoReal[k]) || 0;
        return acc;
      }, {} as Record<string, number>),
      comissaoMecanicoOriginal: comissaoCalculada,
      comissaoMecanicoFinal: getComissaoFinalMecanico(),
      impostosCustosExtras: getExtrasDeducoesVal(),
      checklistValidados: [...checklistValidados],
      observacoes: observacoes ? observacoes.trim() : undefined,
      lucroLiquidoCalculado: getLucroLiquido(),
      contabilizadoEm: new Date().toISOString().split("T")[0]
    };

    const updatedOrdens = ordens.map(o => {
      if (o.id === auditingOS.id) {
        return {
          ...o,
          status: "Arquivada" as OSStatus,
          fechamentoAdm: closureDetails
        };
      }
      return o;
    });

    onUpdateOrdens(updatedOrdens);
    setSelectedOSId(null);
    setAdminTab("historico");
  };

  // Format Helper
  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Helper getters
  const getClienteNome = (id: string) => {
    return clientes.find(c => c.id === id)?.nome || "Não Cadastrado";
  };

  const getVeiculoDesc = (id: string) => {
    const v = veiculos.find(vei => vei.id === id);
    return v ? `${v.marca} ${v.modelo} (${v.placa})` : "N/A";
  };

  const getMecanicoNome = (id: string) => {
    return mecanicos.find(m => m.id === id)?.nome || "Desconhecido";
  };

  // Filters
  const queueOS = ordens.filter(o => o.status === "Aguardando Conferência");
  const archivedOS = ordens.filter(o => o.status === "Arquivada");
  const concludedAlternativeOS = ordens.filter(o => o.status === "Concluído" && !o.fechamentoAdm);

  // Historical closures filter search
  const filteredHistory = archivedOS.filter(o => {
    const q = historySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      getClienteNome(o.clienteId).toLowerCase().includes(q) ||
      getVeiculoDesc(o.veiculoId).toLowerCase().includes(q) ||
      (o.fechamentoAdm?.formaPagamento || "").toLowerCase().includes(q)
    );
  });

  // Safe login gate style wrapper
  if (!isAdminUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-orange-500/30 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 text-slate-100"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border border-orange-500/25">
              <Lock className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-extrabold text-orange-400 tracking-tight">Acesso Administrativo</h2>
            <p className="text-xs text-slate-400">
              Módulo exclusivo de apuração de lucro líquido e fechamento fiscal das ordens finalizadas.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Usuário de Acesso</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Adm"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Senha de Proteção</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="•••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-mono"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xxs leading-relaxed font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-orange-550 hover:from-orange-500 hover:to-orange-450 text-slate-950 text-xs font-black py-3 rounded-xl transition shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              Autenticar e Entrar
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 font-mono">
            Default: Adm / 123456789
          </p>
        </motion.div>
      </div>
    );
  }

  // Header Dashboard KPI Summary calculations
  const totalFaturadoHistorico = archivedOS.reduce((acc, o) => acc + o.valorTotal, 0);
  const totalLucroHistorico = archivedOS.reduce((acc, o) => acc + (o.fechamentoAdm?.lucroLiquidoCalculado || 0), 0);
  const totalPecasCustehado = archivedOS.reduce((acc, o) => {
    if (!o.fechamentoAdm) return acc;
    const individualCosts = Object.values(o.fechamentoAdm.custoPecasReais).reduce((sum, v) => sum + v, 0);
    return acc + individualCosts;
  }, 0);
  const margemGeralAcumulada = totalFaturadoHistorico > 0 ? (totalLucroHistorico / totalFaturadoHistorico) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
              Módulo Admin
            </span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sessão Liberada</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Fechamento e Auditoria Administrativa</h2>
          <p className="text-xs text-slate-400">Apure lucros reais, deduza taxas de cartões e gerencie custos de compras de auto-peças.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => { setAdminTab("auditoria"); setSelectedOSId(null); }}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              adminTab === "auditoria" 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Serviços a Conferir ({queueOS.length})</span>
          </button>

          <button
            onClick={() => { setAdminTab("historico"); setSelectedOSId(null); }}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              adminTab === "historico" 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Faturados / Arquivados ({archivedOS.length})</span>
          </button>

          <button
            onClick={() => { setAdminTab("dashboard"); setSelectedOSId(null); }}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              adminTab === "dashboard" 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400" 
                : "border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Consolidado Fiscal</span>
          </button>

          <button
            onClick={handleAdminLock}
            className="px-3 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-xl transition cursor-pointer text-xs font-bold"
            title="Bloquear painel"
          >
            Sair Admin
          </button>
        </div>
      </div>

      {/* RENDER TAB: AUDITORIA QUEUE */}
      {adminTab === "auditoria" && !selectedOSId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-extrabold text-orange-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  Orçamentos Convertidos Aguardando Auditoria
                </h3>
                <span className="text-xxs text-slate-400 font-mono">
                  {queueOS.length} fila de processamento
                </span>
              </div>

              {queueOS.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs">Tudo pronto! Não há Ordens de Serviço aguardando auditoria.</p>
                  
                  {concludedAlternativeOS.length > 0 && (
                    <div className="mt-4 bg-slate-950/60 p-4 border border-white/5 rounded-xl max-w-md mx-auto">
                      <p className="text-xxs text-slate-400 mb-2 leading-relaxed">
                        Existem <strong>{concludedAlternativeOS.length} OSs concluídas</strong> sem fechamento financeiro ainda. Deseja simular colocando alguma delas no fluxo de conferência administrativa?
                      </p>
                      <div className="space-y-1.5 text-left">
                        {concludedAlternativeOS.map(os => (
                          <div key={os.id} className="flex justify-between items-center text-xxs border-b border-white/5 py-1">
                            <span className="text-orange-400 font-mono">#{os.id} - {getClienteNome(os.clienteId)}</span>
                            <button
                              onClick={() => handleSimulateAuditImport(os.id)}
                              className="bg-orange-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] hover:bg-orange-400 transition"
                            >
                              Simular Auditoria
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {queueOS.map(o => {
                    const client = clientes.find(c => c.id === o.clienteId);
                    const vehicle = veiculos.find(v => v.id === o.veiculoId);
                    const mechanic = mecanicos.find(m => m.id === o.mecanicoId);
                    return (
                      <div key={o.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/5 rounded-xl px-2 transition group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-white bg-slate-950 p-[2px] px-1.5 border border-white/10 rounded uppercase">
                              #{o.id.toUpperCase().slice(-6)}
                            </span>
                            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 rounded-full border border-orange-500/15 animate-pulse">
                              Aguardando Fechamento
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-100">{client?.nome || "Cliente Desconhecido"}</h4>
                          <p className="text-xxs text-slate-400 leading-none">
                            Veículo: <strong className="text-white">{vehicle ? `${vehicle.marca} ${vehicle.modelo} [${vehicle.placa}]` : "N/A"}</strong>
                          </p>
                          <p className="text-xxs text-slate-400 leading-none">
                            Mecânico: <strong className="text-white">{mechanic?.nome || "N/A"}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Valor Bruto</p>
                            <span className="font-black text-orange-400 text-sm">{formatCurrency(o.valorTotal)}</span>
                          </div>
                          <button
                            onClick={() => setSelectedOSId(o.id)}
                            className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black p-2 px-4 rounded-xl text-xxs transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Auditar Ordem</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ info side panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Info className="w-4 h-4 text-orange-400" />
                Dicas de Fechamento Real
              </h3>
              <p className="text-xxs text-slate-400 leading-relaxed">
                O fechamento administrativo permite identificar o que sobrou no caixa após o fim do serviço técnico.
              </p>
              <ul className="text-xxs text-slate-400 space-y-2 font-medium">
                <li className="flex gap-1.5 items-start">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span><strong>Forma de pagamento:</strong> Ajuste as taxas de bandeira para expurgar taxas bancárias antes do cálculo.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span><strong>Origem real:</strong> Se a peça foi comprada para a OS ("Compra Direta"), você registra por qual fornecedor e o custo exato pago.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span><strong>Comissões:</strong> Ajuste o ganho do profissional se houver deduções manuais.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW: ACTIVE AUDITING WORKSPACE */}
      {adminTab === "auditoria" && selectedOSId && auditingOS && (
        <div className="space-y-6">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedOSId(null)}
              className="text-xxs font-extrabold text-slate-400 hover:text-white cursor-pointer transition bg-white/5 border border-white/10 p-1.5 rounded-lg"
            >
              ← Voltar para Fila
            </button>
            <div className="text-xs font-bold text-slate-400">
              Auditando OS <strong className="text-orange-400">#{auditingOS.id.toUpperCase()}</strong> de <strong className="text-white">{getClienteNome(auditingOS.clienteId)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Editing settings and audits (left column) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Payment details and finance charges */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-orange-450" />
                  1. Forma de Pagamento & Taxas Intermediárias
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Método de Faturamento *</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Dinheiro">Dinheiro (Taxa: 0%)</option>
                      <option value="Pix">Pix (Taxa: 0%)</option>
                      <option value="Débito">Cartão de Débito</option>
                      <option value="Crédito">Cartão de Crédito 1x</option>
                      <option value="Crédito Parcelado">Cartão de Crédito Parcelado</option>
                    </select>
                  </div>

                  {["Débito", "Crédito", "Crédito Parcelado"].includes(formaPagamento) && (
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Bandeira do Cartão</label>
                      <input
                        type="text"
                        placeholder="Ex: Visa, Mastercard, Elo..."
                        value={bandeiraCartao}
                        onChange={(e) => setBandeiraCartao(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Taxa Intermediadora (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={customTaxa}
                        onChange={(e) => setCustomTaxa(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 pr-8 text-xs text-white"
                      />
                      <Percent className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 uppercase">Dedução de Intermediação</span>
                    <span className="text-xs font-extrabold text-red-400">
                      -{formatCurrency(getTaxasCartaoValor())} <span className="text-[10px] font-mono font-medium">({customTaxa}%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable parts cost source */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-orange-450" />
                  2. Origem das Auto-Peças & Margem de Custo Real
                </h3>

                {auditingOS.pecasUtilizadas.length === 0 ? (
                  <p className="text-xxs italic text-slate-500 font-medium">Não foram utilizadas peças listadas nesta Ordem de Serviço.</p>
                ) : (
                  <div className="space-y-4">
                    {auditingOS.pecasUtilizadas.map((p, idx) => {
                      const spec = pecas.find(pt => pt.id === p.pecaId);
                      const origin = pecasOrigem[p.pecaId] || "Estoque Existente";
                      return (
                        <div key={p.pecaId} className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-xs text-white">{spec?.descricao || "Componente técnico"}</h4>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Fabricante original: {spec?.fabricante || "N/A"} | Qtd original: {p.quantidade} un × {formatCurrency(p.precoUnitario)} (Faturamento: {formatCurrency(p.quantidade * p.precoUnitario)})
                              </p>
                            </div>
                            <span className="p-1 px-2.5 bg-slate-900 text-xxs border border-white/5 font-mono text-orange-400 rounded">
                              Item #{idx + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-350">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Origem do Estoque</label>
                              <select
                                value={origin}
                                onChange={(e) => {
                                  const val = e.target.value as "Compra Direta" | "Estoque Existente";
                                  setPecasOrigem(prev => ({ ...prev, [p.pecaId]: val }));
                                  
                                  // automatically prefilled supplier to supplier or custom for direct purchase
                                  if (val === "Compra Direta" && spec) {
                                    setPecasFornecedor(prev => ({ ...prev, [p.pecaId]: "Forn. Externo " + spec.fabricante }));
                                  }
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xxs text-white"
                              >
                                <option value="Estoque Existente">Estoque Existente (Custo Médio)</option>
                                <option value="Compra Direta">Compra Direta (Sem tocar estoque)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                {origin === "Compra Direta" ? "Qual Fornecedor de Faturamento?" : "Fabricante/Origem"}
                              </label>
                              <input
                                type="text"
                                placeholder="Nome do Fornecedor / Distribuidor"
                                value={pecasFornecedor[p.pecaId] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPecasFornecedor(prev => ({ ...prev, [p.pecaId]: val }));
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xxs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Custo Real Unitário (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={pecasCustoReal[p.pecaId] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPecasCustoReal(prev => ({ ...prev, [p.pecaId]: val }));
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xxs text-white focus:ring-1 focus:ring-orange-500 font-mono text-right"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Commission adjust */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-455" />
                    3. Comissão do Mecânico Responsável
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Profissional: <strong className="text-white">{getMecanicoNome(auditingOS.mecanicoId)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950/40 p-3.5 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Mão de Obra Bruta</span>
                    <strong className="text-sm font-extrabold text-white">{formatCurrency(auditingOS.valorMaoDeObra)}</strong>
                  </div>

                  <div className="bg-slate-950/40 p-3.5 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Calculada Automática</span>
                    <strong className="text-sm font-extrabold text-orange-400">{formatCurrency(comissaoCalculada)}</strong>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1.5">Ajuste de Comissão Manual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={comissaoManual}
                      onChange={(e) => setComissaoManual(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:ring-1 focus:ring-orange-500 font-mono text-right font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Extra Costs, Discounts or taxes */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-orange-450" />
                  4. Impostos / Amortizações / Taxas Extras
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Custos Logísticos, Impostos ou Extras (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 25.00"
                      value={impostosExtras}
                      onChange={(e) => setImpostosExtras(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white text-right font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Notas Internas e Observações do Fechamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Faturado em 3x s/ juros no cartão..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial math workspace checkout side screen */}
            <div className="space-y-6">
              
              {/* Calculating box */}
              <div className="bg-slate-900 border border-orange-500/20 rounded-2xl p-6.5 text-slate-100 shadow-xl space-y-5">
                <div className="text-center space-y-1">
                  <TrendingUp className="w-9 h-9 text-orange-400 mx-auto" />
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-orange-400">
                    Lucratividade Líquida Estimada
                  </h3>
                  <p className="text-[10px] text-slate-400">Apuração das deduções em tempo real</p>
                </div>

                <div className="space-y-2 border-y border-white/5 py-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Faturado (Bruto):</span>
                    <strong className="text-white font-mono font-bold">{formatCurrency(auditingOS.valorTotal)}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Custo Total Peças:</span>
                    <strong className="text-red-400 font-mono font-medium">-{formatCurrency(getSubtotalPecasCusto())}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Comissão de Serviços:</span>
                    <strong className="text-red-400 font-mono font-medium">-{formatCurrency(getComissaoFinalMecanico())}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxas do Cartão:</span>
                    <strong className="text-red-400 font-mono font-medium">-{formatCurrency(getTaxasCartaoValor())}</strong>
                  </div>

                  {getExtrasDeducoesVal() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extras / Imposto:</span>
                      <strong className="text-red-400 font-mono font-medium">-{formatCurrency(getExtrasDeducoesVal())}</strong>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-4 border border-white/5 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Lucro no Bolso</span>
                    <span className={`text-lg font-black ${getLucroLiquido() > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(getLucroLiquido())}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Margem Líquida</span>
                    <span className={`text-xs font-black p-1 px-2.5 rounded-lg border leading-none inline-block mt-0.5 ${
                      getLucroPercentual() > 25 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {getLucroPercentual().toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Auditor checklist requirements block */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5.5 space-y-4 shadow-lg text-slate-350">
                <h4 className="text-xs uppercase tracking-widest font-extrabold text-slate-200 flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-orange-400" />
                  Checklist de Auditoria
                </h4>
                <p className="text-xxs text-slate-400 leading-relaxed">
                  Para garantir a segurança financeira do caixa, o Adm deve conferir fisicamente & validar cada item individualmente abaixo antes de faturar definitavente.
                </p>

                <div className="space-y-2.5 text-xxs font-bold text-slate-200">
                  {/* Service item validation checklist */}
                  <button
                    type="button"
                    onClick={() => {
                      if (checklistValidados.includes("mao-de-obra")) {
                        setChecklistValidados(checklistValidados.filter(x => x !== "mao-de-obra"));
                      } else {
                        setChecklistValidados([...checklistValidados, "mao-de-obra"]);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-white/5 hover:bg-slate-950 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    {checklistValidados.includes("mao-de-obra") ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-orange-450 shrink-0" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 shrink-0" />
                    )}
                    <span className="truncate">Confirmar serviço & Comissão do {getMecanicoNome(auditingOS.mecanicoId)}</span>
                  </button>

                  {/* Validate each piece list in the checklist */}
                  {auditingOS.pecasUtilizadas.map((p, idx) => {
                    const spec = pecas.find(pt => pt.id === p.pecaId);
                    const k = p.pecaId;
                    const validated = checklistValidados.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          if (validated) {
                            setChecklistValidados(checklistValidados.filter(x => x !== k));
                          } else {
                            setChecklistValidados([...checklistValidados, k]);
                          }
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-white/5 hover:bg-slate-950 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        {validated ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-orange-450 shrink-0" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 shrink-0" />
                        )}
                        <span className="truncate">Validar {spec?.descricao || "Peça"} (Item #{idx + 1})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Total checklist requirements checking */}
                {checklistValidados.length < (auditingOS.pecasUtilizadas.length + 1) ? (
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-xxxxs text-amber-400 leading-relaxed font-semibold">
                    Aviso: Certifique-se de marcar todos os itens acima como validados para liberar o encerramento do faturamento desta OS. 
                    ({checklistValidados.length} de {auditingOS.pecasUtilizadas.length + 1} validados)
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-xxxxs text-emerald-400 leading-relaxed font-semibold">
                    Sucesso! Todas as verificações de conformidade foram concluídas. Você está pronto para salvar esse movimento no caixa.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmClosure}
                  disabled={checklistValidados.length < (auditingOS.pecasUtilizadas.length + 1)}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-550 hover:from-orange-500 hover:to-orange-450 text-slate-950 text-xs font-black py-3 rounded-xl transition shadow-lg shadow-orange-950/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                >
                  Arquivar e Lançar no Caixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB: COV/ADMIN HISTORICO CLOSE */}
      {adminTab === "historico" && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <h3 className="text-sm font-extrabold text-orange-450 flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-orange-400" />
              Histórico de Ordens Contabilizadas & Arquivadas
            </h3>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Filtrar por ID, cliente, placa ou pagamento..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <p className="text-xs text-center py-12 text-slate-500 italic">Nenhum fechamento gravado no histórico.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                    <th className="p-3.5 text-left">Código / OS</th>
                    <th className="p-3.5 text-left">Faturado em</th>
                    <th className="p-3.5 text-left font-sans">Cliente e Veículo</th>
                    <th className="p-3.5 text-left">Mecânico</th>
                    <th className="p-3.5 text-left">Bandeira / Pagamento</th>
                    <th className="p-3.5 text-right">Comissão Ajustada</th>
                    <th className="p-3.5 text-right">Gross (Bruto)</th>
                    <th className="p-3.5 text-right text-emerald-400">Net Profit (Lucro)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredHistory.map(o => {
                    const adm = o.fechamentoAdm;
                    if (!adm) return null;
                    return (
                      <tr key={o.id} className="hover:bg-white/5 border-b border-white/5 transition">
                        <td className="p-3.5 font-mono text-[10px] text-orange-400 font-bold uppercase">
                          #{o.id.toUpperCase().slice(-6)}
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">
                          {adm.contabilizadoEm || "N/A"}
                        </td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-white text-xs">{getClienteNome(o.clienteId)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{getVeiculoDesc(o.veiculoId)}</div>
                        </td>
                        <td className="p-3.5 text-xs">
                          {getMecanicoNome(o.mecanicoId)}
                        </td>
                        <td className="p-3.5 font-sans">
                          <span className="p-1 px-2.5 bg-slate-950 text-white rounded text-[10px] border border-white/10">
                            {adm.formaPagamento} {adm.bandeiraCartao ? `[${adm.bandeiraCartao}]` : ""}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-medium text-slate-400">
                          {formatCurrency(adm.comissaoMecanicoFinal)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          {formatCurrency(o.valorTotal)}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={`p-1 px-2 rounded-lg font-mono font-black ${
                            adm.lucroLiquidoCalculado > 0 ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" : "text-red-400 bg-red-500/5"
                          }`}>
                            {formatCurrency(adm.lucroLiquidoCalculado)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB: GENERAL FINANCIAL KPI CHARTS AND SUMMARIES */}
      {adminTab === "dashboard" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                <DollarSign className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Faturado Líquido</span>
                <h4 className="text-lg font-extrabold text-white leading-tight font-mono">{formatCurrency(totalFaturadoHistorico)}</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lucro Líquido Real</span>
                <h4 className="text-lg font-extrabold text-emerald-450 text-emerald-350 font-mono leading-tight">{formatCurrency(totalLucroHistorico)}</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
                <Package className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Desembolso Compra Peças</span>
                <h4 className="text-lg font-extrabold text-white leading-tight font-mono">{formatCurrency(totalPecasCustehado)}</h4>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                <Percent className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Margem Líquida Real</span>
                <h4 className="text-lg font-extrabold text-white font-mono leading-tight">{margemGeralAcumulada.toFixed(1)}%</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Reconciliation summary of suppliers paid (Conselho de fornecedores faturados) */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-extrabold uppercase text-orange-450 tracking-wider flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  Relatório de Fornecedores & Contas a Pagar
                </h3>
                <span className="text-xxs text-slate-400 font-bold">Custo de Peças por Empresa</span>
              </div>

              {(() => {
                // compile record of suppliers paid
                const supplierMap: Record<string, { totalCusto: number; itemsCount: number }> = {};
                archivedOS.forEach(o => {
                  const adm = o.fechamentoAdm;
                  if (!adm) return;
                  o.pecasUtilizadas.forEach(p => {
                    const fornecedor = adm.custoPecasFornecedor[p.pecaId] || "Sem Marca Fornecedor";
                    const realCustoItem = (adm.custoPecasReais[p.pecaId] || p.precoUnitario * 0.6) * p.quantidade;
                    
                    if (!supplierMap[fornecedor]) {
                      supplierMap[fornecedor] = { totalCusto: 0, itemsCount: 0 };
                    }
                    supplierMap[fornecedor].totalCusto += realCustoItem;
                    supplierMap[fornecedor].itemsCount += p.quantidade;
                  });
                });

                const list = Object.entries(supplierMap).sort((a,b) => b[1].totalCusto - a[1].totalCusto);

                if (list.length === 0) {
                  return <p className="text-xxs italic text-slate-500 text-center py-8">Nenhum custo de fornecedor lançado.</p>;
                }

                return (
                  <div className="space-y-2">
                    <p className="text-xxxs text-slate-400">Aqui estão compilados os valores pagos a cada faturador externo registrados nas OS arquivadas para conciliação bancária:</p>
                    <div className="divide-y divide-white/5">
                      {list.map(([supplier, details]) => (
                        <div key={supplier} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-200">{supplier}</span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{details.itemsCount} itens faturados</div>
                          </div>
                          <span className="font-mono font-bold text-red-400">{formatCurrency(details.totalCusto)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Net revenue profit breakdown of orders faturadas */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-orange-450 tracking-wider flex items-center gap-1 border-b border-white/5 pb-2">
                <Coins className="w-4 h-4 text-orange-400" />
                Desempenho por Modalidade de Pagamento
              </h3>

              {(() => {
                const results: Record<string, { faturadoBruto: number; deductions: number; count: number }> = {
                  "Dinheiro": { faturadoBruto: 0, deductions: 0, count: 0 },
                  "Pix": { faturadoBruto: 0, deductions: 0, count: 0 },
                  "Débito": { faturadoBruto: 0, deductions: 0, count: 0 },
                  "Crédito": { faturadoBruto: 0, deductions: 0, count: 0 },
                  "Crédito Parcelado": { faturadoBruto: 0, deductions: 0, count: 0 }
                };

                archivedOS.forEach(o => {
                  const adm = o.fechamentoAdm;
                  if (!adm) return;
                  const key = adm.formaPagamento;
                  if (results[key]) {
                    results[key].faturadoBruto += o.valorTotal;
                    results[key].deductions += (o.valorTotal * adm.taxaCartaoPercentual) / 100;
                    results[key].count += 1;
                  }
                });

                const activeGateways = Object.entries(results).filter(x => x[1].count > 0);

                if (activeGateways.length === 0) {
                  return <p className="text-xxs italic text-slate-500 text-center py-8">Nenhuma transação contabilizada.</p>;
                }

                return (
                  <div className="space-y-4">
                    <p className="text-xxxs text-slate-400">Dedução média por canais de pagamento utilizados:</p>
                    <div className="space-y-3">
                      {activeGateways.map(([method, stats]) => {
                        const netVal = stats.faturadoBruto - stats.deductions;
                        const pctPct = stats.faturadoBruto > 0 ? (stats.deductions / stats.faturadoBruto) * 100 : 0;
                        return (
                          <div key={method} className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span className="font-bold">{method} ({stats.count} OSs)</span>
                              <span className="font-mono text-slate-450">Bruto: {formatCurrency(stats.faturadoBruto)}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(netVal/stats.faturadoBruto)*100}%` }} title="Líquido faturado" />
                              <div className="bg-red-500 h-full" style={{ width: `${pctPct}%` }} title="Tarifas" />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Líquido: <strong className="text-emerald-400 font-black">{formatCurrency(netVal)}</strong></span>
                              <span>Taxas: <strong>-{formatCurrency(stats.deductions)} ({pctPct.toFixed(1)}%)</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
