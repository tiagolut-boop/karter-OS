import React, { useState, useRef, useEffect } from "react";
import { Cliente, Veiculo } from "../types";
import { Search, LogOut, UserCheck, Wrench, Shield, Car, User, Smartphone, FileText } from "lucide-react";
import KarterOSLogo from "./KarterOSLogo";

interface GlobalHeaderProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  onSelectCliente: (clienteId: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export default function GlobalHeader({ 
  clientes, 
  veiculos, 
  onSelectCliente, 
  onLogout,
  userName = "Administrador",
  userRole = "admin",
  userAvatar
}: GlobalHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ type: "cliente" | "veiculo"; id: string; mainText: string; subText: string; refId: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search results if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const cleanTerm = term.toLowerCase();

    // 1. Search in Clientes (by nome, email, telefone, cpfCnpj)
    const matchingClientes = clientes.filter(
      c =>
        c.nome.toLowerCase().includes(cleanTerm) ||
        c.cpfCnpj.replace(/\D/g, "").includes(cleanTerm) ||
        c.cpfCnpj.toLowerCase().includes(cleanTerm) ||
        c.telefone.replace(/\D/g, "").includes(cleanTerm) ||
        c.telefone.toLowerCase().includes(cleanTerm) ||
        c.email.toLowerCase().includes(cleanTerm)
    );

    // 2. Search in Veiculos (by placa, modelo, marca)
    const matchingVeiculos = veiculos.filter(
      v =>
        v.placa.toLowerCase().includes(cleanTerm) ||
        v.modelo.toLowerCase().includes(cleanTerm) ||
        v.marca.toLowerCase().includes(cleanTerm)
    );

    // Map matched records to generic items
    const clientItems = matchingClientes.map(c => ({
      type: "cliente" as const,
      id: c.id,
      mainText: c.nome,
      subText: `CPF: ${c.cpfCnpj} | Telefone: ${c.telefone}`,
      refId: c.id // navigates directly to this client's profile
    }));

    const vehicleItems = matchingVeiculos.map(v => {
      const owner = clientes.find(c => c.id === v.clienteId);
      return {
        type: "veiculo" as const,
        id: v.id,
        mainText: `${v.marca} ${v.modelo} [${v.placa}]`,
        subText: `Proprietário: ${owner ? owner.nome : "Desconhecido"}`,
        refId: v.clienteId // navigates directly to owner client's profile
      };
    });

    // Combine results
    const combined = [...clientItems, ...vehicleItems];
    setResults(combined.slice(0, 8)); // Limit to max 8 results for a clean dropdown
    setShowResults(true);
  };

  const handleResultClick = (refId: string) => {
    onSelectCliente(refId);
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <header className="bg-white/5 backdrop-blur-md border-b border-white/10 h-16 px-6 flex items-center justify-between sticky top-0 z-40 font-sans text-white">
      
      {/* Brand Logo left */}
      <KarterOSLogo size={36} showText={true} />

      {/* Global intelligent search middle */}
      <div ref={containerRef} className="flex-1 max-w-md mx-6 relative">
        <div className="relative">
          <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-inp"
            type="text"
            className="w-full pl-10 pr-3 py-2 text-xs rounded-full border border-white/10 bg-slate-950/40 hover:bg-slate-950/60 focus:outline-none focus:bg-slate-950/80 focus:ring-2 focus:ring-orange-500/45 focus:border-orange-500/50 text-white placeholder-slate-400 transition duration-150"
            placeholder="Busca Inteligente (Nome, Placa, Telefone ou CPF)..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
          />
        </div>

        {/* Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-white/5 z-50 animate-fadeIn text-xs text-slate-200">
            {results.map(item => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleResultClick(item.refId)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "cliente" ? "bg-orange-500/10 text-orange-400" : "bg-orange-600/10 text-orange-300"
                }`}>
                  {item.type === "cliente" ? <User className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{item.mainText}</p>
                  <p className="text-xxs text-slate-400 truncate mt-0.5">{item.subText}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && searchTerm.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 text-center text-slate-400 text-xs z-50 animate-fadeIn">
            Nenhum cliente ou veículo localizado para "{searchTerm}"
          </div>
        )}
      </div>

      {/* User Info & Actions right */}
      <div className="flex items-center gap-6 text-xs font-sans">
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-slate-400">Servidor Online</span>
        </div>

        <div className="flex items-center gap-2">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Foto do Perfil" 
              className="w-8 h-8 rounded-full object-cover border-2 border-orange-500/40 shadow-md shadow-orange-500/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
              <Shield className={`w-4 h-4 ${userRole === "admin" ? "text-orange-400" : "text-amber-500"}`} />
            </div>
          )}
          <div className="hidden lg:flex flex-col items-end">
            <span className="font-bold text-white flex items-center gap-1">
              {userName}
            </span>
            <span className="text-xxs text-slate-400 bg-white/5 px-1.5 py-0.5 border border-white/5 rounded font-mono uppercase tracking-wider">
              {userRole === "admin" ? "Master Admin" : "Operador"}
            </span>
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          className="px-3.5 py-1.5 text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition duration-250 flex items-center gap-1.5 font-medium cursor-pointer"
          title="Sair do Sistema"
        >
          <LogOut className="w-4 h-4 text-orange-400" />
          <span className="hidden sm:inline">Desconectar</span>
        </button>
      </div>
    </header>
  );
}
