import React, { useState, useEffect } from "react";
import { Wrench, ShieldAlert, KeyRound, Check, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import KarterOSLogo from "./KarterOSLogo";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  
  // Registration States
  const [newNome, setNewNome] = useState("");
  const [newUsuario, setNewUsuario] = useState("");
  const [newSenha, setNewSenha] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    // Verificando se já existe sessão salva (Lembrar-me)
    const savedSession = localStorage.getItem("karteros_session") || localStorage.getItem("oficinapro_session") || sessionStorage.getItem("karteros_session");
    if (savedSession && (savedSession === "admin_logged_in" || savedSession.startsWith("operator_"))) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const getOperadoresAtuais = () => {
    try {
      const stored = localStorage.getItem("oficina_operadores");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "ope_1",
        nome: "Operador de Vendas",
        usuario: "vendedor",
        senha: "123",
        role: "atendente",
        modulosPermitidos: ["dashboard", "clientes", "veiculos", "orcamentos"]
      },
      {
        id: "ope_2",
        nome: "Beto Almeida (Mecânico)",
        usuario: "roberto",
        senha: "123",
        role: "mecanico",
        funcionarioId: "mec_1",
        modulosPermitidos: ["dashboard", "ordens"]
      },
      {
        id: "ope_3",
        nome: "Marcos Eletrônica (Mecânico)",
        usuario: "marcos",
        senha: "123",
        role: "mecanico",
        funcionarioId: "mec_2",
        modulosPermitidos: ["dashboard", "ordens"]
      },
      {
        id: "ope_4",
        nome: "Sandra Lima (Mecânico)",
        usuario: "sandra",
        senha: "123",
        role: "mecanico",
        funcionarioId: "mec_3",
        modulosPermitidos: ["dashboard", "ordens"]
      }
    ];
  };

  const [newRole, setNewRole] = useState<"admin" | "mecanico" | "atendente">("atendente");
  const [newFuncionarioId, setNewFuncionarioId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const isStandardAdmin = cleanUser === "admin" && password === (localStorage.getItem("admin_custom_password") || "123456");
    const isNewAdm = cleanUser === "adm" && password === "123456789";

    if (isStandardAdmin || isNewAdm) {
      setError("");
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("karteros_session", "admin_logged_in");
      storage.setItem("oficinapro_role", "admin");
      storage.setItem("oficinapro_user_name", "Administrador");
      storage.removeItem("oficinapro_operator_id");
      storage.removeItem("oficinapro_funcionario_id");
      
      onLoginSuccess();
      return;
    }

    // Check operators
    const ops = getOperadoresAtuais();
    const matchedOp = ops.find(
      (o: any) => o.usuario.toLowerCase() === cleanUser && o.senha === password
    );

    if (matchedOp) {
      setError("");
      const sessionKey = `operator_${matchedOp.id}_logged_in`;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem("karteros_session", sessionKey);
      storage.setItem("oficinapro_role", matchedOp.role || "atendente");
      storage.setItem("oficinapro_user_name", matchedOp.nome);
      storage.setItem("oficinapro_operator_id", matchedOp.id);
      
      if (matchedOp.funcionarioId) {
        storage.setItem("oficinapro_funcionario_id", matchedOp.funcionarioId);
      } else {
        storage.removeItem("oficinapro_funcionario_id");
      }
      
      onLoginSuccess();
    } else {
      setError("Credenciais inválidas! Digite usuário e senha corretos.");
    }
  };

  // REGISTRO DE FILIAÇÃO DO NOVO OPERADOR (ACESSO RESTRITO POR PADRÃO DE ACORDO COM O PAPEL DEFINIDO)
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsuario.trim().toLowerCase();

    if (!newNome.trim() || !cleanUser || !newSenha) {
      setSignUpError("Todos os campos de cadastro são obrigatórios!");
      return;
    }

    if (cleanUser === "admin" || cleanUser === "adm") {
      setSignUpError("Nome de usuário reservado ao administrador master.");
      return;
    }

    const currentOps = getOperadoresAtuais();
    const exists = currentOps.some((o: any) => o.usuario.toLowerCase() === cleanUser);
    if (exists) {
      setSignUpError("Este nome de usuário já está sendo utilizado por outro membro.");
      return;
    }

    // Configura módulos iniciais baseado no papel selecionado
    let initialModules = ["dashboard"];
    if (newRole === "mecanico") {
      initialModules = ["dashboard", "ordens"];
    } else if (newRole === "atendente") {
      initialModules = ["dashboard", "clientes", "veiculos", "orcamentos"];
    } else {
      initialModules = ["dashboard", "clientes", "veiculos", "estoque", "orcamentos", "ordens", "mecanicos", "fiscal", "fechamento"];
    }

    const newOp = {
      id: "ope_" + Date.now(),
      nome: newNome.trim(),
      usuario: cleanUser,
      senha: newSenha,
      role: newRole,
      funcionarioId: newRole === "mecanico" ? (newFuncionarioId || "mec_1") : undefined,
      modulosPermitidos: initialModules
    };

    const updatedOps = [...currentOps, newOp];
    localStorage.setItem("oficina_operadores", JSON.stringify(updatedOps));

    setSignUpError("");
    setSignUpSuccess(`Cadastro concluído com sucesso, ${newOp.nome}! Entre usando seu usuário estipulado.`);
    
    // Clear registration fields
    setNewNome("");
    setNewUsuario("");
    setNewSenha("");

    // Auto navigate to sign-in tab with populated user
    setTimeout(() => {
      setUsername(cleanUser);
      setIsSignUp(false);
      setSignUpSuccess("");
    }, 2500);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryEmail.trim()) {
      setRecoverySuccess(true);
      setTimeout(() => {
        setRecoverySuccess(false);
        setShowRecovery(false);
        setRecoveryEmail("");
      }, 3500);
    }
  };

  return (
    <div 
      id="login-page" 
      className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden" 
      style={{ 
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.93)), url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <motion.div
        id="col-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10 text-slate-200"
      >
        <div className="flex flex-col items-center mb-6">
          <KarterOSLogo size={70} showText={true} className="flex-col text-2xl" />
          <p className="text-xs text-slate-400 mt-2 text-center font-medium">Gestão Inteligente de Sistemas e Controle de Permissão</p>
        </div>

        {/* Tab switcher: Entrar vs Cadastrar */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-1 rounded-xl border border-white/5 mb-6 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(""); setSignUpError(""); }}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${!isSignUp ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(""); setSignUpError(""); }}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${isSignUp ? "bg-orange-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Criar Conta (Restrito)
          </button>
        </div>

        {!isSignUp ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                Nome de Usuário
              </label>
              <input
                id="username-inp"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900/50 placeholder-slate-500 focus:border-orange-500/50"
                placeholder="Insira seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
                  Sua Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="text-[10px] text-orange-400 hover:underline font-bold"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                id="password-inp"
                type="password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900/50 placeholder-slate-500 focus:border-orange-500/50"
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  id="remember-me-chk"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 text-orange-500 bg-slate-900 focus:ring-orange-500 cursor-pointer"
                />
                <span className="font-medium">Lembrar acesso no navegador</span>
              </label>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar no Painel</span>
            </button>
          </form>
        ) : (
          // SIGNUP FORM (RBAC DEFAULT CREATION)
          <form onSubmit={handleSignUp} className="space-y-4">
            {signUpError && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{signUpError}</span>
              </motion.div>
            )}

            {signUpSuccess && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{signUpSuccess}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                Nome do Colaborador
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900/50 placeholder-slate-500 focus:border-orange-500/50"
                placeholder="Ex: Pedro de Moraes"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                Usuário para Login
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900/50 placeholder-slate-500 focus:border-orange-500/50"
                placeholder="Ex: pedro"
                value={newUsuario}
                onChange={(e) => setNewUsuario(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                Definir Senha
              </label>
              <input
                type="password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900/50 placeholder-slate-500"
                placeholder="•••••"
                value={newSenha}
                onChange={(e) => setNewSenha(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                Papel / Cargo no Sistema
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900 focus:border-orange-500/50 font-semibold"
              >
                <option value="atendente" className="bg-slate-900 text-white">Atendente (Modulo Vendas, CRM, etc.)</option>
                <option value="mecanico" className="bg-slate-900 text-white">Mecânico (Acesso limitado a OS e Painel de Execução)</option>
                <option value="admin" className="bg-slate-900 text-white">Administrador Auxiliar (Acesso geral)</option>
              </select>
            </div>

            {newRole === "mecanico" && (
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 font-sans">
                  Vincular com Funcionário Técnico
                </label>
                <select
                  value={newFuncionarioId}
                  onChange={(e) => setNewFuncionarioId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-900 focus:border-orange-500/50 font-semibold"
                >
                  <option value="" className="bg-slate-900 text-white">-- Selecione o técnico correspondente --</option>
                  <option value="mec_1" className="bg-slate-900 text-white">Roberto Beto Almeida (Suspensão, Freios)</option>
                  <option value="mec_2" className="bg-slate-900 text-white">Marcos Eletrônica (Injeção Eletrônica)</option>
                  <option value="mec_3" className="bg-slate-900 text-white">Sandra Lima (Motores, Cabeçotes)</option>
                </select>
              </div>
            )}

            <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl text-[10px] text-orange-300/90 leading-relaxed font-semibold">
              ⚠️ Lógica de Perfil de Segurança:<br />
              Por padrão de governança do KARTER'OS, as contas serão registradas com os privilégios estritos de seu cargo. O administrador master poderá alterar e conceder permissões modulares nas configurações do sistema a qualquer momento.
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Cadastrar Novo Perfil</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-400 leading-normal">
            Contas Administrativas Padrão de Teste:<br />
            <span className="font-bold text-slate-200">admin</span> / <span className="font-semibold text-slate-300">123456</span> ou <span className="font-bold text-slate-200">Adm</span> / <span className="font-semibold text-slate-305">123456789</span>
          </p>
        </div>
      </motion.div>

      {/* Recovery Password Modal */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900/90 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl max-w-sm w-full p-6 relative text-slate-200"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Recuperar Acesso
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Digite seu e-mail cadastrado na plataforma para receber as instruções de redefinição de credenciais.
            </p>

            {recoverySuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-lg flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Link enviado! Verifique sua caixa de entrada corporativa em instantes.</span>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    id="recovery-email-inp"
                    type="email"
                    required
                    placeholder="Ex: admin@karteros.com.br"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="px-3.5 py-2 text-sm font-medium text-slate-405 hover:bg-white/5 rounded-lg text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    id="recovery-submit-btn"
                    type="submit"
                    className="px-3.5 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-505"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
