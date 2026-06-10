import React, { useState, useEffect } from "react";
import { Cliente, Peca, OficinaConfig } from "../types";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Trash2, 
  FileCheck2, 
  Printer, 
  Download, 
  Coins, 
  User, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Info, 
  Loader2, 
  QrCode, 
  Sparkles, 
  Receipt,
  FileDown
} from "lucide-react";

interface PDVItem {
  id: string; // unique cart item id
  pecaId: string;
  sku: string;
  descricao: string;
  quantidade: number;
  precoVenda: number;
}

interface VendaPDV {
  id: string;
  data: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  itens: { sku: string; descricao: string; quantidade: number; precoUnitario: number }[];
  baseCalculoIcms: number;
  valorIcms: number;
  valorMaoDeObra: number;
  valorTotalPeças: number;
  valorTotal: number;
  formaPagamento: string;
  valorPago: number;
  troco: number;
  chaveAcesso: string;
  numeroNota: number;
  serie: string;
  cfop: string;
  ibptTributos: number; // aproximado federal/estadual
  dataAutorizacao: string;
  protocoloAutorizacao: string;
}

interface PDVProps {
  clientes: Cliente[];
  pecas: Peca[];
  onUpdatePecas: (newPecas: Peca[]) => void;
  config: OficinaConfig;
}

export default function PDV({ clientes, pecas, onUpdatePecas, config }: PDVProps) {
  // Cart state
  const [cart, setCart] = useState<PDVItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Peca[]>([]);

  // Customer state
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [useConsumidorFinal, setUseConsumidorFinal] = useState(true);
  const [customCpf, setCustomCpf] = useState("");
  const [customNome, setCustomNome] = useState("");

  // Fiscal settings state
  const [serie, setSerie] = useState("001");
  const [numeroNota, setNumeroNota] = useState(1088);
  const [cfop, setCfop] = useState("5.102"); // Venda de mercadoria adquirida de terceiros
  const [aliquotaSimulada, setAliquotaSimulada] = useState(12.0); // ICMS / Simples Nacional médio
  const [faturamentoDeServicosPDV, setFaturamentoDeServicosPDV] = useState(0); // Optional services included directly

  // Payment states
  const [formaPagamento, setFormaPagamento] = useState<string>("DINHEIRO");
  const [valorPago, setValorPago] = useState<string>("");
  const [trocoCalculado, setTrocoCalculado] = useState(0);

  // Flow states
  const [transmitting, setTransmitting] = useState(false);
  const [fiscalReceiptReady, setFiscalReceiptReady] = useState<VendaPDV | null>(null);
  const [salesHistory, setSalesHistory] = useState<VendaPDV[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [sucessMessage, setSuccessMessage] = useState("");

  // Search filter
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = pecas.filter(
      p => p.descricao.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.fabricante.toLowerCase().includes(term)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchTerm, pecas]);

  // Load Sales History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("oficina_vendas_pdv");
    if (saved) {
      try {
        setSalesHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico do PDV:", e);
      }
    }
    // Set next invoice sequence
    const lastNum = localStorage.getItem("oficina_pdv_next_number");
    if (lastNum) {
      setNumeroNota(parseInt(lastNum));
    }
  }, []);

  // Autofill CPF / Name when customer selected
  useEffect(() => {
    if (selectedCliente) {
      setCustomNome(selectedCliente.nome);
      setCustomCpf(selectedCliente.cpfCnpj);
      setUseConsumidorFinal(false);
    } else {
      if (useConsumidorFinal) {
        setCustomNome("CONSUMIDOR FINAL NÃO IDENTIFICADO");
        setCustomCpf("999.999.999-99");
      } else {
        setCustomNome("");
        setCustomCpf("");
      }
    }
  }, [selectedCliente, useConsumidorFinal]);

  // Cart calculations
  const totalPecas = cart.reduce((sum, item) => sum + (item.quantidade * item.precoVenda), 0);
  const grandTotal = totalPecas + Number(faturamentoDeServicosPDV || 0);

  // Calculate change (troco)
  useEffect(() => {
    const paid = parseFloat(valorPago);
    if (!isNaN(paid) && paid >= grandTotal) {
      setTrocoCalculado(paid - grandTotal);
    } else {
      setTrocoCalculado(0);
    }
  }, [valorPago, grandTotal]);

  const addToCart = (peca: Peca) => {
    if (peca.estoque <= 0) {
      setErrorMessage(`Peça "${peca.descricao}" está esgotada no estoque!`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    // Check if already in cart
    const existing = cart.find(item => item.pecaId === peca.id);
    if (existing) {
      if (existing.quantidade >= peca.estoque) {
        setErrorMessage(`Limite de estoque atingido (${peca.estoque} un) para "${peca.descricao}"!`);
        setTimeout(() => setErrorMessage(""), 4000);
        return;
      }
      setCart(cart.map(item => 
        item.pecaId === peca.id ? { ...item, quantidade: item.quantidade + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: "cart_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        pecaId: peca.id,
        sku: peca.sku,
        descricao: peca.descricao,
        quantidade: 1,
        precoVenda: peca.precoVenda
      }]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const updateQuantity = (id: string, qty: number) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    const originalPeca = pecas.find(p => p.id === item.pecaId);
    if (!originalPeca) return;

    if (qty > originalPeca.estoque) {
      setErrorMessage(`Estoque insuficiente! Apenas ${originalPeca.estoque} unidades disponíveis.`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(cart.map(c => c.id === id ? { ...c, quantidade: qty } : c));
  };

  const updatePrice = (id: string, newPrice: number) => {
    if (newPrice < 0 || isNaN(newPrice)) return;
    setCart(cart.map(c => c.id === id ? { ...c, precoVenda: newPrice } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setFormaPagamento("DINHEIRO");
    setValorPago("");
    setTrocoCalculado(0);
    setFaturamentoDeServicosPDV(0);
  };

  // Simulation of SEFAZ authorization
  const handleTransmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMessage("Erro: Carrinho vazio! Adicione peças ou serviços.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    const paidVal = parseFloat(valorPago);
    if (formaPagamento === "DINHEIRO" && (isNaN(paidVal) || paidVal < grandTotal)) {
      setErrorMessage(`Por favor, indique um valor pago maior ou igual ao total de R$ ${grandTotal.toFixed(2)} para calcular o troco.`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    setTransmitting(true);
    setErrorMessage("");

    // Simulate Transmission handshake
    setTimeout(() => {
      // 1. Decrement actual virtual inventory stock pieces
      const updatedPecasList = pecas.map(p => {
        const cartItems = cart.filter(c => c.pecaId === p.id);
        const cartQty = cartItems.reduce((acc, curr) => acc + curr.quantidade, 0);
        if (cartQty > 0) {
          return {
            ...p,
            estoque: Math.max(0, p.estoque - cartQty)
          };
        }
        return p;
      });

      onUpdatePecas(updatedPecasList);

      // 2. Generate 44-digit NFC-e secure access key
      let randomChave = "352606" + Math.floor(Math.random() * 9).toString();
      for (let i = 0; i < 37; i++) {
        randomChave += Math.floor(Math.random() * 10).toString();
      }

      const ibptApproximatedTax = grandTotal * 0.1845; // 18.45% approx ibpt tax buffer
      const randomProtocol = "235" + Math.floor(1000000000 + Math.random() * 9000000000);

      const finalVenda: VendaPDV = {
        id: "vd_" + Date.now(),
        data: new Date().toISOString(),
        clienteNome: customNome || "CONSUMIDOR FINAL",
        clienteCpfCnpj: customCpf || "000.000.000-00",
        itens: cart.map(item => ({
          sku: item.sku,
          descricao: item.descricao,
          quantidade: item.quantidade,
          precoUnitario: item.precoVenda
        })),
        baseCalculoIcms: grandTotal,
        valorIcms: grandTotal * (aliquotaSimulada / 100),
        valorTotalPeças: totalPecas,
        valorMaoDeObra: Number(faturamentoDeServicosPDV) || 0,
        valorTotal: grandTotal,
        formaPagamento: formaPagamento,
        valorPago: formaPagamento === "DINHEIRO" ? (parseFloat(valorPago) || grandTotal) : grandTotal,
        troco: formaPagamento === "DINHEIRO" ? trocoCalculado : 0,
        chaveAcesso: randomChave,
        numeroNota: numeroNota,
        serie: serie,
        cfop: cfop,
        ibptTributos: ibptApproximatedTax,
        dataAutorizacao: new Date().toLocaleString("pt-BR"),
        protocoloAutorizacao: randomProtocol
      };

      // Save to localStorage list
      const nextHistory = [finalVenda, ...salesHistory];
      setSalesHistory(nextHistory);
      localStorage.setItem("oficina_vendas_pdv", JSON.stringify(nextHistory));
      
      // Update next invoice number
      const nextSeq = numeroNota + 1;
      setNumeroNota(nextSeq);
      localStorage.setItem("oficina_pdv_next_number", String(nextSeq));

      setTransmitting(false);
      setFiscalReceiptReady(finalVenda);
      setSuccessMessage("Cupom Fiscal Emitido e Transmitido com Sucesso!");
      setTimeout(() => setSuccessMessage(""), 4500);

      // Automatically open browser print/PDF viewport upon successful transmission
      handlePrintReceipt(finalVenda);

      // Clean the current active POS cart
      clearCart();
    }, 1800);
  };

  // Browser level fast focused print window method using iframe document builder
  const handlePrintReceipt = (venda: VendaPDV) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cupom Fiscal Eletrônico NFC-e</title>
        <style>
          @page { size: 80mm 200mm; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000;
            background: #fff;
            padding: 10px;
            width: 72mm;
            box-sizing: border-box;
            line-height: 1.2;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .bold { font-weight: bold; }
          .table { width: 100%; border-collapse: collapse; }
          .table td { padding: 2px 0; vertical-align: top; }
          .header-title { font-size: 14px; font-weight: bold; text-transform: uppercase; }
          .qrcode { width: 120px; height: 120px; margin: 10px auto; display: block; border: 2px solid #000; padding: 4px; }
          .footer { font-size: 9px; text-align: center; margin-top: 15px; }
          @media print {
            body { padding: 5px; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="header-title">${config?.nomeOficina || "CARTER'OS AUTO SHOP"}</div>
          <div>CNPJ: 14.288.930/0001-52 | IE: 110.239.549.111</div>
          <div>IM: ${config?.inscricaoMunicipal || "124.509/88"}</div>
          <div>${config?.endereco || "Endereço não cadastrado"}</div>
          <div>Tel: ${config?.telefone || "(11) 99999-7777"}</div>
        </div>
        <div class="divider"></div>
        <div class="text-center bold">DANFE NFC-e - documento auxiliar da nota fiscal de consumidor eletrônica</div>
        <div class="divider"></div>
        <table class="table">
          <thead>
            <tr class="bold">
              <td>ITEM / DESCRIÇÃO / SKU</td>
              <td class="text-center">QTD</td>
              <td class="text-right">V.UN</td>
              <td class="text-right">TOTAL</td>
            </tr>
          </thead>
          <tbody>
            ${venda.itens.map((it, idx) => `
              <tr>
                <td>${(idx + 1).toString().padStart(3, "0")} ${it.descricao} (${it.sku})</td>
                <td class="text-center">${it.quantidade}</td>
                <td class="text-right">${it.precoUnitario.toFixed(2)}</td>
                <td class="text-right">${(it.quantidade * it.precoUnitario).toFixed(2)}</td>
              </tr>
            `).join("")}
            ${venda.valorMaoDeObra > 0 ? `
              <tr>
                <td>000 SERVIÇOS DE ASSISTÊNCIA TÉCNICA</td>
                <td class="text-center">1</td>
                <td class="text-right">${venda.valorMaoDeObra.toFixed(2)}</td>
                <td class="text-right">${venda.valorMaoDeObra.toFixed(2)}</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
        <div class="divider"></div>
        <table class="table">
          <tr>
            <td class="bold">QTD. DE ITENS:</td>
            <td class="text-right font-medium">${venda.itens.length + (venda.valorMaoDeObra > 0 ? 1 : 0)}</td>
          </tr>
          <tr>
            <td class="bold">VALOR SUB-TOTAL:</td>
            <td class="text-right">R$ ${venda.valorTotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="bold">DESCONTOS:</td>
            <td class="text-right">R$ 0,00</td>
          </tr>
          <tr class="bold" style="font-size: 13px;">
            <td>VALOR TOTAL:</td>
            <td class="text-right">R$ ${venda.valorTotal.toFixed(2)}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <table class="table">
          <tr class="bold">
            <td>FORMA PAGAMENTO</td>
            <td class="text-right">VALOR PAGO</td>
          </tr>
          <tr>
            <td>${venda.formaPagamento}</td>
            <td class="text-right">R$ ${venda.valorPago.toFixed(2)}</td>
          </tr>
          ${venda.troco > 0 ? `
            <tr class="bold">
              <td>TROCO:</td>
              <td class="text-right">R$ ${venda.troco.toFixed(2)}</td>
            </tr>
          ` : ""}
        </table>
        <div class="divider"></div>
        <div class="text-center" style="font-size: 9px;">
          <div>Tributos Incidentes (Lei 12741/12): R$ ${venda.ibptTributos.toFixed(2)} (${(18.45).toFixed(2)}% aproximados)</div>
          <div>Cód. Consumidor: SP99281. CFOP: ${venda.cfop}</div>
        </div>
        <div class="divider"></div>
        <div class="text-center">
          <div class="bold">NFC-e Nº: ${venda.numeroNota.toString().padStart(6, "0")} Série: ${venda.serie}</div>
          <div>Data Emissão: ${venda.dataAutorizacao}</div>
          <div>Chave de Acesso NFC-e:</div>
          <div class="bold" style="font-size:9.5px; word-break: break-all;">${venda.chaveAcesso.match(/.{1,4}/g)?.join(" ") || venda.chaveAcesso}</div>
        </div>
        <div class="divider"></div>
        <div class="text-center">
          <div>Consumidor: ${venda.clienteNome}</div>
          <div>Documento: ${venda.clienteCpfCnpj}</div>
        </div>
        <div class="divider"></div>
        <div class="text-center">
          <div class="bold">PROTOCOLO DE AUTORIZAÇÃO</div>
          <div>${venda.protocoloAutorizacao} em ${venda.dataAutorizacao}</div>
          <div class="bold" style="margin-top:8px;">CONSULTE VIA LEITOR QR CODE</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://www.fazenda.sp.gov.br/nfce/consulta?chave=${venda.chaveAcesso}" class="qrcode" alt="QR Link" />
          <div>Obrigado pela preferência! Volte Sempre.</div>
        </div>
        <div class="footer">
          <div>Sistemas Karter'OS - Frente de Caixa PDV</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 text-white font-sans max-w-7xl mx-auto">
      {/* Top action layout info row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white/5 border border-white/10 rounded-2xl gap-4 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-600 rounded-lg text-slate-900">
              <ShoppingCart className="w-5 h-5 text-slate-950" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Frente de Caixa PDV & Cupom Fiscal NFC-e</h2>
          </div>
          <p className="text-xs text-slate-400">
            Ponto de Venda integrado para checkout rápido de autopeças e serviços urgentes com transmissão SEFAZ imediata
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFiscalReceiptReady(null)}
            className={`px-3.5 py-1.5 rounded-xl border transition text-xxs font-bold ${
              !fiscalReceiptReady 
                ? "bg-orange-550 border-orange-550 text-slate-950 font-black" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            PDV Ative Checkout
          </button>
          <button
            type="button"
            onClick={() => {
              // Trigger a dummy simulation template representing last index or generic blank
              if (salesHistory.length > 0) {
                setFiscalReceiptReady(salesHistory[0]);
              } else {
                setErrorMessage("Nenhum cupom fiscal emitido nesta sessão para visualizar!");
                setTimeout(() => setErrorMessage(""), 3500);
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl border transition text-xxs font-bold ${
              fiscalReceiptReady 
                ? "bg-orange-550 border-orange-550 text-slate-905 font-black" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            Ver Última Emissão
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 animate-bounce">
          <Info className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {sucessMessage && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs flex items-center gap-2.5 animate-pulse">
          <FileCheck2 className="w-4 h-4 shrink-0" />
          <span>{sucessMessage}</span>
        </div>
      )}

      {fiscalReceiptReady ? (
        /* FISCAL EMISSION PREVIEW OR SAVE TO PDF AND PRINT ACTION SHEET */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 bg-slate-900 border border-white/10 rounded-2xl backdrop-blur-xl">
            <span className="text-xxs text-emerald-400 font-extrabold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full mb-3 uppercase font-mono border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Autorizado pelo SEFAZ (Em Produção)
            </span>

            {/* Thermal Receipt view mock mockup */}
            <div id="receipt-thermal" className="w-[300px] border-l-4 border-r-4 border-slate-300 bg-white text-slate-950 p-5 rounded font-mono text-[10px] space-y-1 select-none shadow-2xl relative">
              <div className="text-center font-sans">
                <p className="text-xs font-black uppercase text-slate-900 leading-3">{config?.nomeOficina || "A Oficina Karter'OS"}</p>
                <p className="text-[8px] text-slate-500 leading-tight">CNPJ: 14.288.930/0001-52 | IE: 110.239.549.111</p>
                <p className="text-[8px] text-slate-500 leading-tight truncate">{config?.endereco}</p>
                <p className="text-[8px] text-slate-500 leading-tight">Tel: {config?.telefone || "(11) 99999-7777"}</p>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2"></div>
              <p className="text-center font-black">DANFE NFC-e - DOCUMENTO AUXILIAR DE NOTA FISCAL</p>
              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <table className="w-full text-left text-[9px] leading-tight">
                <thead>
                  <tr className="font-extrabold border-b border-dashed border-slate-305 text-slate-800">
                    <td className="py-0.5">ITEM/DESC (SKU)</td>
                    <td className="text-center py-0.5">QTD</td>
                    <td className="text-right py-0.5">V.UN</td>
                    <td className="text-right py-0.5">VALOR</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-slate-200">
                  {fiscalReceiptReady.itens.map((it, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-1 shrink max-w-[120px] truncate">
                        {(idx + 1).toString().padStart(3, "0")} {it.descricao} ({it.sku})
                      </td>
                      <td className="text-center py-1 font-bold">{it.quantidade}</td>
                      <td className="text-right py-1">{it.precoUnitario.toFixed(2)}</td>
                      <td className="text-right py-1 font-bold text-slate-950">{(it.quantidade * it.precoUnitario).toFixed(2)}</td>
                    </tr>
                  ))}
                  {fiscalReceiptReady.valorMaoDeObra > 0 && (
                    <tr className="text-slate-700">
                      <td className="py-1 shrink max-w-[120px] truncate">
                        001 SERVIÇOS TÉCNICOS DETALHADOS
                      </td>
                      <td className="text-center py-1 font-bold">1</td>
                      <td className="text-right py-1">{fiscalReceiptReady.valorMaoDeObra.toFixed(2)}</td>
                      <td className="text-right py-1 font-bold text-slate-950">{fiscalReceiptReady.valorMaoDeObra.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <div className="space-y-0.5 text-[9px] text-slate-800">
                <div className="flex justify-between">
                  <span>QTD. TOTAL DE ITENS:</span>
                  <span className="font-bold">{fiscalReceiptReady.itens.length + (fiscalReceiptReady.valorMaoDeObra > 0 ? 1 : 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VALOR BRUTO:</span>
                  <span>R$ {fiscalReceiptReady.valorTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DESCONTO:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between font-extrabold text-[10px] text-slate-950">
                  <span>VALOR FINAL:</span>
                  <span>R$ {fiscalReceiptReady.valorTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <div className="space-y-0.5 text-[9px] text-slate-800">
                <div className="flex justify-between font-bold">
                  <span>FORMA PAGAMENTO</span>
                  <span>PAGO</span>
                </div>
                <div className="flex justify-between">
                  <span>{fiscalReceiptReady.formaPagamento}</span>
                  <span>R$ {fiscalReceiptReady.valorPago.toFixed(2)}</span>
                </div>
                {fiscalReceiptReady.troco > 0 && (
                  <div className="flex justify-between font-extrabold text-slate-950">
                    <span>TROCO:</span>
                    <span>R$ {fiscalReceiptReady.troco.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <div className="text-center text-[7.5px] text-slate-500 font-sans">
                Tributos Aproximados (Lei 12.741/12): R$ {fiscalReceiptReady.ibptTributos.toFixed(2)} ({18.45}%)
              </div>

              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <div className="text-center space-y-0.5 text-[8px] text-slate-700">
                <p className="font-bold">NFC-e Nº: {fiscalReceiptReady.numeroNota.toString().padStart(6, "0")} Série: {fiscalReceiptReady.serie}</p>
                <p>Emissão: {fiscalReceiptReady.dataAutorizacao}</p>
                <p className="font-bold">Chave de Acesso:</p>
                <p className="text-[7.5px] font-mono leading-tight whitespace-normal tracking-wide bg-slate-100 p-1 border border-slate-200 break-all select-all">
                  {fiscalReceiptReady.chaveAcesso.match(/.{1,4}/g)?.join(" ") || fiscalReceiptReady.chaveAcesso}
                </p>
                <p className="font-bold mt-1">Consumidor: {fiscalReceiptReady.clienteNome}</p>
                <p>CPF: {fiscalReceiptReady.clienteCpfCnpj}</p>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2"></div>

              <div className="flex flex-col items-center justify-center text-center text-[8px] text-slate-705">
                <p className="font-bold">Protocolo de Autorização:</p>
                <p>{fiscalReceiptReady.protocoloAutorizacao}</p>
                
                {/* Simulated QR Code for scanner scan */}
                <div className="my-2 bg-slate-950 p-1.5 rounded">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <p className="text-[7.5px] text-slate-400 italic">Consulta pelo leitor de QR Code do SEFAZ-SP</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                <Info className="w-4 h-4 text-orange-400" /> Transmissão Concluída (SEFAZ-SP)
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                A nota de cupom fiscal de venda eletrônica de mercadorias no varejo (NFC-e número <strong className="text-orange-400">#{fiscalReceiptReady.numeroNota}</strong>) 
                foi gerada, assinada digitalmente com certificado A1 e transmitida com sucesso para o banco de dados do SEFAZ estadual.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xxs font-mono bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-450 block uppercase text-[10px]">Número Gerado:</span>
                  <span className="text-white font-extrabold text-[11px]">{fiscalReceiptReady.numeroNota}</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase text-[10px]">Série Emissor:</span>
                  <span className="text-white font-extrabold text-[11px]">{fiscalReceiptReady.serie}</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase text-[10px]">Protocolo SEFAZ:</span>
                  <span className="text-white font-extrabold text-[11px]">{fiscalReceiptReady.protocoloAutorizacao}</span>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <span className="text-slate-450 block uppercase text-[10px]">Chave SEFAZ:</span>
                  <span className="text-orange-350 block leading-tight text-[10px] break-all">{fiscalReceiptReady.chaveAcesso}</span>
                </div>
              </div>

              {/* Printing & Saving triggers */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase font-extrabold text-slate-450 block tracking-wider">Ações de Entrega do Cupom</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(fiscalReceiptReady)}
                    className="p-3 bg-orange-600 hover:bg-orange-550 text-slate-905 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
                  >
                    <Printer className="w-5 h-5 text-slate-950" />
                    <span>Nativo do Emissor: Imprimir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Trigger PRINT, and instruct user how to Save as PDF natively
                      handlePrintReceipt(fiscalReceiptReady);
                      setSuccessMessage("Para salvar em PDF: Selecione 'Salvar como PDF' na caixa de destino de impressão.");
                      setTimeout(() => setSuccessMessage(""), 6000);
                    }}
                    className="p-3 bg-emerald-600 hover:bg-emerald-550 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition border border-emerald-500/30 cursor-pointer"
                  >
                    <FileDown className="w-5 h-5 text-white" />
                    <span>Salvar Cupom em PDF</span>
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-450 leading-relaxed italic text-center text-slate-400 mt-1">
                  * Dica: Ao clicar em "Salvar Cupom em PDF" ou "Imprimir", a tela de impressão do navegador será disparada. Basta alterar o destino de sua impressora física para a opção "Salvar como PDF" do próprio navegador.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setFiscalReceiptReady(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition border border-white/10"
                >
                  Voltar ao PDV Ativo
                </button>
              </div>
            </div>

            {/* Historical list */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico Recente de Notas e Cupons Emitidos</h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {salesHistory.slice(1).map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between items-center text-xxs font-mono">
                    <div className="space-y-1">
                      <p className="font-bold text-white">NFC-e #{s.numeroNota} - {s.clienteNome}</p>
                      <p className="text-[10px] text-slate-400">{new Date(s.data).toLocaleDateString()} - R$ {s.valorTotal.toFixed(2)} ({s.formaPagamento})</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFiscalReceiptReady(s)}
                        className="p-1 px-2.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-orange-400 font-bold hover:text-white transition cursor-pointer"
                        title="Ver Cupom Completo"
                      >
                        Selecionar
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(s)}
                        className="p-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                        title="Imprimir Imagem Térmica"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {salesHistory.length <= 1 && (
                  <p className="text-slate-500 text-xxs italic">Nenhuma outra venda registrada no histórico recente do PDV.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE ACTIVE TERMINAL CHECKOUT INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: CART SELECTION AND ITEM CUSTOMIZATIONS */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-orange-400">1. Pesquise e Adicione Peças ou Acessórios</h3>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquise peça pelo Nome, Código SKU ou Fabricante do Carro..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Drop suggestions list */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1.5 bg-slate-900 border border-white/15 rounded-xl shadow-2xl divide-y divide-white/5 overflow-hidden">
                    {searchResults.map((p) => {
                      const isOutOfStock = p.estoque <= 0;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 flex justify-between items-center transition text-xxs font-sans ${
                            isOutOfStock ? "bg-slate-950/50 cursor-not-allowed opacity-55" : "hover:bg-white/5 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isOutOfStock) addToCart(p);
                          }}
                        >
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-white">{p.descricao}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {p.sku} | <span className="font-bold">Fabricante: {p.fabricante}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-orange-400 text-xs font-mono">{formatCurrency(p.precoVenda)}</p>
                            <p className="text-[9.5px] text-slate-450">
                              {isOutOfStock ? "SGOTADO" : `Qtd em Estoque: ${p.estoque}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CART ELEMENT */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-orange-400 flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-orange-400" /> Itens no Carrinho Ativo
                </h3>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-350 text-xxs cursor-pointer flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Esvaziar Carrinho
                  </button>
                )}
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3 select-none max-h-[400px] overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const original = pecas.find(p => p.id === item.pecaId);
                    return (
                      <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-white text-xs">{item.descricao}</p>
                            <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-950/40 px-1.5 py-0.5 rounded border border-white/5">
                              SKU: {item.sku}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-350 p-1 cursor-pointer transition"
                            title="Remover Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Interactive edit of items, stock count validation, and prices directly on PDV (frente de caixa), as requested! */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 items-end text-xxs">
                          <div>
                            <label className="text-[9px] block uppercase font-bold text-slate-450 mb-1.5">Quantidade</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                                className="px-2 py-1 bg-slate-950 border border-white/10 text-slate-310 hover:bg-white/5 text-xxs font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                className="w-12 text-center py-1 bg-slate-950 border-t border-b border-white/10 text-white font-mono text-xs focus:outline-none"
                                value={item.quantidade}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                                className="px-2 py-1 bg-slate-950 border border-white/10 text-slate-310 hover:bg-white/5 text-xxs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] block uppercase font-bold text-slate-450 mb-1.5">Preço Unitário (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full bg-slate-950 border border-white/10 px-2 py-1.5 rounded text-white text-xs font-mono"
                              value={item.precoVenda}
                              onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="text-slate-400 text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Estoque Virtual</span>
                            <span className="font-mono text-slate-300 font-extrabold">{original ? original.estoque : "N/A"} un</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Subtotal</span>
                            <span className="font-mono text-orange-400 font-extrabold text-sm">{formatCurrency(item.quantidade * item.precoVenda)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-slate-550 flex flex-col items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-slate-600 mb-2.5 animate-pulse" />
                  <p className="text-xs text-slate-400 font-medium">Nenhum item adicionado no cupom de venda.</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Use a barra de pesquisa acima para selecionar e inserir mercadorias.</p>
                </div>
              )}
            </div>

            {/* Quick addition of simple manual labor or services to Cupom Fiscal */}
            <div className="p-4 bg-slate-950/20 border border-white/10 rounded-xl space-y-2.5">
              <span className="text-xxs uppercase font-extrabold text-orange-405 text-orange-400 block tracking-wider">
                Serviços Adicionais Rápidos no Cupom
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">Valor do Serviço de Mão de Obra (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 50.00"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600"
                    value={faturamentoDeServicosPDV || ""}
                    onChange={(e) => setFaturamentoDeServicosPDV(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="flex items-center text-slate-400 text-[10px] italic pt-3">
                  <Info className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                  <span>Se houver prestação de assistência rápida, insira o valor diretamente para incidir no cálculo do tributo.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: FISCAL PARAMETERS & CHECKOUT TRANSACTIONS */}
          <form onSubmit={handleTransmitReceipt} className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-5">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-orange-400 pb-2 border-b border-white/5">
                2. Informações de Identificação Fiscal (NFC-e)
              </h3>

              {/* Consumer choice toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xxs font-bold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="consumer"
                    checked={useConsumidorFinal}
                    onChange={() => {
                      setUseConsumidorFinal(true);
                      setSelectedCliente(null);
                    }}
                    className="text-orange-500 focus:ring-orange-550"
                  />
                  <span>Consumidor Final Não Identificado</span>
                </label>
                
                <label className="flex items-center gap-2 text-xxs font-bold cursor-pointer select-none">
                  <input
                    type="radio"
                    name="consumer"
                    checked={!useConsumidorFinal}
                    onChange={() => setUseConsumidorFinal(false)}
                    className="text-orange-500 focus:ring-orange-555"
                  />
                  <span>Identificar Cliente do CRM</span>
                </label>
              </div>

              {!useConsumidorFinal && (
                <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selecione o Cliente *</label>
                    <select
                      value={selectedCliente?.id || ""}
                      onChange={(e) => {
                        const found = clientes.find(c => c.id === e.target.value);
                        setSelectedCliente(found || null);
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required={!useConsumidorFinal}
                    >
                      <option value="">-- Escolher Cliente da Lista CRM --</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.cpfCnpj})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Show input read-only or manual modifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xxs font-mono">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase mb-1 font-sans">CPF / CNPJ do Destinatário</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    value={customCpf}
                    onChange={(e) => setCustomCpf(e.target.value)}
                    placeholder="999.999.999-99"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase mb-1 font-sans">Razão Social / Nome</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    value={customNome}
                    onChange={(e) => setCustomNome(e.target.value)}
                    placeholder="CONSUMIDOR FINAL"
                  />
                </div>
              </div>

              {/* Advanced Fiscal parameters block */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3 text-xxs">
                <span className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider">Parâmetros Tributários de Autorização</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                  <div>
                    <label className="text-[9px] block text-slate-450 uppercase font-sans">Série do Emissor</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center font-bold"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] block text-slate-450 uppercase font-sans">Próximo Nº Nota</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center font-bold"
                      value={numeroNota}
                      onChange={(e) => setNumeroNota(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] block text-slate-450 uppercase font-sans">CFOP Venda</label>
                    <select
                      className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center font-bold"
                      value={cfop}
                      onChange={(e) => setCfop(e.target.value)}
                    >
                      <option value="5.102">5.102 - Com. Adq. Terc</option>
                      <option value="5.405">5.405 - Subst. Trib</option>
                      <option value="5.101">5.101 - Fab. Próprio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xxs font-mono">
                  <div>
                    <label className="text-[9px] block text-slate-450 uppercase font-sans">Alíquota ICMS (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1 text-white font-bold"
                      value={aliquotaSimulada}
                      onChange={(e) => setAliquotaSimulada(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center text-slate-500 font-sans italic text-[9.5px]">
                    Of Oficina enquadrada no regime tributário: Simples Nacional - Alíquota simulada.
                  </div>
                </div>
              </div>
            </div>

            {/* CHECKOUT TOTAL AND PAYMENT SELECTION */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-5">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-orange-400 pb-2 border-b border-white/5">
                3. Totalizador & Forma de Pagamento
              </h3>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-sans">Soma Produtos</span>
                  <span className="text-white font-bold">{formatCurrency(totalPecas)}</span>
                </div>
                {faturamentoDeServicosPDV > 0 && (
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-sans">Soma Serviços</span>
                    <span className="text-white font-bold">{formatCurrency(faturamentoDeServicosPDV)}</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-orange-400 text-[10px] block font-extrabold uppercase font-sans">VALOR TOTAL DO CUPOM</span>
                  <span className="text-xl font-black text-orange-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="space-y-3 text-xxs font-bold">
                <label className="text-slate-400 uppercase tracking-wide block">Forma de Pagamento Preferencial</label>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "DINHEIRO", icon: DollarSign, label: "Dinheiro" },
                    { id: "PIX", icon: Coins, label: "PIX Digital" },
                    { id: "CREDITO", icon: CreditCard, label: "Cartão de Crédito" },
                    { id: "DEBITO", icon: CreditCard, label: "Cartão de Débito" }
                  ].map((p) => {
                    const ItemIcon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormaPagamento(p.id);
                          if (p.id !== "DINHEIRO") {
                            setValorPago("");
                          }
                        }}
                        className={`p-3 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
                          formaPagamento === p.id 
                            ? "bg-orange-600/10 border-orange-500 text-orange-400 font-extrabold shadow-md shadow-orange-500/5 animate-pulse" 
                            : "border-white/10 hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0 text-orange-400" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount paid / Change calculator if Dinheiro */}
              {formaPagamento === "DINHEIRO" && (
                <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-slate-950/40 rounded-xl border border-white/5 font-mono text-xxs animate-fade-in">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 text-orange-400">Dinheiro Recebido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 50.00"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                    />
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Troco a Devolver</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatCurrency(trocoCalculado)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submission CTA transmission button */}
              <button
                type="submit"
                disabled={cart.length === 0 || transmitting}
                className={`w-full p-4 font-extrabold text-slate-905 rounded-2xl flex items-center justify-center gap-2.5 select-none transition border duration-200 cursor-pointer text-xs ${
                  cart.length === 0 
                    ? "bg-white/5 hover:bg-white/5 text-slate-550 border-white/5 cursor-not-allowed" 
                    : "bg-orange-600 hover:bg-orange-550 border-orange-605 text-slate-950 font-black shadow-lg shadow-orange-600/10"
                }`}
              >
                {transmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                    <span>Conectando SEFAZ & Transmitindo Cupom...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-5 h-5 text-slate-950" />
                    <span>Emitir & Transmitir Cupom Fiscal (NFC-e)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
