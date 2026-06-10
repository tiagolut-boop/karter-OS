import React, { useState } from "react";
import { Mecanico, OrdemServico } from "../types";
import { UserCheck, ShieldCheck, DollarSign, Calendar, TrendingUp, Sparkles, User, Settings, Filter } from "lucide-react";

interface MecanicosComissoesProps {
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
  onUpdateMecanicos: (newMecanicos: Mecanico[]) => void;
}

type PeriodoFiltro = "dia" | "semana" | "mes" | "ano";

export default function MecanicosComissoes({
  mecanicos,
  ordens,
  onUpdateMecanicos
}: MecanicosComissoesProps) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("mes");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [comissaoPercentual, setComissaoPercentual] = useState("");
  const [formError, setFormError] = useState("");

  const todayStr = "2026-06-01"; // current date June 01, 2026

  // Check if a completed order date falls into the period
  const isOrderInPeriod = (orderDateStr?: string) => {
    if (!orderDateStr) return false;
    
    // Parse order date
    const orderDate = new Date(orderDateStr);
    const today = new Date(todayStr);

    if (periodo === "dia") {
      return orderDateStr === todayStr;
    }

    if (periodo === "mes") {
      // Current Month June 2026
      return orderDateStr.startsWith("2026-06");
    }

    if (periodo === "ano") {
      // Year 2026
      return orderDateStr.startsWith("2026");
    }

    if (periodo === "semana") {
      // Past 7 days (including today)
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    return false;
  };

  const calculateMecanicoPerformance = (mecId: string) => {
    // Only completed orders bring commission
    const completedOrders = ordens.filter(os => 
      os.status === "Concluído" && 
      os.mecanicoId === mecId && 
      isOrderInPeriod(os.dataConclusao)
    );

    const faturamentoServico = completedOrders.reduce((sum, os) => sum + os.valorMaoDeObra, 0);
    const faturamentoPecas = completedOrders.reduce((sum, os) => {
      return sum + os.pecasUtilizadas.reduce((pSum, p) => pSum + (p.quantidade * p.precoUnitario), 0);
    }, 0);

    const totalOSServicosInjetados = faturamentoServico + faturamentoPecas;

    const mec = mecanicos.find(m => m.id === mecId);
    let valorComissao = 0;
    if (mec) {
      // Commission is over the labor/services made according to the spec: "porcentagem de comissão (%) sobre os serviços realizados"
      valorComissao = (faturamentoServico * mec.comissaoPercentual) / 100;
    }

    return {
      quantidadeServicos: completedOrders.length,
      faturamentoServico,
      totalOSServicosInjetados,
      valorComissao
    };
  };

  const handleCreateMecanico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !especialidade.trim() || !comissaoPercentual) {
      setFormError("Por favor, preencha todos os campos cadastrais!");
      return;
    }

    const percent = Number(comissaoPercentual);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      setFormError("A porcentagem de comissão precisa ser um número entre 0% e 100%!");
      return;
    }

    const newM: Mecanico = {
      id: "mec_" + Date.now(),
      nome,
      especialidade,
      comissaoPercentual: percent,
    };

    onUpdateMecanicos([...mecanicos, newM]);

    // reset states
    setNome("");
    setEspecialidade("");
    setComissaoPercentual("");
    setFormError("");
    setShowAddForm(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 font-sans text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white">Especialistas Mecânicos & Demonstrativo de Comissões</h2>
          <p className="text-xs text-slate-400">Mapeamento de técnicos e faturamentos sob o modelo de remuneração variável</p>
        </div>

        <button
          id="toggle-add-mecanico-btn"
          onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}
          className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-lg"
        >
          <UserCheck className="w-4 h-4 text-slate-900" />
          <span>Cadastrar Técnico</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Form */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl space-y-4 h-fit">
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Novo Perfil Mecânico</h3>
              <p className="text-xxs text-slate-450">Configure o percentual de comissões individual para remuneração</p>
            </div>

            {formError && (
              <p className="p-2 bg-red-500/10 text-red-300 text-xxs border border-red-500/20 rounded">{formError}</p>
            )}

            <form onSubmit={handleCreateMecanico} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Nome Completo *</label>
                <input
                  id="mec-nome-inp"
                  type="text"
                  required
                  placeholder="Ex: Pedro de Carvalho"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-900/50 text-white"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Especialidade / Competência *</label>
                <input
                  id="mec-espe-inp"
                  type="text"
                  required
                  placeholder="Ex: Motores 16v e Transmissões"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-900/50 text-white"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Alíquota Comissão (%) *</label>
                <input
                  id="mec-percent-inp"
                  type="number"
                  required
                  placeholder="Ex: 12"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-900/50 text-white font-mono font-bold"
                  value={comissaoPercentual}
                  onChange={(e) => setComissaoPercentual(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 text-xxs pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold hover:bg-white/10 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-mec-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-550 text-white font-bold transition cursor-pointer animate-glow"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Financial reports for mechanicians */}
        <div className={showAddForm ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
          
          {/* Period filters bar */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white text-sm">Filtro de Período Financeiro:</span>
            </div>

            <div className="inline-flex rounded-xl border border-white/10 p-1 bg-slate-950/40 text-xs shrink-0 font-sans">
              <button
                id="filter-day-btn"
                onClick={() => setPeriodo("dia")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  periodo === "dia" ? "bg-white/10 border border-white/10 text-orange-400 shadow-lg" : "text-slate-400 hover:text-orange-400"
                }`}
              >
                Hoje (01 de Junho)
              </button>
              <button
                id="filter-week-btn"
                onClick={() => setPeriodo("semana")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  periodo === "semana" ? "bg-white/10 border border-white/10 text-orange-400 shadow-lg" : "text-slate-400 hover:text-orange-400"
                }`}
              >
                Esta Semana
              </button>
              <button
                id="filter-month-btn"
                onClick={() => setPeriodo("mes")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  periodo === "mes" ? "bg-white/10 border border-white/10 text-orange-400 shadow-lg" : "text-slate-400 hover:text-orange-400"
                }`}
              >
                Mês de Junho
              </button>
              <button
                id="filter-year-btn"
                onClick={() => setPeriodo("ano")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  periodo === "ano" ? "bg-white/10 border border-white/10 text-orange-400 shadow-lg" : "text-slate-400 hover:text-orange-400"
                }`}
              >
                Ano de 2026
              </button>
            </div>
          </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mecanicos.map(m => {
              const performance = calculateMecanicoPerformance(m.id);
              return (
                <div key={m.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:border-orange-500/20 transition space-y-4 font-sans text-slate-100">
                  
                  {/* Title Info */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-400" />
                        {m.nome}
                      </h4>
                      <p className="text-xxs text-slate-400 font-semibold uppercase">{m.especialidade}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xxs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-mono">
                        {m.comissaoPercentual}% Comissão
                      </span>
                    </div>
                  </div>

                  {/* Period Stats Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-white/5 border border-white/5 rounded-xl text-center">
                    <div>
                      <span className="text-xxs text-slate-400 block font-medium">Ordem Concluídas</span>
                      <span className="text-lg font-black text-white tracking-tight">{performance.quantidadeServicos}</span>
                    </div>
                    <div>
                      <span className="text-xxs text-slate-400 block font-medium">Mão de Obra</span>
                      <span className="text-xs font-bold text-slate-205 block mt-1">{formatCurrency(performance.faturamentoServico)}</span>
                    </div>
                    <div>
                      <span className="text-xxs text-slate-400 block font-semibold text-orange-300">Comissão Devida</span>
                      <span className="text-xs font-black text-emerald-400 block mt-1">{formatCurrency(performance.valorComissao)}</span>
                    </div>
                  </div>

                  {/* Supporting breakdown message */}
                  <p className="text-xxs text-slate-450 leading-normal italic">
                    * Comissão calculada exclusivamente sobre o valor de mão de obra direta do mecânico ({formatCurrency(performance.faturamentoServico)}) para serviços concluídos no período selecionado.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
