import React, { useState, useEffect } from "react";
import { Peca } from "../types";
import { PlusCircle, Search, AlertTriangle, Package2, DollarSign, PenTool, CheckCircle, PackageCheck } from "lucide-react";

interface EstoquePecasProps {
  pecas: Peca[];
  onUpdatePecas: (newPecas: Peca[]) => void;
  focusedPeca?: Peca | null;
  onClearFocusedPeca?: () => void;
  urlFilter?: string;
}

export default function EstoquePecas({
  pecas,
  onUpdatePecas,
  focusedPeca,
  onClearFocusedPeca,
  urlFilter
}: EstoquePecasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [internalFilter, setInternalFilter] = useState<string | null>(null);

  // Sync prop filter to internal state
  useEffect(() => {
    if (urlFilter) {
      setInternalFilter(urlFilter);
    } else {
      const params = new URLSearchParams(window.location.search);
      const directFilter = params.get("filter") || params.get("filtro");
      if (directFilter) {
        setInternalFilter(directFilter);
      } else {
        setInternalFilter(null);
      }
    }
  }, [urlFilter]);

  // Form states
  const [sku, setSku] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [estoque, setEstoque] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [formError, setFormError] = useState("");

  // Re-stock quick action state
  const [reStockId, setReStockId] = useState<string | null>(focusedPeca ? focusedPeca.id : null);
  const [reStockQty, setReStockQty] = useState("");

  const handleCreatePeca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !descricao.trim() || !fabricante.trim() || !estoque || !precoCusto || !precoVenda) {
      setFormError("Por favor, preencha todos os campos do inventário!");
      return;
    }

    // SKU check
    const skuExists = pecas.some(p => p.sku.toUpperCase() === sku.toUpperCase().trim());
    if (skuExists) {
      setFormError("Já existe uma peça cadastrada com este SKU!");
      return;
    }

    const newP: Peca = {
      id: "pec_" + Date.now(),
      sku: sku.toUpperCase().trim(),
      descricao,
      fabricante,
      estoque: Number(estoque) || 0,
      precoCusto: Number(precoCusto) || 0,
      precoVenda: Number(precoVenda) || 0,
    };

    onUpdatePecas([...pecas, newP]);

    // reset states
    setSku("");
    setDescricao("");
    setFabricante("");
    setEstoque("");
    setPrecoCusto("");
    setPrecoVenda("");
    setFormError("");
    setShowAddForm(false);
  };

  const handleQuickRestock = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!reStockQty || Number(reStockQty) <= 0) return;

    const updated = pecas.map(p => {
      if (p.id === id) {
        return { ...p, estoque: p.estoque + Number(reStockQty) };
      }
      return p;
    });

    onUpdatePecas(updated);
    setReStockId(null);
    setReStockQty("");
    if (onClearFocusedPeca) onClearFocusedPeca();
  };

  const filteredPecas = pecas.filter(p => {
    const matchesSearch = 
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabricante.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;

    if (internalFilter === "critical" || internalFilter === "critico") {
      return p.estoque < 5;
    }

    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white">Estoque de Alinhamento e Autopeças</h2>
          <p className="text-xs text-slate-400">Mapeamento de insumos, custo operacional e avisos de inventário de segurança</p>
        </div>

        <button
          id="toggle-add-piece-btn"
          onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}
          className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-lg"
        >
          <Package2 className="w-4 h-4 text-slate-900" />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* Focus banner trigger from dashboard "Reabastecer" */}
      {focusedPeca && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-250 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
              <PackageCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
              Reabastecimento Rápido Solicitado: {focusedPeca.descricao} (SKU: {focusedPeca.sku})
            </h4>
            <p className="text-xxs text-emerald-200/80 font-medium">Estoque Atol: {focusedPeca.estoque} unidades | Frabricante: {focusedPeca.fabricante}</p>
          </div>
          <form onSubmit={(e) => handleQuickRestock(e, focusedPeca.id)} className="flex gap-2">
            <input
              id="dash-restock-qty-inp"
              type="number"
              required
              placeholder="Qtd"
              className="w-16 px-2.5 py-1 text-xs border border-emerald-500/20 bg-slate-950/50 text-white rounded focus:outline-none"
              value={reStockQty}
              onChange={(e) => setReStockQty(e.target.value)}
            />
            <button
              id="dash-restock-submit-btn"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xxs px-2.5 py-1 rounded cursor-pointer"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => { if (onClearFocusedPeca) onClearFocusedPeca(); }}
              className="text-xxs text-emerald-400 hover:underline px-1 self-center cursor-pointer"
            >
              Ignorar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Creation parameters drawer */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-xl space-y-4 h-fit">
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Registrar Item no Inventário</h3>
              <p className="text-xxs text-slate-400">Preencha SKU e margens de venda para cálculo preciso de faturamentos</p>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xxs rounded flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePeca} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Código Único (SKU) *</label>
                <input
                  id="piece-sku-inp"
                  type="text"
                  required
                  placeholder="Ex: FLT-5011"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none uppercase font-mono tracking-wide bg-slate-900/50 text-white"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Descrição / Nome Comercial *</label>
                <input
                  id="piece-nome-inp"
                  type="text"
                  required
                  placeholder="Ex: Filtro de Óleo Fram Tec"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none bg-slate-900/50 text-white"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Fabricante / Fornecedor *</label>
                <input
                  id="piece-fabricante-inp"
                  type="text"
                  required
                  placeholder="Ex: Fram"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none bg-slate-900/50 text-white"
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Estoque Inicial *</label>
                  <input
                    id="piece-estoque-inp"
                    type="number"
                    required
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none bg-slate-900/50 text-white"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Preço de Custo (R$) *</label>
                  <input
                    id="piece-custo-inp"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 25.00"
                    className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none bg-slate-900/50 text-white"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-semibold text-slate-300 uppercase mb-1">Preço de Venda (R$) *</label>
                <input
                  id="piece-venda-inp"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 50.00"
                  className="w-full px-3 py-2.5 border border-white/10 rounded-lg focus:outline-none bg-slate-900/50 text-white"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
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
                  id="submit-new-piece-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-550 text-white font-bold transition cursor-pointer"
                >
                  Confirmar Estoque
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of items */}
        <div className={showAddForm ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
          
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="peca-search-inp"
                type="text"
                placeholder="Buscar por SKU, nome, fabricante..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 bg-slate-950/40 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <span className="text-xxs text-slate-400 font-semibold">{filteredPecas.length} tipos de peça catalogados</span>
          </div>

          {/* Active visual drill-down indicator banner */}
          {(internalFilter === "critical" || internalFilter === "critico") && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs font-semibold text-red-300 animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                Filtrado: Peças com Estoque Crítico (menos de 5 unidades)
              </span>
              <button
                type="button"
                onClick={() => {
                  setInternalFilter(null);
                  window.history.pushState(null, "", "/estoque");
                }}
                className="text-xs text-red-400 hover:text-white hover:bg-red-500/20 transition px-2 py-1 rounded cursor-pointer font-bold"
              >
                Limpar Filtro
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPecas.map(p => {
              const lowStock = p.estoque < 5;
              return (
                <div key={p.id} className={`bg-white/5 border backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:border-orange-500/20 transition relative flex flex-col justify-between ${
                  lowStock ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-white/10 text-white"
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xxs font-bold bg-slate-950 text-orange-400 border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {p.sku}
                      </span>
                      {lowStock && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xxs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Crítico &lt; 5</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-white text-xs mt-1 leading-snug">{p.descricao}</h4>
                    <p className="text-xxs text-slate-400 font-medium">Fabricante: {p.fabricante}</p>
                    
                    <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xxs">
                      <div>
                        <span className="text-slate-400 block">Custo</span>
                        <span className="font-bold text-slate-300">{formatCurrency(p.precoCusto)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Venda</span>
                        <span className="font-bold text-orange-400">{formatCurrency(p.precoVenda)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-xxs text-slate-400 block">Disponível</span>
                      <span className={`text-base font-black ${lowStock ? "text-red-400 block font-black" : "text-white"}`}>
                        {p.estoque} <span className="text-xxs font-normal text-slate-400">un</span>
                      </span>
                    </div>

                    {reStockId === p.id ? (
                      <form onSubmit={(e) => handleQuickRestock(e, p.id)} className="flex items-center gap-1.5">
                        <input
                          id={`quick-restock-inp-${p.id}`}
                          type="number"
                          required
                          placeholder="Qtd"
                          className="w-12 p-1 text-xxs border border-orange-500/20 bg-slate-950/40 rounded font-bold text-white focus:outline-none"
                          value={reStockQty}
                          onChange={(e) => setReStockQty(e.target.value)}
                        />
                        <button
                          id={`quick-restock-sub-${p.id}`}
                          type="submit"
                          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xxs h-6 w-10 flex items-center justify-center rounded cursor-pointer"
                        >
                          Ok
                        </button>
                      </form>
                    ) : (
                      <button
                        id={`reabastecer-action-btn-${p.id}`}
                        onClick={() => { setReStockId(p.id); setReStockQty(""); }}
                        className="text-xxs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1.5 rounded-lg border border-orange-500/20 transition cursor-pointer"
                      >
                        Abastecer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredPecas.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                Nenhuma peça catalogada no estoque.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
