import React, { useState } from "react";
import { Cliente, Veiculo } from "../types";
import { Car, Search, PlusCircle, User, Hash, AlertCircle, Sparkles, Building, X } from "lucide-react";
import { simulateDetranAPI } from "../dataStore";

interface VeiculosDetranProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  onUpdateVeiculos: (newVeiculos: Veiculo[]) => void;
}

export default function VeiculosDetran({
  clientes,
  veiculos,
  onUpdateVeiculos,
}: VeiculosDetranProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [clienteId, setClienteId] = useState("");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [motor, setMotor] = useState("");
  const [cor, setCor] = useState("");
  const [km, setKm] = useState("");
  const [chassi, setChassi] = useState("");
  const [renavam, setRenavam] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("");
  
  const [detranLoading, setDetranLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [detranNotice, setDetranNotice] = useState("");
  const [detranSuccess, setDetranSuccess] = useState(false);
  
  // Owner autocomplete query states
  const [ownerQuery, setOwnerQuery] = useState("");
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);

  const handleDetranSync = async () => {
    if (!placa.trim()) {
      setFormError("É obrigatório informar a PLACA para consultar o DETRAN.");
      setDetranNotice("");
      return;
    }
    setFormError("");
    setDetranNotice("");
    setDetranLoading(true);
    setDetranSuccess(false);

    try {
      const data = await simulateDetranAPI(placa);
      setMarca(data.marca);
      setModelo(data.modelo);
      setAno(data.ano);
      setMotor(data.motor);
      setCor(data.cor);
      setChassi(data.chassi || "");
      setRenavam(data.renavam || "");
      setMunicipio(data.municipio || "");
      setUf(data.uf || "");

      if (data.api_status === "simulated") {
        if (data.api_error && (data.api_error.includes("APIBRASIL_TOKEN") || data.api_error.includes("Secrets"))) {
          setDetranNotice("⚠️ A APIBrasil paga não foi configurada nos Secrets da aplicação. O sistema gerou dados fictícios realistas de simulação.");
        } else {
          setDetranNotice(`⚠️ A APIBrasil oficial retornou falha (${data.api_error || "Limite/Saldo esgotado"}). Dados gerados por simulação no sistema.`);
        }
      } else {
        setDetranNotice(`✅ Veículo real consultado com sucesso na base de dados oficial via ${data.api_source === "apibrasil_pago" ? "APIBrasil Agregados" : "API de Placas FIPE"}!`);
      }
      setDetranSuccess(true);
    } catch (err) {
      setFormError("Erro de comunicação com o sistema de dados de Placas.");
    } finally {
      setDetranLoading(false);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !placa || !marca || !modelo || !ano) {
      setFormError("Por favor, preencha todos os campos obrigatórios (Proprietário, Placa, Marca, Modelo e Ano).");
      return;
    }

    // License Plate uniqueness check
    const plateExists = veiculos.some(v => v.placa.toUpperCase() === placa.toUpperCase().trim());
    if (plateExists) {
      setFormError("Já existe um veículo registrado com esta placa no sistema!");
      return;
    }

    const newV: Veiculo = {
      id: "vei_" + Date.now(),
      clienteId,
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
    
    // Clear states
    setClienteId("");
    setOwnerQuery("");
    setPlaca("");
    setMarca("");
    setModelo("");
    setAno("");
    setMotor("");
    setCor("");
    setKm("");
    setChassi("");
    setRenavam("");
    setMunicipio("");
    setUf("");
    setFormError("");
    setDetranNotice("");
    setShowAddForm(false);
  };

  const getOwnerName = (ownerId: string) => {
    return clientes.find(c => c.id === ownerId)?.nome || "Não encontrado";
  };

  const filteredVeiculos = veiculos.filter(v => {
    const ownerName = getOwnerName(v.clienteId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return v.placa.toLowerCase().includes(searchLower) ||
           v.modelo.toLowerCase().includes(searchLower) ||
           v.marca.toLowerCase().includes(searchLower) ||
           ownerName.includes(searchLower);
  });

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* Intro row banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white">Frota de Veículos e Monitor Integrado DETRAN</h2>
          <p className="text-xs text-slate-400">Consulte placas diretamente e preencha especificações técnicas do veículo</p>
        </div>

        <button
          id="toggle-add-vehicle-btn"
          onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}
          className="bg-orange-600 hover:bg-orange-550 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-550/10"
        >
          <Car className="w-4 h-4 text-slate-900" />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* API Notice */}
      <div className="bg-slate-900/60 border border-orange-500/20 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
        <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-orange-400 text-xs">Integração de Placas SINESP / API Brasil FIPE</h4>
          <p className="mt-0.5 text-xxs text-slate-300">
            A busca consome a API oficial <code className="bg-slate-950 font-mono text-[10px] px-1 py-0.5 rounded text-orange-350">placa-fipe.apibrasil.com.br</code> com transmissão fiel dos dados retornados para <strong>Marca, Modelo, Ano, Município, RENAVAM</strong> e <strong>Chassi</strong> (exatamente conforme o circuito de dados C# fornecido).
          </p>
          <p className="mt-1.5 text-[10px] text-orange-350">
            ⚠️ <strong>Nota sobre limite de uso:</strong> A API possui um limite de <strong>1 consulta por minuto</strong>. Se você pesquisar repetidamente placas diferentes em menos de 60 segundos, o CRM utiliza fallbacks inteligentes seguros (massa de dados local ou simulação realista) para garantir que a Ordem de Serviço não trave. Aguarde 60 segundos entre as pesquisas para sincronização em tempo real de novos registros.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Left pane: Add Form if active */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl space-y-4 h-fit">
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Novo Veículo DETRAN</h3>
              <p className="text-xxs text-slate-450">Insira a placa para rechear os dados via simulação do DETRAN</p>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-350 text-xxs rounded flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {detranNotice && (
              <div className={`p-3 border text-xxs rounded flex items-start gap-1.5 font-medium leading-relaxed ${
                detranNotice.startsWith("✅")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{detranNotice}</span>
              </div>
            )}

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs font-sans text-slate-200">
              <div>
                <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Proprietário do Veículo *</label>
                
                {clienteId ? (
                  <div className="flex justify-between items-center bg-slate-900 border border-emerald-500/30 text-white px-3 py-2.5 rounded-lg shadow-inner">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-emerald-400">
                        {clientes.find(c => c.id === clienteId)?.nome}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        CPF: {clientes.find(c => c.id === clienteId)?.cpfCnpj}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setClienteId("");
                        setOwnerQuery("");
                      }}
                      className="text-slate-400 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 transition"
                      title="Alterar proprietário"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <input
                        id="owner-search-inp"
                        type="text"
                        placeholder="Buscar cliente por nome ou CPF (ex: João)..."
                        className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none text-xs"
                        value={ownerQuery}
                        onChange={(e) => {
                          setOwnerQuery(e.target.value);
                          setShowOwnerSuggestions(true);
                        }}
                        onFocus={() => setShowOwnerSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowOwnerSuggestions(false), 200)}
                      />
                      <Search className="absolute right-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {showOwnerSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-white/15 rounded-lg max-h-52 overflow-y-auto shadow-2xl">
                        {(() => {
                          // Função auxiliar para remover acentos e normalizar texto para buscas perfeitas
                          const normalizeText = (text: string) =>
                            text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

                          const query = normalizeText(ownerQuery);
                          
                          const filtered = clientes.filter(c => {
                            // Se a busca estiver vazia, exibe todos os clientes
                            if (!query) return true;

                            const normalizedNome = normalizeText(c.nome);
                            const numericCpf = c.cpfCnpj.replace(/\D/g, "");
                            const numericQuery = query.replace(/\D/g, "");

                            // Suporte adicional a busca por CPF numérico
                            if (numericQuery && numericCpf.includes(numericQuery)) {
                              return true;
                            }

                            // Filtro por iniciais das palavras do nome
                            // Ex: "Tiago Lut" -> iniciais "tiago", "lut".
                            // Se digitar "ti", "lu", casa perfeitamente com os começos das palavras do nome
                            const words = normalizedNome.split(/\s+/);
                            const hasMatchByInitials = words.some(word => word.startsWith(query)) || normalizedNome.startsWith(query);
                            
                            return hasMatchByInitials;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="p-3 text-xxs text-slate-500 text-center">
                                Nenhum proprietário encontrado.
                              </div>
                            );
                          }

                          return filtered.map(c => {
                            const clientType = c.tipo || (c.cpfCnpj?.replace(/\D/g, "").length > 11 ? "PJ" : "PF");
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setClienteId(c.id);
                                  setShowOwnerSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-white/10 border-b border-white/5 last:border-b-0 transition flex flex-col gap-0.5"
                              >
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="text-xs font-semibold text-white truncate max-w-[15rem]">{c.nome}</span>
                                  <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold tracking-wider shrink-0 ${
                                    clientType === "PJ"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  }`}>
                                    {clientType}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">CPF: {c.cpfCnpj}</span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xxs font-semibold text-slate-300 uppercase">Placa Mercosul *</label>
                  <span className="text-xxs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded tracking-wide">Ex: PLO9I45</span>
                </div>
                
                <div className="flex gap-1.5 font-sans">
                  <input
                    id="veh-placa-inp"
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Ex: BRA2E19"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none uppercase font-mono text-xs tracking-wider bg-slate-900 text-white"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                  />
                  <button
                    id="detran-sync-btn"
                    type="button"
                    onClick={handleDetranSync}
                    disabled={detranLoading}
                    className="bg-orange-605 bg-orange-600 hover:bg-orange-555 hover:bg-orange-550 text-white font-bold text-xxs px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer transition duration-150"
                  >
                    {detranLoading ? (
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>BUSCAR</span>
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xxs text-slate-400 mb-1">Modelo do Veículo *</label>
                <input
                  id="veh-modelo-inp"
                  type="text"
                  required
                  placeholder="Ex: Gol 1.6 Mi Power Total Flex"
                  className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white font-semibold focus:outline-none text-xs"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/10">
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Marca / Fab *</label>
                  <input
                    id="veh-marca-inp"
                    type="text"
                    required
                    placeholder="Ex: Ford"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white font-semibold focus:outline-none"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Ano Modelo *</label>
                  <input
                    id="veh-ano-inp"
                    type="text"
                    required
                    placeholder="Ex: 2017"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white font-semibold focus:outline-none"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Motorização</label>
                  <input
                    id="veh-motor-inp"
                    type="text"
                    placeholder="Ex: 1.0 Turbo"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none"
                    value={motor}
                    onChange={(e) => setMotor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Cor</label>
                  <input
                    id="veh-cor-inp"
                    type="text"
                    placeholder="Ex: Vermelho"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">KM Inicial</label>
                  <input
                    id="veh-km-inp"
                    type="number"
                    placeholder="Ex: 85000"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">RENAVAM</label>
                  <input
                    id="veh-renavam-inp"
                    type="text"
                    placeholder="Ex: 1234567890"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none font-mono"
                    value={renavam}
                    onChange={(e) => setRenavam(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Chassi</label>
                  <input
                    id="veh-chassi-inp"
                    type="text"
                    placeholder="Ex: 9BW..."
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none font-mono uppercase"
                    value={chassi}
                    onChange={(e) => setChassi(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">Município</label>
                  <input
                    id="veh-municipio-inp"
                    type="text"
                    placeholder="Ex: São Paulo"
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs text-slate-400 mb-1">UF (Estado)</label>
                  <input
                    id="veh-uf-inp"
                    type="text"
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="w-full px-2.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none uppercase"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xxs pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold hover:bg-white/10 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-new-veh-btn"
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-550 text-white font-bold cursor-pointer transition shadow-md shadow-orange-550/10"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right Pane: Vehicle List Grid */}
        <div className={showAddForm ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
          
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="veh-search-inp"
                type="text"
                placeholder="Buscar por placa, modelo ou dono..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-white/10 bg-slate-950/40 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <span className="text-xxs text-slate-400 font-semibold">{filteredVeiculos.length} veículos localizados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredVeiculos.map(v => (
              <div key={v.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:bg-white/10 hover:border-orange-500/30 transition duration-300 relative flex flex-col justify-between font-sans text-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold bg-slate-950 text-orange-400 border border-white/5 px-2 py-0.5 rounded tracking-wide shadow-md">
                      {v.placa}
                    </span>
                    <span className="text-xxs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
                      {v.ano}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm">{v.marca} {v.modelo}</h4>
                    <p className="text-xxs text-slate-400 font-medium mt-0.5">Motor: {v.motor} | Cor: {v.cor}</p>
                    {v.municipio && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Cidade: {v.municipio}{v.uf ? ` - ${v.uf.toUpperCase()}` : ''}</p>
                    )}
                    {v.renavam && (
                      <p className="text-[10px] text-slate-500 font-mono mt-1">RENAVAM: {v.renavam}</p>
                    )}
                    {v.chassi && (
                      <p className="text-[10px] text-slate-500 font-mono">CHASSI: {v.chassi}</p>
                    )}
                    <p className="text-xxs text-orange-400 font-mono font-bold mt-1.5">KM Acumulada: {v.km.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2 text-xxs">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Proprietário / Titular</p>
                    <p className="font-bold text-white truncate">{getOwnerName(v.clienteId)}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredVeiculos.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                Nenhum veículo cadastrado na frota.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
