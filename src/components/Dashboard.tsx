import React from "react";
import { Cliente, Veiculo, Peca, OrdemServico, Mecanico } from "../types";
import { 
  Building2, 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Cake, 
  ChevronRight, 
  User, 
  Users,
  Car,
  DollarSign, 
  CheckCircle2, 
  MessageCircle,
  Clock,
  PackageCheck,
  PlusCircle,
  Coins,
  Search,
  Lock,
  ShieldCheck,
  Eye,
  KeyRound,
  UserCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  ordens: OrdemServico[];
  mecanicos: Mecanico[];
  onNavigate: (tab: string, arg?: any) => void;
  userRole?: "admin" | "mecanico" | "atendente" | "operator";
  allowedModules?: string[];
  userName?: string;
}

export default function Dashboard({ 
  clientes, 
  veiculos, 
  pecas, 
  ordens, 
  mecanicos, 
  onNavigate,
  userRole = "admin",
  allowedModules = [],
  userName = "Administrador"
}: DashboardProps) {
  
  // Detecção de cargo e ID do mecânico ativo
  const loggedInRole = localStorage.getItem("oficinapro_role") || sessionStorage.getItem("oficinapro_role") || userRole;
  const loggedInFuncionarioId = localStorage.getItem("oficinapro_funcionario_id") || sessionStorage.getItem("oficinapro_funcionario_id") || "mec_1";
  const loggedInOperatorId = localStorage.getItem("oficinapro_operator_id") || sessionStorage.getItem("oficinapro_operator_id") || "";

  // ----------------------------------------------------
  // ELEMENTO 1: PAINEL SEGURO DO MECÂNICO (ROLE === 'MECANICO')
  // ----------------------------------------------------
  if (loggedInRole === "mecanico") {
    // 1. Estados da busca rápida
    const [searchQuery, setSearchQuery] = React.useState("");
    const [matchedVehicle, setMatchedVehicle] = React.useState<Veiculo | null>(null);
    const [matchedCliente, setMatchedCliente] = React.useState<Cliente | null>(null);
    const [latestTechnicalOS, setLatestTechnicalOS] = React.useState<OrdemServico | null>(null);
    const [searchError, setSearchError] = React.useState("");

    // 2. Estados do espaço de produtividade técnica (Filtros: Period)
    const [periodFilter, setPeriodFilter] = React.useState<"hoje" | "semana" | "mes" | "ano">("mes");
    
    // 3. Estados da alteração de senha segura
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [pwdSuccess, setPwdSuccess] = React.useState("");
    const [pwdError, setPwdError] = React.useState("");

    // Execução da busca rápida segura
    const handleSecureSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setSearchError("");
      setMatchedVehicle(null);
      setMatchedCliente(null);
      setLatestTechnicalOS(null);

      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        setSearchError("Por favor, digite uma placa ou nome de cliente.");
        return;
      }

      // Procurar por Placa de veículo
      const foundVeiculo = veiculos.find(v => v.placa.toLowerCase().replace(/[^a-z0-9]/gi, "").includes(q.replace(/[^a-z0-9]/gi, "")));
      
      if (foundVeiculo) {
        setMatchedVehicle(foundVeiculo);
        const owner = clientes.find(c => c.id === foundVeiculo.clienteId);
        if (owner) setMatchedCliente(owner);

        // Achar última ordem de serviço técnica desse veículo
        const vehicleOSList = ordens
          .filter(os => os.veiculoId === foundVeiculo.id)
          .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura));

        if (vehicleOSList.length > 0) {
          setLatestTechnicalOS(vehicleOSList[0]);
        }
      } else {
        // Procurar por Cliente
        const foundCliente = clientes.find(c => c.nome.toLowerCase().includes(q));
        if (foundCliente) {
          setMatchedCliente(foundCliente);
          
          // Encontrar um veículo deste cliente
          const clientVeiculo = veiculos.find(v => v.clienteId === foundCliente.id);
          if (clientVeiculo) {
            setMatchedVehicle(clientVeiculo);
            
            const vehicleOSList = ordens
              .filter(os => os.veiculoId === clientVeiculo.id)
              .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura));

            if (vehicleOSList.length > 0) {
              setLatestTechnicalOS(vehicleOSList[0]);
            }
          }
        } else {
          setSearchError("Nenhum veículo ou cliente localizado com os termos informados.");
        }
      }
    };

    // Filtros de produtividade técnica (Serviços do próprio mecânico logado)
    const mecanicoOrdens = ordens.filter(os => os.mecanicoId === loggedInFuncionarioId);
    
    const filteredMecanicoOrdens = mecanicoOrdens.filter(os => {
      const osDate = new Date(os.dataAbertura);
      const today = new Date("2026-06-01"); // Data simulada do sistema
      
      if (periodFilter === "hoje") {
        return os.dataAbertura === "2026-06-01";
      } else if (periodFilter === "semana") {
        // Diferença de dias < 7 para simplificar
        const diffTime = Math.abs(today.getTime() - osDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (periodFilter === "mes") {
        return os.dataAbertura.startsWith("2026-06");
      } else {
        return os.dataAbertura.startsWith("2026");
      }
    });

    // Quantidade e status
    const completedCount = filteredMecanicoOrdens.filter(os => os.status === "Concluído").length;
    const pendingCount = filteredMecanicoOrdens.filter(os => os.status === "Em Andamento").length;
    const diagnosisCount = filteredMecanicoOrdens.filter(os => (os.status as string) === "Orçamento" || (os.status as string) === "Diagnóstico").length;

    // Lógica segura de mudança de senha própria (Login imutável)
    const handleUpdatePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setPwdError("");
      setPwdSuccess("");

      if (!newPassword || !confirmPassword) {
        setPwdError("Preencha todos os campos corretamente.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPwdError("A confirmação da nova senha está incorreta.");
        return;
      }

      try {
        const stored = localStorage.getItem("oficina_operadores");
        if (stored) {
          const ops = JSON.parse(stored);
          const opIdx = ops.findIndex((o: any) => o.id === loggedInOperatorId);
          if (opIdx !== -1) {
            ops[opIdx].senha = newPassword;
            localStorage.setItem("oficina_operadores", JSON.stringify(ops));
            setPwdSuccess("Sua senha de acesso técnico foi atualizada com brilho! Guarde as credenciais.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } else {
            setPwdError("ID de operador de sessão não localizado.");
          }
        }
      } catch (err) {
        setPwdError("Ocorreu um erro ao salvar nova senha no banco.");
      }
    };

    return (
      <div className="space-y-8 text-slate-200">
        
        {/* Banner Slim para o Mecânico */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-orange-950/20 rounded-2xl p-6 text-white border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-5 flex items-center justify-center pointer-events-none">
            <Wrench className="w-48 h-48 rotate-12 text-orange-400" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/15 text-orange-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-orange-500/10">
                Workspace Técnico Protegido • KARTER'OS v1.2.5
              </span>
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/10 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mascaramento de Dados Ativo
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Olá, Mec. {userName}
            </h2>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Sua conta está integrada com governança restrita de dados. Você pode monitorar sua produtividade pessoal e realizar buscas técnicas rápidas. Informações de lucro, comissão geral ou vendas estão seguras e omitidas da sua área de visualização.
            </p>
          </div>
        </div>

        {/* Grade Principal: Busca Rápida + Espaço de Produtividade */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BUSCA RÁPIDA SEGURA (8 Colunas) */}
          <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col space-y-5">
            <div className="space-y-1">
              <h3 className="font-bold text-sm uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Search className="w-4.5 h-4.5" />
                Busca Rápida Técnica e Segura
              </h3>
              <p className="text-xxs text-slate-400">
                Pesquise por placa do veículo ou nome do proprietário para visualizar o status do cliente e os dados do último diagnóstico.
              </p>
            </div>

            <form onSubmit={handleSecureSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquise placas (ex: ABC-1234) ou proprietários..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-md"
              >
                Buscar
              </button>
            </form>

            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/10 text-red-300 text-xxs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Resultado da busca */}
            <AnimatePresence mode="wait">
              {matchedCliente && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">Proprietário</span>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                        {matchedCliente.nome}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          matchedCliente.status === "Ativo" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-550/10" : "bg-red-500/10 text-red-400 border border-red-550/10"
                        }`}>
                          {matchedCliente.status === "Ativo" ? "Cliente Ativo" : "Inativo"}
                        </span>
                      </h4>
                    </div>

                    {matchedVehicle && (
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">Veículo Identificado</span>
                        <h4 className="text-xs font-mono font-bold text-orange-400 mt-0.5">
                          {matchedVehicle.marca} {matchedVehicle.modelo} ({matchedVehicle.anoFabricacao}/{matchedVehicle.anoModelo})
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Placa: {matchedVehicle.placa} • Km atual: {matchedVehicle.quilometragem?.toLocaleString() || "Não informado"} km
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Informações Técnicas do Último Serviço do Veículo */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                      📋 Diagnóstico Técnico do Último Serviço Concluído
                    </h5>

                    {latestTechnicalOS ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Número da OS</span>
                            <span className="font-black text-white font-mono">{latestTechnicalOS.numeroOs}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Data do Diagnóstico</span>
                            <span className="font-semibold text-slate-200">{latestTechnicalOS.dataAbertura}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Quilometragem Entrada</span>
                            <span className="font-semibold text-slate-200 font-mono">{(latestTechnicalOS.quilometragem || 0).toLocaleString()} km</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Descrição dos Serviços Executados</span>
                            <p className="text-slate-200 text-xxs font-normal leading-relaxed whitespace-pre-line italic">
                              "{latestTechnicalOS.observacoesSintomas || "Sem observações técnicas preenchidas."}"
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Mecânico Codificador</span>
                            <span className="font-semibold text-orange-400 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              {mecanicos.find(m => m.id === latestTechnicalOS.mecanicoId)?.nome || "Mecânico Geral"}
                            </span>
                          </div>
                        </div>

                        {/* MASCARAMENTO FINANCEIRO EXPLICITO (SUBSTITUÇÃO) */}
                        <div className="md:col-span-2 mt-2 pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-red-950/10 p-3 rounded-lg border border-red-500/10">
                          <div>
                            <span className="text-[10px] text-red-300 font-bold block uppercase tracking-wider">🔒 Financeiro e Custos Unitários</span>
                            <p className="text-[10px] text-slate-400">
                              Valores de mão de obra, preços de compra/venda de peças e faturamento final da ordem estão protegidos da sua conta.
                            </p>
                          </div>
                          <div className="shrink-0 bg-red-600/10 border border-red-500/20 text-red-400 font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xxs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Acesso Restrito</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 border border-white/5 text-slate-450 rounded-xl text-center text-xs">
                        Nenhum histórico de serviço anterior localizado para este veículo.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!matchedCliente && !searchError && (
              <div className="flex-1 border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2.5">
                <Search className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs text-slate-400">Aguardando busca para exibir informações de relance.</p>
              </div>
            )}
          </div>

          {/* ESPAÇO DE PRODUTIVIDADE DO MECÂNICO (4 Colunas) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* PERFORMANCE / METRICAS DO MECÂNICO */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-350 flex items-center gap-1.5 text-white">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Sua Produtividade
                  </h3>
                  <p className="text-xxs text-slate-400">Acompanhamento de serviços executados</p>
                </div>
              </div>

              {/* Botões do período */}
              <div className="grid grid-cols-4 gap-1 bg-black/30 p-1 rounded-lg text-[10px]">
                {(["hoje", "semana", "mes", "ano"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodFilter(p)}
                    className={`py-1 rounded font-bold uppercase transition ${
                      periodFilter === p ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {p === "mes" ? "Mês" : p === "ano" ? "Ano" : p === "semana" ? "Sem." : "Hoje"}
                  </button>
                ))}
              </div>

              {/* Métricas sem expor faturamento */}
              <div className="space-y-2 pt-2">
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Serviços Concluídos</span>
                    <span className="text-xs font-bold text-white">Sucesso Técnico</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 font-mono">{completedCount}</span>
                </div>

                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Em Execução Ativa</span>
                    <span className="text-xs font-bold text-white">Carros na Rampa</span>
                  </div>
                  <span className="text-2xl font-black text-orange-400 font-mono">{pendingCount}</span>
                </div>

                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Orçamentos Pendentes</span>
                    <span className="text-xs font-bold text-white">Aguardando Peças</span>
                  </div>
                  <span className="text-2xl font-black text-amber-400 font-mono">{diagnosisCount}</span>
                </div>
              </div>

              <div className="text-[9.5px] leading-relaxed bg-slate-950/25 p-2.5 rounded-md text-slate-400 border border-white/5 font-medium">
                💡 O volume das suas comissões técnicas mensais é creditado automaticamente pelo faturamento administrativo do KARTER'OS ao término de cada serviço.
              </div>
            </div>

            {/* FORMULÁRIO DE ALTERAÇÃO DE SENHA DO MECÂNICO (LOGIN IMUTÁVEL) */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-orange-400" />
                  Segurança • Alterar Senha
                </h3>
                <p className="text-xxs text-slate-400">Usuário imutável por questões de log e segurança.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                {pwdError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/15 text-red-300 text-xxs rounded-xl leading-snug">
                    {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-xxs rounded-xl leading-snug">
                    {pwdSuccess}
                  </div>
                )}

                <div>
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                    Nome de Usuário (Inalterável)
                  </span>
                  <input
                    type="text"
                    disabled
                    value={localStorage.getItem("oficinapro_user_name") || userName}
                    className="w-full px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-lg text-xxs text-slate-400 cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Definir Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Digite nova senha"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xxs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirme nova senha"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xxs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xxs font-extrabold py-2 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Salvar Nova Senha</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // Real-time calculation of metrics
  const todayStr = "2026-06-01"; // current local time is June 01, 2026
  const currentMonthStr = "2026-06"; // format YYYY-MM

  // 1. Serviços do dia (OS abertas ou concluídas hoje)
  const servicosHoje = ordens.filter(os => os.dataAbertura === todayStr);

  // 2. Faturamento mensal (Soma do valor total das OS concluídas no mês atual - Junho de 2026)
  const faturamentoMensal = ordens
    .filter(os => os.status === "Concluído" && os.dataConclusao?.startsWith(currentMonthStr))
    .reduce((sum, os) => sum + os.valorTotal, 0);

  // 3. Veículos em andamento (status = Em Andamento)
  const veiculosAndamento = ordens.filter(os => os.status === "Em Andamento");

  // 4. Alertas críticos de estoque baixo (< 5 unidades)
  const pecasCriticas = pecas.filter(p => p.estoque < 5);

  // 5. Aniversariantes do mês atual (mês 06 - Junho)
  const aniversariantesMes = clientes.filter(c => {
    if (!c.dataNascimento) return false;
    const parts = c.dataNascimento.split("-");
    const mes = parts[1]; // YYYY-MM-DD
    return mes === "06"; // Mês de Junho!
  });

  // Recent orders to show on dashboard list
  const ordensRecentes = [...ordens]
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))
    .slice(0, 4);

  const getClienteNome = (id: string) => {
    return clientes.find(c => c.id === id)?.nome || "Não identificado";
  };

  const getVeiculoFmt = (id: string) => {
    const v = veiculos.find(vei => vei.id === id);
    return v ? `${v.marca} ${v.modelo} [${v.placa}]` : "Não identificado";
  };

  const getMecanicoNome = (id: string) => {
    return mecanicos.find(m => m.id === id)?.nome || "Sem atribuição";
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // WhatsApp helper
  const handleWhatsAppMessage = (telefone: string, nome: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    const message = `Olá ${nome}! Nós da equipe Karter'OS desejamos a você um excelente aniversário e preparamos um cupom especial de 10% de desconto na sua próxima revisão. Parabéns pelo seu dia! 🎂🚗`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // RBAC permissions helper
  const isModuleAllowed = (modId: string) => {
    if (userRole === "admin") return true;
    return allowedModules ? allowedModules.includes(modId) : false;
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900/85 via-orange-950/20 to-slate-900/85 rounded-2xl p-6 text-white border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 flex items-center justify-center pointer-events-none">
          <Wrench className="w-56 h-56 rotate-45 transform translate-x-12 translate-y-12 text-orange-400 animate-pulse" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-orange-500/10 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-500/20">
              Painel Geral • Karter'OS CRM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Olá, {userName}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Bem-vindo de volta! Controle sua oficina com alta performance. Hoje é <span className="font-semibold text-white">01 de Junho de 2026</span>. Há novidades no CRM e estoque esperando sua conferência.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Passo 1 - Abrir Novo Orçamento (Apenas se permitido) */}
            {isModuleAllowed("orcamentos") && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <button
                  onClick={() => onNavigate("orcamentos", "new")}
                  className="relative w-full px-6 py-3.5 font-extrabold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-350 hover:to-amber-450 active:scale-95 rounded-xl flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
                >
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 bg-red-650 bg-red-650 bg-red-600 border border-white/20 text-white text-[8px] tracking-wider rounded font-black uppercase whitespace-nowrap shadow-md">
                    1º Passo • Recomendado
                  </div>
                  <Coins className="w-4.5 h-4.5 animate-spin-slow" />
                  <span>ABRIR NOVO ORÇAMENTO</span>
                </button>
              </div>
            )}

            {/* Abrir Nova OS (Apenas se permitido) */}
            {isModuleAllowed("ordens") && (
              <button
                onClick={() => onNavigate("ordens", { id: "new_os_trigger" })}
                className="px-5 py-3.5 font-extrabold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl flex items-center justify-center gap-2 transition duration-150 cursor-pointer border border-white/10 hover:border-white/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ABRIR OS DIRETA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Numerical Metrics Grid (Transformados em Cards Totalmente Interativos e Clicáveis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metrica 1 - Serviços Hoje (Redireciona para Ordem de Serviço se permitido) */}
        {isModuleAllowed("ordens") ? (
          <button
            onClick={() => onNavigate("ordens", "hoje")}
            title="Clique para ir para Ordens de Serviço"
            className="group text-left bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-orange-950/10 hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/30 hover:bg-white/10 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-400 uppercase tracking-widest block transition-colors">Serviços Hoje</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">{servicosHoje.length}</span>
              <div className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                <span>{ordens.filter(os => os.dataAbertura === "2026-06-01").length} aberturas</span>
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">• Acessar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-orange-500/40 group-hover:bg-orange-500/10 flex items-center justify-center text-orange-400 transition-all">
              <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        ) : null}

        {/* Metrica 2 - Receita Mensal Junho (Redireciona para Fechamento se permitido) */}
        {isModuleAllowed("fechamento") ? (
          <button
            onClick={() => onNavigate("fechamento")}
            title="Clique para ir para o Fechamento Administrativo"
            className="group text-left bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-emerald-950/10 hover:scale-[1.02] hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/10 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-400 uppercase tracking-widest block transition-colors">Receita Junho/2026</span>
              <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(faturamentoMensal)}</span>
              <div className="text-xs text-emerald-450 text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Oficina Ativa • Detalhar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-all">
              <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        ) : null}

        {/* Metrica 3 - Em Andamento (Redireciona para Ordens se permitido) */}
        {isModuleAllowed("ordens") ? (
          <button
            onClick={() => onNavigate("ordens", "andamento")}
            title="Clique para ver serviços Em Andamento"
            className="group text-left bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-amber-950/10 hover:scale-[1.02] hover:-translate-y-1 hover:border-amber-500/30 hover:bg-white/10 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-400 uppercase tracking-widest block transition-colors">Em Andamento</span>
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{veiculosAndamento.length}</span>
              <div className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Na oficina agora • Ver</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-400 transition-all">
              <Clock className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        ) : null}

        {/* Metrica 4 - Alerta Estoque Crítico (Redireciona para Estoque de Peças se permitido) */}
        {isModuleAllowed("estoque") ? (
          <button
            onClick={() => onNavigate("estoque", "critico")}
            title="Clique para reabastecer estoque de peças"
            className={`group text-left backdrop-blur-xl border rounded-2xl p-5 shadow-lg hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer ${
              pecasCriticas.length > 0 ? "bg-red-500/10 border-red-500/20 text-white hover:border-red-500/40 hover:bg-red-500/20 shadow-red-950/10" : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-red-400 uppercase tracking-widest block transition-colors font-sans">Estoque Crítico</span>
              <span className="text-3xl font-extrabold text-red-400 tracking-tight">{pecasCriticas.length}</span>
              <div className="text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>menos de 5 un. • Ajustar</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
              pecasCriticas.length > 0 ? "bg-red-500/25 border-red-500/30 text-red-400 group-hover:scale-115" : "bg-white/5 border-white/10 text-slate-400 group-hover:scale-110"
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </button>
        ) : null}

        {/* Card Adicional 1 - CRM Clientes (Sempre visível para operador restrito, redireciona para Clientes) */}
        {isModuleAllowed("clientes") && (
          <button
            onClick={() => onNavigate("clientes")}
            title="Clique para ir para Clientes & CRM"
            className="group text-left bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-orange-950/10 hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/30 hover:bg-white/10 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-400 uppercase tracking-widest block transition-colors">Clientes & CRM</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">{clientes.length}</span>
              <div className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                <span>Gerenciar carteira • Acessar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-orange-500/40 group-hover:bg-orange-500/10 flex items-center justify-center text-orange-400 transition-all">
              <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        )}

        {/* Card Adicional 2 - Frota Veículos (Sempre visível para operador restrito, redireciona para Veículos) */}
        {isModuleAllowed("veiculos") && (
          <button
            onClick={() => onNavigate("veiculos")}
            title="Clique para ir para Frota de Veículos"
            className="group text-left bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg hover:shadow-orange-950/10 hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-500/30 hover:bg-white/10 active:scale-[0.99] transition-all duration-300 flex items-center justify-between w-full pointer-events-auto cursor-pointer"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-400 uppercase tracking-widest block transition-colors">Frota Veículos</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">{veiculos.length}</span>
              <div className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                <span>Controle Detran • Acessar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-orange-500/40 group-hover:bg-orange-500/10 flex items-center justify-center text-orange-400 transition-all">
              <Car className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col left (8/12) - Recent Service Orders & Low Inventory Alert */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active OS Panel (Exibido apenas se permitido) */}
          {isModuleAllowed("ordens") && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="font-bold text-white text-base">Atividades Recentes e Ordens</h3>
                  <p className="text-xs text-slate-400">Últimos diagnósticos e serviços criados</p>
                </div>
                <button 
                  onClick={() => onNavigate("ordens")}
                  className="text-orange-400 text-xs font-semibold hover:underline flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-md cursor-pointer"
                >
                  <span>Ver todas as OS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="divide-y divide-white/5">
                {ordensRecentes.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Nenhuma ordem de serviço cadastrada no momento.
                  </div>
                ) : (
                  ordensRecentes.map(os => (
                    <div key={os.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-white/10 text-orange-400 px-1.5 py-0.5 border border-white/5 rounded">
                            #{os.id.toUpperCase()}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            os.status === "Concluído" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            os.status === "Cancelado" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {os.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{os.dataAbertura}</span>
                        </div>
                        
                        <h4 className="font-bold text-white text-sm">
                          {getClienteNome(os.clienteId)}
                        </h4>
                        <p className="text-xs text-slate-350 italic max-w-md">
                          {getVeiculoFmt(os.veiculoId)} — Preocupação: "{os.descricaoProblema}"
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between font-sans shrink-0">
                        <span className="text-xs text-slate-400">Total Previsto:</span>
                        <span className="font-bold text-white text-sm">{formatCurrency(os.valorTotal)}</span>
                        <button 
                          onClick={() => onNavigate("ordens", os)}
                          className="text-xs text-orange-400 font-semibold hover:underline mt-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg"
                        >
                          Abrir Perfil OS
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Critical Inventory Stock warnings (Exibido apenas se permitido) */}
          {isModuleAllowed("estoque") && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
              <div className="p-5 border-b border-white/10 bg-red-500/5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Alerta de Reposição - Peças Críticas</h3>
                  <p className="text-xs text-slate-400">Abasteça estas peças para não parar os elevadores</p>
                </div>
              </div>

              <div className="p-5 divide-y divide-white/5">
                {pecasCriticas.length === 0 ? (
                  <div className="p-4 text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2">
                    <PackageCheck className="w-5 h-5" />
                    <span className="text-sm font-medium">Excelente! Todas as peças possuem bom nível de estoque.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pecasCriticas.map(p => (
                        <div key={p.id} className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-xs">{p.descricao}</h4>
                            <p className="text-xxs text-slate-400 font-mono mt-0.5">SKU: {p.sku} | Fab: {p.fabricante}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-xxs text-slate-400">Preço Venda:</span>
                              <span className="text-xs font-bold text-orange-400">{formatCurrency(p.precoVenda)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xxs font-bold uppercase text-red-400 tracking-wider">Estoque Baixo</span>
                            <p className="text-lg font-black text-red-400 tracking-tight mt-0.5">{p.estoque} <span className="text-xxs font-normal">un</span></p>
                            <button
                              onClick={() => onNavigate("estoque", p)}
                              className="bg-white/5 border border-red-550/30 hover:bg-white/10 text-red-400 font-semibold text-xxs px-2.5 py-1.5 rounded-lg shadow-sm mt-1 cursor-pointer"
                            >
                              Reabastecer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Col right (4/12) - CRM Birthday campaigns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Birthdays this month card (Semelhante a CRM - Sempre visível se permitido Clientes) */}
          {isModuleAllowed("clientes") && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Fidelização: Aniversariantes</h3>
                  <p className="text-xxs text-slate-400 font-medium">Mês de Junho • Ação Proativa CRM</p>
                </div>
              </div>

              <div className="p-5">
                {aniversariantesMes.length === 0 ? (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-xs text-slate-450">
                    Nenhum cliente faz aniversário este mês.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Estes clientes celebram aniversário em <span className="font-bold text-orange-400">Junho</span>. Fortaleça o relacionamento enviando uma mensagem rápida de felicitações e um desconto especial!
                    </p>
                    
                    <div className="space-y-2.5">
                      {aniversariantesMes.map(c => (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-3.5 rounded-xl shadow-lg hover:bg-white/10 transition duration-150">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {c.nome}
                              </h4>
                              <p className="text-xxs text-orange-400 font-bold mt-1.5 flex items-center gap-1">
                                <Cake className="w-3 h-3" />
                                Nasc: {c.dataNascimento} (Aniversário!)
                              </p>
                              <p className="text-xxs text-slate-400 font-mono mt-0.5">{c.telefone}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-end">
                            <button
                              id={`crm-wa-${c.id}`}
                              onClick={() => handleWhatsAppMessage(c.telefone, c.nome)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xxs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Parabenizar no WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Manual Info card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-5">
              <PackageCheck className="w-24 h-24 text-orange-400" />
            </div>
            
            <h4 className="font-extrabold text-white text-xs uppercase tracking-widest mb-2.5">Instruções de Suporte (SaaS)</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                1. Utilize a <span className="text-white font-bold text-orange-400">Busca Inteligente</span> no topo para pesquisar clientes por nome, CPF ou placa de relance.
              </p>
              {isModuleAllowed("ordens") && (
                <p>
                  2. Na seção de <span className="text-white font-bold text-orange-450 text-orange-400">Ordens de Serviço</span>, ao apontar a placa do veículo, veja o diagnóstico histórico.
                </p>
              )}
              {isModuleAllowed("mecanicos") && (
                <p>
                  3. A comissão de cada técnico é calculada de acordo com seu parâmetro próprio e as ordens efetivamente <span className="text-emerald-400 font-semibold">Concluídas</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
