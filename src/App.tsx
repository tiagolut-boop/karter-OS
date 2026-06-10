import React, { useState, useEffect } from "react";
import { getStoredData, saveStoredData } from "./dataStore";
import { Cliente, Veiculo, Peca, Mecanico, OrdemServico, Orcamento, Operador, OficinaConfig } from "./types";
import LoginScreen from "./components/LoginScreen";
import GlobalHeader from "./components/GlobalHeader";
import Dashboard from "./components/Dashboard";
import ClientesCRM from "./components/ClientesCRM";
import VeiculosDetran from "./components/VeiculosDetran";
import EstoquePecas from "./components/EstoquePecas";
import MecanicosComissoes from "./components/MecanicosComissoes";
import OrdensServico from "./components/OrdensServico";
import ModuloFiscal from "./components/ModuloFiscal";
import OrcamentosComponent from "./components/Orcamentos";
import FechamentoAdministrativo from "./components/FechamentoAdministrativo";
import ConfiguracoesSistema from "./components/ConfiguracoesSistema";
import PDV from "./components/PDV";
import { 
  Building2, 
  TrendingUp, 
  Wrench, 
  Users, 
  Car, 
  Package, 
  DollarSign, 
  FileSpreadsheet, 
  LayoutDashboard,
  Menu,
  X,
  Coins,
  ShieldCheck,
  Settings,
  ShoppingCart,
  Camera,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path === "/ordens-servico") return "ordens";
    if (path === "/estoque") return "estoque";
    const matchedTab = path.slice(1);
    const validTabs = ["pdv", "clientes", "veiculos", "orcamentos", "mecanicos", "fiscal", "fechamento", "configuracoes"];
    if (matchedTab && validTabs.includes(matchedTab)) {
      return matchedTab;
    }
    return "dashboard";
  });
  const [urlFilter, setUrlFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("filter") || params.get("filtro") || "";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Core global React states
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [config, setConfig] = useState<OficinaConfig>({
    nomeOficina: "Oficina Mecânica Karter'OS",
    telefone: "(11) 99999-7777",
    endereco: "Av. do Estado, 5000 - Centro, São Paulo - SP",
    requireEvidenceToClose: false,
    standardDiscountLimitPercent: 15,
    logoUrl: "",
    showLogoInNF: true,
    showLogoInOrcamento: true,
    showLogoInOS: true,
    adminProfilePicUrl: "",
    inscricaoMunicipal: "124.509/88",
    regimeTributacao: "Simples Nacional",
    localPrestacao: "No município",
    modoPrestacao: "Tributação no município",
    codigoServicoLC116: "14.01 - Conserto, restauração, manutenção e conservação de máquinas, veículos, aparelhos",
    aliquotaIss: 5.0
  });

  // Logged-in user profiles
  const [userRole, setUserRole] = useState<"admin" | "mecanico" | "atendente" | "operator">("admin");
  const [userName, setUserName] = useState<string>("Administrador");
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  // Focus trigger state (e.g. if we choose a customer from global search or ref a piece from re-stock)
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [focusedPeca, setFocusedPeca] = useState<Peca | null>(null);
  const [focusedOS, setFocusedOS] = useState<OrdemServico | null>(null);
  const [focusedOrcamento, setFocusedOrcamento] = useState<Orcamento | null>(null);
  const [triggerNewOrcamento, setTriggerNewOrcamento] = useState(false);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [allowCamera, setAllowCamera] = useState(true);
  const [allowLocation, setAllowLocation] = useState(true);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (localStorage.getItem("karteros_auth_setup")) return;
      const timer = setTimeout(() => {
        setShowPermissionModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleRequestPermissions = async () => {
    if (allowLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => console.log("Localização permitida de imediato"),
          (err) => console.warn("Localização negada ou com falha na inicialização:", err.message),
          { timeout: 3000 }
        );
      }
    }
    
    if (allowCamera) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          console.log("Câmera permitida de imediato");
        }
      } catch (err) {
        console.warn("Câmera recusada ou indisponível na inicialização:", err);
      }
    }

    if (dontAskAgain) {
      localStorage.setItem("karteros_auth_setup", "true");
      localStorage.setItem("karteros_permissions_camera_allowed", allowCamera ? "true" : "false");
      localStorage.setItem("karteros_permissions_location_allowed", allowLocation ? "true" : "false");
    }
    setShowPermissionModal(false);
  };

  const handleDismissPermissionModal = () => {
    if (dontAskAgain) {
      localStorage.setItem("karteros_auth_setup", "true");
      localStorage.setItem("karteros_permissions_camera_allowed", "false");
      localStorage.setItem("karteros_permissions_location_allowed", "false");
    }
    setShowPermissionModal(false);
  };

  // Check login states
  useEffect(() => {
    const sesL = localStorage.getItem("karteros_session") || localStorage.getItem("oficinapro_session");
    const sesS = sessionStorage.getItem("karteros_session") || sessionStorage.getItem("oficinapro_session");
    if (sesL === "admin_logged_in" || sesS === "admin_logged_in" || (sesL && sesL.startsWith("operator_")) || (sesS && sesS.startsWith("operator_"))) {
      setIsAuthenticated(true);

      const role = localStorage.getItem("oficinapro_role") || sessionStorage.getItem("oficinapro_role") || "admin";
      setUserRole(role as any);

      const name = localStorage.getItem("oficinapro_user_name") || sessionStorage.getItem("oficinapro_user_name") || "Administrador";
      setUserName(name);

      if (role !== "admin") {
        const opId = localStorage.getItem("oficinapro_operator_id") || sessionStorage.getItem("oficinapro_operator_id");
        if (opId) {
          const savedOpsRaw = localStorage.getItem("oficina_operadores");
          if (savedOpsRaw) {
            try {
              const savedOps: Operador[] = JSON.parse(savedOpsRaw);
              const found = savedOps.find(o => o.id === opId);
              if (found) {
                setAllowedModules(found.modulosPermitidos);
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      } else {
        setAllowedModules([]);
      }
    }
  }, [isAuthenticated]);

  // Hydrate lists on session auth & synchronize securely via backend APIs
  useEffect(() => {
    if (isAuthenticated) {
      const runBackendSecuritySync = async () => {
        const storedRole = localStorage.getItem("oficinapro_role") || sessionStorage.getItem("oficinapro_role") || userRole;
        const storedFuncionarioId = localStorage.getItem("oficinapro_funcionario_id") || sessionStorage.getItem("oficinapro_funcionario_id") || "";

        const data = getStoredData();
        setPecas(data.pecas);
        setMecanicos(data.mecanicos);
        setOrcamentos(data.orcamentos || []);
        setOperadores(data.operadores || []);
        if (data.config) {
          setConfig(data.config);
        }

        try {
          console.log(`[Segurança Frontend] Sincronizando dados via APIs seguras do backend. Papel: ${storedRole}`);

          // 1. Processar Clientes via API Segura de Mascaramento do Backend
          const clRes = await fetch("/api/security/clientes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": storedRole,
              "x-user-funcionario-id": storedFuncionarioId
            },
            body: JSON.stringify({ clientes: data.clientes })
          });
          const clData = await clRes.json();
          if (clData.success) {
            setClientes(clData.data);
          } else {
            setClientes(data.clientes);
          }

          // 2. Processar Frota de Veículos via API Segura de Mascaramento do Backend
          const vRes = await fetch("/api/security/veiculos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": storedRole,
              "x-user-funcionario-id": storedFuncionarioId
            },
            body: JSON.stringify({ veiculos: data.veiculos })
          });
          const vData = await vRes.json();
          if (vData.success) {
            setVeiculos(vData.data);
          } else {
            setVeiculos(data.veiculos);
          }

          // 3. Processar Ordens de Serviço via API do Backend (Filtro de Escopo de Histórico + Mascaramento de Custos)
          const oRes = await fetch("/api/security/ordens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": storedRole,
              "x-user-funcionario-id": storedFuncionarioId
            },
            body: JSON.stringify({ ordens: data.ordens })
          });
          const oData = await oRes.json();
          if (oData.success) {
            setOrdens(oData.data);
          } else {
            setOrdens(data.ordens);
          }

        } catch (err) {
          console.error("Erro na sincronização de segurança do backend. Utilizando fallbacks locais garantidos:", err);
          setClientes(data.clientes);
          setVeiculos(data.veiculos);
          setOrdens(data.ordens);
        }
      };

      runBackendSecuritySync();
    }
  }, [isAuthenticated, userRole]);

  // Persist edits back to LocalStorage
  const handleUpdateClientes = (newClientes: Cliente[]) => {
    setClientes(newClientes);
    saveStoredData({ clientes: newClientes, veiculos, pecas, mecanicos, ordens, orcamentos, operadores, config });
  };

  const handleUpdateVeiculos = (newVeiculos: Veiculo[]) => {
    setVeiculos(newVeiculos);
    saveStoredData({ clientes, veiculos: newVeiculos, pecas, mecanicos, ordens, orcamentos, operadores, config });
  };

  const handleUpdatePecas = (newPecas: Peca[]) => {
    setPecas(newPecas);
    saveStoredData({ clientes, veiculos, pecas: newPecas, mecanicos, ordens, orcamentos, operadores, config });
  };

  const handleUpdateMecanicos = (newMecanicos: Mecanico[]) => {
    setMecanicos(newMecanicos);
    saveStoredData({ clientes, veiculos, pecas, mecanicos: newMecanicos, ordens, orcamentos, operadores, config });
  };

  const handleUpdateOrdens = (newOrdens: OrdemServico[]) => {
    setOrdens(newOrdens);
    saveStoredData({ clientes, veiculos, pecas, mecanicos, ordens: newOrdens, orcamentos, operadores, config });
  };

  const handleUpdateOrcamentos = (newOrcamentos: Orcamento[]) => {
    setOrcamentos(newOrcamentos);
    saveStoredData({ clientes, veiculos, pecas, mecanicos, ordens, orcamentos: newOrcamentos, operadores, config });
  };

  const handleUpdateOperadores = (newOperadores: Operador[]) => {
    setOperadores(newOperadores);
    saveStoredData({ clientes, veiculos, pecas, mecanicos, ordens, orcamentos, operadores: newOperadores, config });
  };

  const handleUpdateConfig = (newConfig: OficinaConfig) => {
    setConfig(newConfig);
    saveStoredData({ clientes, veiculos, pecas, mecanicos, ordens, orcamentos, operadores, config: newConfig });
  };

  // Support for linked vehicle updates via custom events inside child subforms
  useEffect(() => {
    function handleVehiclesUpdateEvent(e: Event) {
      const customEvent = e as CustomEvent<Veiculo[]>;
      if (customEvent.detail) {
        handleUpdateVeiculos(customEvent.detail);
      }
    }
    window.addEventListener("veiculos-updated", handleVehiclesUpdateEvent);
    return () => window.removeEventListener("veiculos-updated", handleVehiclesUpdateEvent);
  }, [clientes, veiculos, pecas, mecanicos, ordens]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("karteros_session");
    localStorage.removeItem("oficinapro_session");
    sessionStorage.removeItem("karteros_session");
    sessionStorage.removeItem("oficinapro_session");
    setIsAuthenticated(false);
  };

  // Switch to specific Customer detail within CRM tab (e.g. triggered from Global Header search)
  const handleSelectClienteIdFromSearch = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    setActiveTab("clientes");
  };

  // Dashboard CTA actions
  const handleDashboardNavigate = (tab: string, arg?: any) => {
    if (tab === "estoque" && arg === "critico") {
      window.history.pushState(null, "", "/estoque?filter=critical");
      setUrlFilter("critical");
      setFocusedPeca(null);
      setFocusedOS(null);
    } else if (tab === "ordens" && arg === "hoje") {
      window.history.pushState(null, "", "/ordens-servico?filter=today");
      setUrlFilter("today");
      setFocusedOS(null);
      setFocusedPeca(null);
    } else if (tab === "ordens" && arg === "andamento") {
      window.history.pushState(null, "", "/ordens-servico?filter=andamento");
      setUrlFilter("andamento");
      setFocusedOS(null);
      setFocusedPeca(null);
    } else if (tab === "estoque" && arg) {
      window.history.pushState(null, "", "/estoque");
      setUrlFilter("");
      setFocusedPeca(arg);
      setFocusedOS(null);
    } else if (tab === "ordens" && arg) {
      window.history.pushState(null, "", "/ordens-servico");
      setUrlFilter("");
      setFocusedOS(arg);
      setFocusedPeca(null);
    } else if (tab === "orcamentos") {
      window.history.pushState(null, "", "/orcamentos");
      setUrlFilter("");
      if (arg === "new") {
        setTriggerNewOrcamento(true);
        setFocusedOrcamento(null);
      } else if (arg) {
        setFocusedOrcamento(arg);
        setTriggerNewOrcamento(false);
      } else {
        setFocusedOrcamento(null);
      }
      setFocusedPeca(null);
      setFocusedOS(null);
    } else {
      let targetPath = "/";
      if (tab === "ordens") {
        targetPath = "/ordens-servico";
      } else if (tab === "estoque") {
        targetPath = "/estoque";
      } else {
        targetPath = "/" + (tab === "dashboard" ? "" : tab);
      }
      window.history.pushState(null, "", targetPath);
      setUrlFilter("");
      setFocusedPeca(null);
      setFocusedOS(null);
    }
    setActiveTab(tab);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar link items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pdv", label: "PDV Frente de Caixa", icon: ShoppingCart },
    { id: "clientes", label: "Clientes & CRM", icon: Users },
    { id: "veiculos", label: "Frota Veículos", icon: Car },
    { id: "estoque", label: "Peças & Estoque", icon: Package },
    { id: "orcamentos", label: "Gestão Orçamentos", icon: Coins },
    { id: "ordens", label: "Ordens de Serviço", icon: Wrench },
    { id: "mecanicos", label: "Equipe técnica", icon: Users },
    { id: "fiscal", label: "Módulo Fiscal", icon: FileSpreadsheet },
    { id: "fechamento", label: "Fechamento Adm", icon: ShieldCheck },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === "admin") {
      return true;
    }
    return allowedModules.includes(item.id) && item.id !== "configuracoes";
  });

  const parsedUserAvatar = userRole === "admin" 
    ? (config.adminProfilePicUrl || "") 
    : (() => {
        const opId = localStorage.getItem("oficinapro_operator_id") || sessionStorage.getItem("oficinapro_operator_id");
        if (opId && operadores?.length) {
          const found = operadores.find(o => o.id === opId);
          return found?.fotoPerfil || "";
        }
        return "";
      })();

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-x-hidden antialiased relative" 
      style={{ 
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.96)), url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Top row Bar */}
      <GlobalHeader 
        clientes={clientes} 
        veiculos={veiculos} 
        onSelectCliente={handleSelectClienteIdFromSearch}
        onLogout={handleLogout}
        userName={userName}
        userRole={userRole}
        userAvatar={parsedUserAvatar}
      />

      <div className="flex-1 flex relative">
        
        {/* Navigation Sidebar Drawer */}
        <aside 
          className={`bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col shrink-0 ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          {/* Collapse toggle header */}
          <div className="h-14 border-b border-white/10 p-4 flex items-center justify-between">
            {sidebarOpen && <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">Navegação Recorrente</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition duration-150 ml-auto cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-3.5 space-y-1.5 text-xs">
            {filteredMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedClienteId(null);
                    setFocusedPeca(null);
                    setFocusedOS(null);
                    setUrlFilter("");
                    
                    let targetPath = "/";
                    if (item.id === "ordens") {
                      targetPath = "/ordens-servico";
                    } else if (item.id === "estoque") {
                      targetPath = "/estoque";
                    } else {
                      targetPath = "/" + (item.id === "dashboard" ? "" : item.id);
                    }
                    window.history.pushState(null, "", targetPath);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-white/10 text-white border border-white/10 shadow-lg shadow-black/10" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0 text-orange-400" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar foot */}
          <div className="p-4 border-t border-white/10 text-[9.5px] text-slate-500 font-mono text-center bg-black/10">
            {sidebarOpen ? (
              <span>Karter'OS SaaS v1.2.5 • 2026</span>
            ) : (
              <span>KO</span>
            )}
          </div>
        </aside>

        {/* Core content workspace area */}
        <main className="flex-1 p-8 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard 
                  clientes={clientes}
                  veiculos={veiculos}
                  pecas={pecas}
                  ordens={ordens}
                  mecanicos={mecanicos}
                  onNavigate={handleDashboardNavigate}
                  userRole={userRole}
                  allowedModules={allowedModules}
                  userName={userName}
                />
              )}

              {activeTab === "pdv" && (
                <PDV 
                  clientes={clientes}
                  pecas={pecas}
                  onUpdatePecas={handleUpdatePecas}
                  config={config}
                />
              )}

              {activeTab === "clientes" && (
                <ClientesCRM 
                  clientes={clientes}
                  veiculos={veiculos}
                  ordens={ordens}
                  orcamentos={orcamentos}
                  onNavigate={handleDashboardNavigate}
                  selectedClienteId={selectedClienteId}
                  onSelectClienteId={setSelectedClienteId}
                  onUpdateClientes={handleUpdateClientes}
                  onUpdateVeiculos={handleUpdateVeiculos}
                />
              )}

              {activeTab === "veiculos" && (
                <VeiculosDetran 
                  clientes={clientes}
                  veiculos={veiculos}
                  onUpdateVeiculos={handleUpdateVeiculos}
                />
              )}

              {activeTab === "estoque" && (
                <EstoquePecas 
                  pecas={pecas}
                  onUpdatePecas={handleUpdatePecas}
                  focusedPeca={focusedPeca}
                  onClearFocusedPeca={() => setFocusedPeca(null)}
                  urlFilter={urlFilter}
                />
              )}

              {activeTab === "orcamentos" && (
                <OrcamentosComponent 
                  clientes={clientes}
                  veiculos={veiculos}
                  pecas={pecas}
                  mecanicos={mecanicos}
                  orcamentos={orcamentos}
                  ordens={ordens}
                  onUpdateOrcamentos={handleUpdateOrcamentos}
                  onUpdateOrdens={handleUpdateOrdens}
                  onUpdatePecas={handleUpdatePecas}
                  onUpdateClientes={handleUpdateClientes}
                  onUpdateVeiculos={handleUpdateVeiculos}
                  focusedOrcamento={focusedOrcamento}
                  onClearFocusedOrcamento={() => setFocusedOrcamento(null)}
                  triggerNewOrcamento={triggerNewOrcamento}
                  onClearNewOrcamentoTrigger={() => setTriggerNewOrcamento(false)}
                  onNavigate={handleDashboardNavigate}
                  config={config}
                />
              )}

              {activeTab === "ordens" && (
                <OrdensServico 
                  clientes={clientes}
                  veiculos={veiculos}
                  pecas={pecas}
                  mecanicos={mecanicos}
                  ordens={ordens}
                  onUpdateOrdens={handleUpdateOrdens}
                  onUpdatePecas={handleUpdatePecas}
                  focusedOS={focusedOS}
                  onClearFocusedOS={() => setFocusedOS(null)}
                  onUpdateClientes={handleUpdateClientes}
                  onUpdateVeiculos={handleUpdateVeiculos}
                  config={config}
                  urlFilter={urlFilter}
                />
              )}

              {activeTab === "mecanicos" && (
                <MecanicosComissoes 
                  mecanicos={mecanicos}
                  ordens={ordens}
                  onUpdateMecanicos={handleUpdateMecanicos}
                />
              )}

              {activeTab === "fiscal" && (
                <ModuloFiscal 
                  clientes={clientes}
                  veiculos={veiculos}
                  pecas={pecas}
                  ordens={ordens}
                  onUpdateOrdens={handleUpdateOrdens}
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                />
              )}

              {activeTab === "fechamento" && (
                <FechamentoAdministrativo 
                  clientes={clientes}
                  veiculos={veiculos}
                  mecanicos={mecanicos}
                  pecas={pecas}
                  ordens={ordens}
                  onUpdateOrdens={handleUpdateOrdens}
                />
              )}

              {activeTab === "configuracoes" && userRole === "admin" && (
                <ConfiguracoesSistema 
                  operadores={operadores}
                  config={config}
                  onUpdateOperadores={handleUpdateOperadores}
                  onUpdateConfig={handleUpdateConfig}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modal de Solicitação de Acesso Traduzido e Persistente */}
      <AnimatePresence>
        {(() => {
          if (localStorage.getItem('karteros_auth_setup') === 'true') return null;
          if (!showPermissionModal) return null;
          return (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[360px] bg-white shadow-2xl p-6 relative overflow-hidden text-slate-800 border border-slate-100"
                style={{ borderRadius: '12px' }}
              >
                {/* Close Button X */}
                <button 
                  type="button"
                  onClick={handleDismissPermissionModal}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Title Header */}
                <div className="mb-4 pr-6">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    Solicitação de Acesso
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-1.5 leading-snug">
                    O sistema Karteros solicita permissão para acessar os seguintes recursos:
                  </p>
                </div>

                {/* Toggles Container */}
                <div className="space-y-2.5 mb-4">
                  
                  {/* Camera Permission Row */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg transition">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-slate-800 block">Câmera (Registro de Veículos)</span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">Para vistorias e fotos técnicos (EVS)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowCamera(!allowCamera)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer ${
                        allowCamera ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          allowCamera ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Location Permission Row */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg transition">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-slate-800 block">Localização (Auditoria de Serviços)</span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">Para preenchimento de ordens e rotas</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowLocation(!allowLocation)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer ${
                        allowLocation ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          allowLocation ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                </div>

                {/* Option Checkbox & Action Button */}
                <div className="flex flex-col gap-4">
                  
                  {/* Remember selection checkbox */}
                  <label className="flex items-start gap-2.5 px-0.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dontAskAgain}
                      onChange={(e) => setDontAskAgain(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 shrink-0"
                    />
                    <span className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                      Lembrar minha escolha e não perguntar novamente.
                    </span>
                  </label>

                  {/* Submit button on right aligned */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleRequestPermissions}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-[8px] text-xs transition duration-150 shadow-sm cursor-pointer"
                    >
                      Confirmar e Acessar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
