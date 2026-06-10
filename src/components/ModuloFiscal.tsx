import React, { useState } from "react";
import { Cliente, Veiculo, OrdemServico, Peca, OficinaConfig } from "../types";
import { 
  FileText, 
  FileSpreadsheet, 
  Check, 
  ClipboardCopy, 
  Eye, 
  Printer, 
  AlertCircle, 
  FileCheck2, 
  Building, 
  User, 
  Coins, 
  Settings2, 
  Save, 
  BookmarkCheck, 
  Scale, 
  Percent, 
  CheckCircle2, 
  MapPin, 
  Tags 
} from "lucide-react";

interface ModuloFiscalProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  ordens: OrdemServico[];
  onUpdateOrdens: (newOrdens: OrdemServico[]) => void;
  config?: OficinaConfig;
  onUpdateConfig?: (updated: OficinaConfig) => void;
}

export default function ModuloFiscal({
  clientes,
  veiculos,
  pecas,
  ordens,
  onUpdateOrdens,
  config,
  onUpdateConfig,
}: ModuloFiscalProps) {
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [viewingDANFE, setViewingDANFE] = useState<OrdemServico | null>(null);
  const [viewingRPS, setViewingRPS] = useState<OrdemServico | null>(null);

  const [activeSubtab, setActiveSubtab] = useState<"faturamento" | "config-nfs">("faturamento");

  const [regime, setRegime] = useState(config?.regimeTributacao || "Simples Nacional");
  const [local, setLocal] = useState(config?.localPrestacao || "No município");
  const [modo, setModo] = useState(config?.modoPrestacao || "Tributação no município");
  const [codigoLC, setCodigoLC] = useState(config?.codigoServicoLC116 || "14.01 - Conserto, restauração, manutenção e conservação de máquinas, veículos, aparelhos");
  const [issPercent, setIssPercent] = useState(config?.aliquotaIss !== undefined ? config.aliquotaIss : 5.0);
  const [inscricaoMun, setInscricaoMun] = useState(config?.inscricaoMunicipal || "124.509/88");
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (config) {
      setRegime(config.regimeTributacao || "Simples Nacional");
      setLocal(config.localPrestacao || "No município");
      setModo(config.modoPrestacao || "Tributação no município");
      setCodigoLC(config.codigoServicoLC116 || "14.01 - Conserto, restauração, manutenção e conservação de máquinas, veículos, aparelhos");
      setIssPercent(config.aliquotaIss !== undefined ? config.aliquotaIss : 5.0);
      setInscricaoMun(config.inscricaoMunicipal || "124.509/88");
    }
  }, [config]);

  const handleSaveMunicipalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateConfig && config) {
      onUpdateConfig({
        ...config,
        regimeTributacao: regime,
        localPrestacao: local,
        modoPrestacao: modo,
        codigoServicoLC116: codigoLC,
        aliquotaIss: Number(issPercent),
        inscricaoMunicipal: inscricaoMun
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  // Filter completed OSs to manage invoices
  const completedOSList = ordens.filter(os => os.status === "Concluído");

  const getCliente = (id: string) => {
    return clientes.find(c => c.id === id);
  };

  const getVeiculo = (id: string) => {
    return veiculos.find(v => v.id === id);
  };

  const getPecaDetail = (id: string) => {
    return pecas.find(p => p.id === id);
  };

  const generateAccessKey = () => {
    // Generates a simulated 44-digit numeric access key
    let key = "352606"; // SP region, year 2026, month 06
    const randomDigits = "45089301000105550010000";
    key += randomDigits;
    for (let i = 0; i < 15; i++) {
      key += Math.floor(Math.random() * 10).toString();
    }
    return key;
  };

  const handleEmitNFe = (osId: string) => {
    // Emission of Products tax invoice (NF-e)
    const updated = ordens.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          nfeEmitida: true,
          nfeChave: generateAccessKey()
        };
      }
      return os;
    });
    onUpdateOrdens(updated);
  };

  const handleEmitNFSe = (osId: string) => {
    // Emission of Services tax invoice (NFS-e)
    const updated = ordens.map(os => {
      if (os.id === osId) {
        const randomReceipt = "2026" + Math.floor(100000 + Math.random() * 900000) + "A";
        return {
          ...os,
          nfseEmitida: true,
          nfseChave: randomReceipt
        };
      }
      return os;
    });
    onUpdateOrdens(updated);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* Intro Header */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Emissor Fiscal Integrado (NF-e &amp; NFS-e)</h2>
          <p className="text-xs text-slate-400">Controle o faturamento fiscal de peças (DANFE) e mão de obra (RPS) de ordens concluídas</p>
        </div>
        
        <span className="text-xxs font-bold text-slate-350 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full select-none">
          Ambiente: Homologação Autorizada
        </span>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex border-b border-white/10 gap-1 pb-px">
        <button
          onClick={() => setActiveSubtab("faturamento")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubtab === "faturamento"
              ? "text-orange-400 border-orange-500"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Faturamento de OS</span>
        </button>

        <button
          onClick={() => setActiveSubtab("config-nfs")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubtab === "config-nfs"
              ? "text-orange-400 border-orange-500"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Parâmetros de NFS-e (Municipal)</span>
        </button>
      </div>

      {activeSubtab === "faturamento" ? (
        /* Main Grid display */
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-300">
            <span className="font-bold text-white">Ordens de Serviço Prontas para Faturar ({completedOSList.length})</span>
            <span className="text-xxs text-slate-400">O faturamento de serviços pertence à prefeitura (NFS-e) e as peças ao estado (NF-e)</span>
          </div>

          <div className="divide-y divide-white/5">
          {completedOSList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhuma Ordem de Serviço concluída disponível para faturamento fiscal no momento.
            </div>
          ) : (
            completedOSList.map(os => {
              const client = getCliente(os.clienteId);
              const hasParts = os.pecasUtilizadas.length > 0;
              const partsTotalValue = os.pecasUtilizadas.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);

              return (
                <div key={os.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs hover:bg-white/1 transition">
                  {/* Left block Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xxs font-bold bg-slate-950 text-orange-400 border border-white/5 px-2 py-0.5 rounded tracking-wider uppercase">
                        OS #{os.id.toUpperCase().slice(-8)}
                      </span>
                      <span className="text-slate-400 font-medium font-mono text-[10px]">Concluido em: {os.dataConclusao || os.dataAbertura}</span>
                    </div>

                    <h4 className="font-extrabold text-white leading-snug text-sm">{client?.nome}</h4>
                    <p className="text-xxs text-slate-400 font-medium">{getVeiculo(os.veiculoId)?.marca} {getVeiculo(os.veiculoId)?.modelo} | KM {os.kmAtual.toLocaleString()}</p>
                    
                    <div className="flex items-center gap-3 text-[10.5px] text-slate-300 font-bold bg-slate-950/40 p-2.5 border border-white/5 rounded-xl w-fit font-mono mt-2.5">
                      <span>Mão de Obra: <span className="text-orange-405 text-orange-400">{formatCurrency(os.valorMaoDeObra)}</span></span>
                      <span className="text-slate-500 font-normal">|</span>
                      <span>Peças: <span className="text-orange-400">{formatCurrency(partsTotalValue)}</span></span>
                      <span className="text-slate-500 font-normal">|</span>
                      <span>Total Geral: <span className="text-orange-400">{formatCurrency(os.valorTotal)}</span></span>
                    </div>
                  </div>

                  {/* Actions right block */}
                  <div className="flex flex-col sm:flex-row gap-4 shrink-0 justify-end">
                    
                    {/* NF-e BLOCK (Products/Parts) */}
                    <div className="p-4 border border-white/10 rounded-2xl bg-white/1 space-y-3.5 shrink-0 flex flex-col justify-between w-[220px]">
                      <div>
                        <span className="font-bold text-white text-xxs uppercase tracking-wider block">Nota de Produtos (NF-e)</span>
                        <p className="text-xxs text-slate-400 mt-0.5">Faturamento das Peças</p>
                      </div>

                      {os.nfeEmitida ? (
                        <div className="space-y-2">
                          <span className="text-xxs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 justify-center">
                            <Check className="w-3.5 h-3.5" />
                            <span>NF-e Emitida</span>
                          </span>
                          <button
                            id={`view-danfe-${os.id}`}
                            onClick={() => setViewingDANFE(os)}
                            className="w-full bg-white/5 border border-orange-500/20 hover:bg-orange-500/10 text-orange-400 font-bold py-1.5 px-2.5 rounded-lg text-xxs flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar DANFE</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {!hasParts ? (
                            <span className="text-xxs text-slate-500 italic block text-center py-2.5 bg-white/5 border border-white/5 rounded-lg">Isento de peças</span>
                          ) : (
                            <button
                              id={`emit-nfe-${os.id}`}
                              onClick={() => handleEmitNFe(os.id)}
                              className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 rounded-lg text-xxs flex items-center justify-center gap-1 shadow-md cursor-pointer transition"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-900" />
                              <span>Emitir NF-e (DANFE)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* NFS-e BLOCK (Services/Labor) */}
                    <div className="p-4 border border-white/10 rounded-2xl bg-white/1 space-y-3.5 shrink-0 flex flex-col justify-between w-[220px]">
                      <div>
                        <span className="font-bold text-white text-xxs uppercase tracking-wider block">Nota de Serviços (NFS-e)</span>
                        <p className="text-xxs text-slate-400 mt-0.5">Faturamento da Mão de Obra</p>
                      </div>

                      {os.nfseEmitida ? (
                        <div className="space-y-2">
                          <span className="text-xxs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 justify-center">
                            <Check className="w-3.5 h-3.5" />
                            <span>NFS-e Emitida</span>
                          </span>
                          <button
                            id={`view-rps-${os.id}`}
                            onClick={() => setViewingRPS(os)}
                            className="w-full bg-white/5 border border-orange-500/20 hover:bg-orange-500/10 text-orange-400 font-bold py-1.5 px-2.5 rounded-lg text-xxs flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar RPS</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            id={`emit-nfse-${os.id}`}
                            onClick={() => handleEmitNFSe(os.id)}
                            className="w-full bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 rounded-lg text-xxs flex items-center justify-center gap-1 shadow-md cursor-pointer transition"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-900" />
                            <span>Emitir NFS-e (RPS)</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      ) : (
        /* Municipal NFS-e Parameters Form - Polished Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveMunicipalConfig} className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl space-y-5">
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Building className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Configurações Fiscais de Prestação Municipal</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Defina as regras tributárias para faturamento de mão de obra (NFS-e / RPS)</p>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xxs flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Configurações municipais e alíquotas atualizadas com sucesso!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Inscrição Municipal */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Tags className="w-3.5 h-3.5 text-slate-405 text-slate-400" />
                    <span>Inscrição Municipal (I.M.)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inscricaoMun}
                    onChange={(e) => setInscricaoMun(e.target.value)}
                    placeholder="Ex: 124.509/88"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                  />
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">Número do cadastro mobiliário frente à Prefeitura</p>
                </div>

                {/* Regime Tributario */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>Regime Especial de Tributação</span>
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold cursor-pointer"
                  >
                    <option value="Simples Nacional">Simples Nacional (Padrão)</option>
                    <option value="Microempreendedor Individual (MEI)">Microempreendedor Individual (MEI)</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="Sociedade de Profissionais (SUP)">Sociedade de Profissionais (SUP)</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">Define a forma de consolidação tributária</p>
                </div>

                {/* Local da prestacao */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Local da Prestação do Serviço</span>
                  </label>
                  <select
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold cursor-pointer"
                  >
                    <option value="No município">No município (Tomador e prestador no mesmo município)</option>
                    <option value="Fora do município">Fora do município (Tomador de outra cidade)</option>
                    <option value="No exterior">No exterior (Atendimento exportado)</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium text-slate-400">Local da execução física dos serviços</p>
                </div>

                {/* Modo de prestacao / Natureza operacao */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Modo de Prestação / Operação</span>
                  </label>
                  <select
                    value={modo}
                    onChange={(e) => setModo(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold cursor-pointer"
                  >
                    <option value="Tributação no município">Tributação no município (Incidência normal)</option>
                    <option value="Tributação fora do município">Tributação fora do município / Retenção</option>
                    <option value="Isenção municipal">Isenção municipal autorizada</option>
                    <option value="Imunidade fiscal">Imunidade tributária</option>
                    <option value="Exigibilidade suspensa">Exigibilidade suspensa (Liminar/Processo)</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium text-slate-400">Situação legal de exigibilidade de recolhimento do ISS</p>
                </div>

              </div>

              {/* LC 116/03 and ISS Aliquot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Item Lei Complementar 116/03
                  </label>
                  <select
                    value={codigoLC}
                    onChange={(e) => setCodigoLC(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold cursor-pointer"
                  >
                    <option value="14.01 - Conserto, restauração, manutenção e conservação de máquinas, veículos, aparelhos">
                      14.01 - Reparos, manutenção e conservação de veículos (Padrão)
                    </option>
                    <option value="14.02 - Assistência técnica e reparo mecânico de motores ou peças avulsas">
                      14.02 - Assistência técnica e reparação de motores / acessórios
                    </option>
                    <option value="14.14 - Funilaria, pintura e polimento estético de veículos automotores">
                      14.14 - Funilaria e pintura (Reparação estética)
                    </option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">Código federal que regula a incidência de serviços veiculares</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alíquota ISS (%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="2.00"
                    max="5.00"
                    required
                    value={issPercent}
                    onChange={(e) => setIssPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white font-semibold font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">Alíquota limite legal: 2,00% a 5,00%</p>
                </div>

              </div>

              {/* Botão de Salvar */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-550 text-white font-bold py-2 px-5 rounded-xl text-xxs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Salvar Parâmetros Fiscais</span>
                </button>
              </div>

            </div>
          </form>

          {/* Explanation Lateral Box */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl space-y-4">
              <span className="text-xxs font-bold text-orange-400 bg-orange-400/5 border border-orange-500/20 px-2.5 py-1 rounded-full uppercase">
                Educação Fiscal
              </span>
              <h4 className="text-xs font-bold text-white uppercase">Diferença: Produto vs Serviço</h4>
              
              <div className="space-y-3 text-xxs text-slate-300 leading-relaxed font-medium">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                    NF-e (Estadual / SEFAZ)
                  </span>
                  <p>Incidência do <strong>ICMS</strong> sobre a venda física de autopeças e fluidos aplicados. Representado pela DANFE.</p>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                    NFS-e (Municipal / Prefeitura)
                  </span>
                  <p>Incidência de <strong>ISSQN</strong> sobre a prestação de mão de obra de reparo automotivo (Código 14.01 LC 116). Representado pelo RPS.</p>
                </div>
              </div>

              <div className="p-4 bg-orange-950/20 border border-orange-500/10 rounded-xl text-[10px] text-orange-300 leading-relaxed space-y-1 font-medium">
                <p className="font-bold text-orange-400">⚠️ Legislação Municipal:</p>
                <p>O faturamento de serviços pertence à prefeitura do município da oficina. É obrigatório informar o Regime Tributário e o Enquadramento LC 116.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DANFE MODAL (NF-e) */}
      {viewingDANFE && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-gray-300 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            
            {/* Header controls */}
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <span className="font-bold text-xs text-orange-400">Visualizando DANFE Simulado</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-xxs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Nota</span>
                </button>
                <button
                  onClick={() => setViewingDANFE(null)}
                  className="px-3.5 py-2 bg-red-650 hover:bg-red-600 rounded-lg text-xxs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* DANFE LAYOUT (Pixel Perfect Brazilian Style) */}
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-100 flex justify-center">
              <div className="w-[800px] bg-white border-2 border-black p-4 text-[10px] font-sans leading-snug text-black space-y-3 h-fit">
                
                {/* Logo and Danfe identifier block */}
                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-4 border-r border-black p-2 flex items-center gap-2">
                    {config?.logoUrl && config?.showLogoInNF !== false ? (
                      <img 
                        src={config.logoUrl} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain bg-white border border-zinc-300 p-0.5 rounded shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h1 className="font-black text-xs text-zinc-950 uppercase truncate">{config?.nomeOficina || "KARTER'OS SAAS LTDA"}</h1>
                      <p className="text-[8px] leading-normal truncate">{config?.endereco || "Rua das Flores, 450 - Jardins, São Paulo - SP"}</p>
                      <p className="text-[8px] leading-normal">Telefone: {config?.telefone || "(11) 3300-8888"}</p>
                    </div>
                  </div>

                  <div className="col-span-4 border-r border-black p-2 text-center flex flex-col justify-center">
                    <h2 className="font-extrabold text-xs">DANFE</h2>
                    <p className="text-[8px]">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
                    <div className="mt-2 text-left pl-2">
                      <p>0 - ENTRADA</p>
                      <p className="font-black">1 - SAÍDA: 1</p>
                      <p>Nº: 000.045.210</p>
                      <p>SÉRIE: 001</p>
                    </div>
                  </div>

                  <div className="col-span-4 p-2 font-mono flex flex-col justify-center">
                    <span className="font-bold">CHAVE DE ACESSO NF-e</span>
                    <p className="text-[7.5px] tracking-tight text-slate-800 font-bold bg-slate-150 p-1 select-all break-all">{viewingDANFE.nfeChave}</p>
                    <span className="block text-[8px] mt-1">Consulta de autenticidade no portal nacional da NF-e</span>
                  </div>
                </div>

                {/* Sender identification */}
                <div className="border border-black">
                  <div className="bg-slate-200 font-bold px-2 py-0.5 border-b border-black">DADOS DO DESTINATÁRIO / INDICAÇÃO</div>
                  <div className="grid grid-cols-12 p-2 gap-y-1">
                    <div className="col-span-7">
                      <span className="text-[8px] text-gray-550 block">NOME / RAZÃO SOCIAL</span>
                      <span className="font-bold">{getCliente(viewingDANFE.clienteId)?.nome}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-[8px] text-gray-550 block">CNPJ / CPF</span>
                      <span className="font-bold">{getCliente(viewingDANFE.clienteId)?.cpfCnpj}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8px] text-gray-550 block">DATA EMISSÃO</span>
                      <span className="font-bold">01/06/2026</span>
                    </div>
                    <div className="col-span-10">
                      <span className="text-[8px] text-gray-550 block">ENDEREÇO</span>
                      <span className="font-bold">{getCliente(viewingDANFE.clienteId)?.endereco}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8px] text-gray-550 block">UF</span>
                      <span className="font-bold">SP</span>
                    </div>
                  </div>
                </div>

                {/* Calculations metrics values box */}
                <div className="border border-black">
                  <div className="bg-slate-200 font-bold px-2 py-0.5 border-b border-black">CÁLCULO DO IMPOSTO</div>
                  <div className="grid grid-cols-5 text-center divide-x divide-black">
                    <div className="p-1">
                      <span className="text-[8px] text-gray-550 block">BASE DE CÁLCULO ICMS</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[8px] text-gray-550 block">VALOR DO ICMS</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[8px] text-gray-550 block">BASE CÁLC ICMS S.T.</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[8px] text-gray-550 block">VALOR DO FRETE</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[8px] text-gray-550 block">VALOR TOTAL DOS SEGUROS</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                  </div>
                </div>

                {/* Products layout list */}
                <div className="border border-black overflow-hidden">
                  <div className="bg-slate-200 font-bold px-2 py-0.5 border-b border-black">DADOS DOS PRODUTOS / SERVIÇOS</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-left font-bold border-b border-black">
                        <th className="p-1 border-r border-black w-14">CÓDIGO</th>
                        <th className="p-1 border-r border-black">DESCRIÇÃO DOS PRODUTOS</th>
                        <th className="p-1 border-r border-black text-center w-10">QTD</th>
                        <th className="p-1 border-r border-black text-right w-16">UNITÁRIO</th>
                        <th className="p-1 text-right w-20">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {viewingDANFE.pecasUtilizadas.map((item, idx) => {
                        const original = getPecaDetail(item.pecaId);
                        return (
                          <tr key={idx} className="text-[8.5px]">
                            <td className="p-1 border-r border-black font-mono">{original?.sku || "SKU-DEV"}</td>
                            <td className="p-1 border-r border-black font-bold uppercase">{original?.descricao}</td>
                            <td className="p-1 border-r border-black text-center">{item.quantidade}</td>
                            <td className="p-1 border-r border-black text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                            <td className="p-1 text-right font-mono font-bold">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total box */}
                <div className="flex justify-end pt-2">
                  <div className="w-[200px] border border-black p-2 bg-slate-50 text-right">
                    <span className="text-[8px] block font-bold text-gray-700">VALOR TOTAL DOS PRODUTOS (PEÇAS)</span>
                    <span className="text-[12px] font-black font-mono">
                      {formatCurrency(viewingDANFE.valorTotal - viewingDANFE.valorMaoDeObra)}
                    </span>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="border border-black p-2 font-mono text-[7.5px] leading-relaxed text-gray-500">
                  <span className="font-bold text-black block">INFORMAÇÕES COMPLEMENTARES:</span>
                  <span>Documento simulado para conferência de DANFE. Operação: Venda de autopeças vinculada à OS de número #{viewingDANFE.id.toUpperCase()}. Tributação simplificada Simples Nacional. Reservado ao fisco: homologação AI Studio.</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* RPS MODAL (NFS-e) */}
      {viewingRPS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-gray-300 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            
            {/* Header controls */}
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <span className="font-bold text-xs text-orange-400">Visualizando Recibo RPS (NFS-e)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-xxs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir NFS-e</span>
                </button>
                <button
                  onClick={() => setViewingRPS(null)}
                  className="px-3.5 py-2 bg-red-650 hover:bg-red-650 rounded-lg text-xxs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* RPS LAYOUT (Brazilian City style) */}
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-100 flex justify-center">
              <div className="w-[800px] bg-white border border-zinc-400 p-6 text-[10px] font-sans leading-normal text-zinc-900 space-y-4 h-fit">
                
                {/* City Crest Layout */}
                <div className="flex justify-between items-center bg-zinc-50 p-3 border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-300 rounded flex items-center justify-center font-black text-xs">PREF</div>
                    <div>
                      <h2 className="font-black text-xs uppercase">Secretaria de Finanças da Prefeitura</h2>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Nota Fiscal Eletrônica de Serviços - NFS-e</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">Número da Nota: <span className="font-mono text-xs">{viewingRPS.nfseChave}</span></p>
                    <p>Emissão: <span className="font-bold">01/06/2026</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xxs font-sans">
                  {/* Prestador */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
                    <span className="text-[8px] text-zinc-500 font-bold block uppercase border-b border-zinc-200 pb-1 mb-1">PRESTADOR DO SERVIÇO</span>
                    <div className="flex items-center gap-2">
                      {config?.logoUrl && config?.showLogoInNF !== false ? (
                        <img 
                          src={config.logoUrl} 
                          alt="Logo" 
                          className="w-10 h-10 object-contain bg-white border border-zinc-350 p-0.5 rounded shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-xs text-zinc-950 uppercase truncate">{config?.nomeOficina || "KARTER'OS SAAS LTDA"}</h3>
                        <p>CNPJ / CPF: 45.089.301/0001-05</p>
                        <p>Inscrição Municipal (I.M.): <span className="font-bold text-zinc-800">{config?.inscricaoMunicipal || "124.509/88"}</span></p>
                        <p>Regime Fiscal: <span className="font-bold text-zinc-800">{config?.regimeTributacao || "Simples Nacional"}</span></p>
                        <p className="truncate">Telefone: {config?.telefone || "(11) 99999-7777"}</p>
                        <p className="truncate text-[8px] text-zinc-500 font-medium">Endereço: {config?.endereco || "Rua das Flores, 450 - Jardins, São Paulo - SP"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tomador */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
                    <span className="text-[8px] text-zinc-500 font-bold block uppercase border-b border-zinc-200 pb-1 mb-1">TOMADOR DO SERVIÇO</span>
                    <h3 className="font-black text-xs text-zinc-950">{getCliente(viewingRPS.clienteId)?.nome}</h3>
                    <p>CNPJ / CPF: {getCliente(viewingRPS.clienteId)?.cpfCnpj}</p>
                    <p className="truncate">E-mail: {getCliente(viewingRPS.clienteId)?.email}</p>
                    <p className="truncate">Endereço: {getCliente(viewingRPS.clienteId)?.endereco}</p>
                  </div>
                </div>

                {/* Service description workspace text */}
                <div className="p-4 border border-zinc-200 bg-white min-h-[150px] space-y-2">
                  <span className="text-[8px] text-zinc-500 font-bold block border-b border-zinc-200 pb-1">DISCRIMINAÇÃO DOS SERVIÇOS EXECUTADOS</span>
                  <div className="text-[10px] whitespace-pre-line leading-relaxed py-1">
                    {viewingRPS.servicosRealizados || viewingRPS.descricaoProblema}
                    {"\n\n- Serviços mecânicos especializados sob Ordem de Serviço de codificação única #" + viewingRPS.id.toUpperCase() + "\n- Atendimento efetuado na data corrente em conformidade com as diretivas fiscais NFS-e."}
                  </div>
                </div>

                {/* TAX metrics values layout */}
                <div className="border border-zinc-200 rounded overflow-hidden">
                  <div className="bg-zinc-100 font-bold border-b border-zinc-200 px-3 py-1 text-[8.5px] uppercase tracking-wider text-zinc-700">regulação e enquadramento de prestação municipal</div>
                  
                  <div className="grid grid-cols-3 divide-x divide-zinc-200 bg-zinc-50/50 border-b border-zinc-200 text-left text-[8px] p-2 leading-relaxed text-zinc-700">
                    <div className="pl-1">
                      <p><strong>Cidade de Prestação:</strong> {config?.localPrestacao || "No município"}</p>
                      <p><strong>Situação Exigibilidade:</strong> {config?.modoPrestacao || "Tributação no município"}</p>
                    </div>
                    <div className="pl-2">
                      <p><strong>Item LC 116/03:</strong> {config?.codigoServicoLC116?.split(" - ")[0] || "14.01"}</p>
                      <p className="truncate text-[7.5px] text-zinc-500 font-medium" title={config?.codigoServicoLC116 || "Reparos e Manutenção..."}>
                        {config?.codigoServicoLC116 || "14.01 - Conserto, restauração..."}
                      </p>
                    </div>
                    <div className="pl-2">
                      <p><strong>I.M. Emissor:</strong> {config?.inscricaoMunicipal || "124.509/88"}</p>
                      <p><strong>Regime Especial:</strong> {config?.regimeTributacao || "Simples Nacional"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 text-center divide-x divide-zinc-200 text-xxs font-bold">
                    <div className="p-2">
                      <span className="text-[8px] text-zinc-500 block">BASE DE CÁLCULO ISS</span>
                      <span className="text-zinc-900 font-bold">{formatCurrency(viewingRPS.valorMaoDeObra)}</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[8px] text-zinc-500 block">ALÍQUOTA ISS (%)</span>
                      <span className="text-zinc-900 font-mono">{(config?.aliquotaIss ?? 5.0).toFixed(2)}%</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[8px] text-zinc-500 block">VALOR IMPOSTO ISS</span>
                      <span className="text-zinc-900 font-mono">
                        {formatCurrency((viewingRPS.valorMaoDeObra * (config?.aliquotaIss ?? 5.0)) / 100)}
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-[8px] text-zinc-500 block">OUTRAS RETENÇÕES (PIS/COFINS)</span>
                      <span>R$ 0,00</span>
                    </div>
                  </div>
                </div>

                {/* Billing Summary Box */}
                <div className="flex justify-end">
                  <div className="w-[220px] bg-zinc-900 text-zinc-100 p-3.5 border border-zinc-950 text-right">
                    <span className="text-[8px] text-zinc-400 block font-bold">VALOR LÍQUIDO DA NFS-e</span>
                    <span className="text-[14px] font-black text-emerald-400 font-mono">
                      {formatCurrency(viewingRPS.valorMaoDeObra)}
                    </span>
                    <p className="text-[7.5px] text-zinc-500 font-medium mt-1 uppercase tracking-wide">ISSQN autolançado Simples Nacional</p>
                  </div>
                </div>

                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
