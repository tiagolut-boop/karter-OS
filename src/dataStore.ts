import { Cliente, Veiculo, Peca, Mecanico, OrdemServico, Orcamento, Operador, OficinaConfig } from "./types";

const INITIAL_OPERADORES: Operador[] = [
  {
    id: "ope_1",
    nome: "Operador de Vendas",
    usuario: "vendedor",
    senha: "123",
    modulosPermitidos: ["dashboard", "clientes", "veiculos", "orcamentos"]
  },
  {
    id: "ope_2",
    nome: "Operador Técnico",
    usuario: "tecnico",
    senha: "123",
    modulosPermitidos: ["dashboard", "ordens", "estoque"]
  }
];

const INITIAL_CONFIG: OficinaConfig = {
  nomeOficina: "Oficina Mecânica Karter'OS",
  telefone: "(11) 99999-7777",
  endereco: "Av. do Estado, 5000 - Centro, São Paulo - SP",
  requireEvidenceToClose: false,
  standardDiscountLimitPercent: 15,
  showLogoInNF: true,
  showLogoInOrcamento: true,
  showLogoInOS: true,
  email: "contato@karteros.com.br",
  inscricaoMunicipal: "124.509/88",
  regimeTributacao: "Simples Nacional",
  localPrestacao: "No município",
  modoPrestacao: "Tributação no município",
  codigoServicoLC116: "14.01 - Conserto, restauração, manutenção e conservação de máquinas, veículos, aparelhos",
  aliquotaIss: 5.0
};

// Seed Data definition
const INITIAL_CLIENTES: Cliente[] = [
  {
    id: "cli_1",
    nome: "João Silva",
    email: "joao@silva.com",
    telefone: "(11) 98765-4321",
    cpfCnpj: "123.456.789-00",
    endereco: "Rua das Flores, 123 - Jardins, São Paulo - SP",
    dataNascimento: "1985-06-12", // Birthday in June (Aniversário perto!)
  },
  {
    id: "cli_2",
    nome: "Maria Oliveira",
    email: "maria@oliveira.com",
    telefone: "(11) 99999-8888",
    cpfCnpj: "987.654.321-11",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    dataNascimento: "1990-11-23",
  },
  {
    id: "cli_3",
    nome: "Carlos Souza",
    email: "carlos@souza.com",
    telefone: "(21) 97123-4567",
    cpfCnpj: "111.222.333-44",
    endereco: "Rua Copacabana, 45 - Copacabana, Rio de Janeiro - RJ",
    dataNascimento: "1978-06-28", // Also June!
  },
  {
    id: "cli_4",
    nome: "Ana Carolina Santos",
    email: "ana.carol@hotmail.com",
    telefone: "(31) 98877-6655",
    cpfCnpj: "444.555.666-77",
    endereco: "Av. do Contorno, 4500 - Savassi, Belo Horizonte - MG",
    dataNascimento: "1995-04-05",
  }
];

const INITIAL_VEICULOS: Veiculo[] = [
  {
    id: "vei_1",
    clienteId: "cli_1",
    placa: "BRA2E19",
    marca: "Volkswagen",
    modelo: "Gol Trendline",
    ano: "2018",
    motor: "1.0 MPI",
    cor: "Vermelho",
    km: 72450,
  },
  {
    id: "vei_2",
    clienteId: "cli_1",
    placa: "PLO9I45",
    marca: "Honda",
    modelo: "Civic EXL",
    ano: "2020",
    motor: "2.0 Flex",
    cor: "Preto",
    km: 45200, // Multi-veículo para o João!
  },
  {
    id: "vei_3",
    clienteId: "cli_2",
    placa: "ONI4X22",
    marca: "Chevrolet",
    modelo: "Onix LTZ",
    ano: "2019",
    motor: "1.4 Active",
    cor: "Prata",
    km: 55410,
  },
  {
    id: "vei_4",
    clienteId: "cli_3",
    placa: "KAS1F88",
    marca: "Ford",
    modelo: "Ka SE Plus",
    ano: "2017",
    motor: "1.0 TiVCT",
    cor: "Branco",
    km: 98110,
  }
];

const INITIAL_PECAS: Peca[] = [
  {
    id: "pec_1",
    sku: "PST-3022",
    descricao: "Pastilha de Freio Dianteira",
    fabricante: "Bosch",
    estoque: 15,
    precoCusto: 80.0,
    precoVenda: 180.0,
  },
  {
    id: "pec_2",
    sku: "FLT-5011",
    descricao: "Filtro de Óleo Fram",
    fabricante: "Fram",
    estoque: 3, // ALERTA CRÍTICO (< 5 unidades)
    precoCusto: 20.0,
    precoVenda: 45.0,
  },
  {
    id: "pec_3",
    sku: "VL-NGK9",
    descricao: "Jogo de Velas de Ignição",
    fabricante: "NGK",
    estoque: 24,
    precoCusto: 45.0,
    precoVenda: 110.0,
  },
  {
    id: "pec_4",
    sku: "AMT-8822",
    descricao: "Amortecedor Dianteiro",
    fabricante: "Monroe",
    estoque: 2, // ALERTA CRÍTICO (< 5 unidades)
    precoCusto: 250.0,
    precoVenda: 480.0,
  },
  {
    id: "pec_5",
    sku: "OL-5W30",
    descricao: "Óleo Motor Sintético 5W30 (Litro)",
    fabricante: "Castrol",
    estoque: 42,
    precoCusto: 35.0,
    precoVenda: 75.0,
  },
  {
    id: "pec_6",
    sku: "COR-9034",
    descricao: "Correia Dentada",
    fabricante: "Dayco",
    estoque: 8,
    precoCusto: 60.0,
    precoVenda: 135.0,
  }
];

const INITIAL_MECANICOS: Mecanico[] = [
  {
    id: "mec_1",
    nome: "Roberto Beto Almeida",
    especialidade: "Suspensão, Freios e Direção",
    comissaoPercentual: 12,
  },
  {
    id: "mec_2",
    nome: "Marcos Eletrônica",
    especialidade: "Injeção Eletrônica e Diagnóstico",
    comissaoPercentual: 10,
  },
  {
    id: "mec_3",
    nome: "Sandra Lima",
    especialidade: "Motores, Cabeçote e Câmbio",
    comissaoPercentual: 15,
  }
];

const INITIAL_ORDENS: OrdemServico[] = [
  {
    id: "os_1",
    veiculoId: "vei_1",
    clienteId: "cli_1",
    mecanicoId: "mec_1",
    dataAbertura: "2026-05-10",
    dataConclusao: "2026-05-12",
    status: "Concluído",
    kmAtual: 71500,
    descricaoProblema: "Revisão dos freios e troca de óleo mensal",
    servicosRealizados: "Substituição de pastilhas de freio dianteiras, troca do óleo do motor e limpeza geral",
    pecasUtilizadas: [
      { pecaId: "pec_1", quantidade: 1, precoUnitario: 180.0 }, // Pastilhas
      { pecaId: "pec_5", quantidade: 4, precoUnitario: 75.0 }  // 4 litros óleo
    ],
    valorMaoDeObra: 150.0,
    valorTotal: 630.0, // 180 + 300 + 150
    nfeEmitida: true,
    nfseEmitida: true,
    nfeChave: "35260512345678901234550010000001011002345678",
    nfseChave: "20260000000101A",
  },
  {
    id: "os_2",
    veiculoId: "vei_3",
    clienteId: "cli_2",
    mecanicoId: "mec_2",
    dataAbertura: "2026-05-24",
    dataConclusao: "2026-05-25",
    status: "Concluído",
    kmAtual: 55410,
    descricaoProblema: "Motor falhando em subidas",
    servicosRealizados: "Instalação de novas velas de ignição e troca do filtro de óleo obstruído",
    pecasUtilizadas: [
      { pecaId: "pec_3", quantidade: 1, precoUnitario: 110.0 }, // Jogo de Velas
      { pecaId: "pec_2", quantidade: 1, precoUnitario: 45.0 }   // Filtro de Óleo
    ],
    valorMaoDeObra: 220.0,
    valorTotal: 375.0, // 110 + 45 + 220
    nfeEmitida: true,
    nfseEmitida: false,
    nfeChave: "35260598765432109876550010000001011009876543",
  },
  {
    id: "os_3",
    veiculoId: "vei_4",
    clienteId: "cli_3",
    mecanicoId: "mec_3",
    dataAbertura: "2026-06-01", // Hoje!
    status: "Em Andamento",
    kmAtual: 98110,
    descricaoProblema: "Barulho forte batendo ferro com ferro na suspensão dianteira esquerda",
    servicosRealizados: "Em análise. Provável necessidade de substituição de amortecedores e batentes.",
    pecasUtilizadas: [],
    valorMaoDeObra: 180.0,
    valorTotal: 180.0,
  }
];

const INITIAL_ORCAMENTOS: Orcamento[] = [
  {
    id: "orc_1",
    veiculoId: "vei_1",
    clienteId: "cli_1",
    mecanicoId: "mec_1",
    dataAbertura: "2026-06-02",
    dataValidade: "2026-06-12",
    status: "Pendente",
    kmAtual: 72450,
    descricaoProblema: "Revisão preventiva da correia dentada e vazamento de fluido",
    servicosOrcados: "Substituição da correia dentada e bomba d'água, higienização do sistema",
    maoDeObraAprovada: false,
    pecasUtilizadas: [
      { pecaId: "pec_6", quantidade: 1, precoUnitario: 135.0, aprovada: false }, // Correia Dentada (Dayco)
      { pecaId: "pec_5", quantidade: 2, precoUnitario: 75.0, aprovada: false }   // Litros óleo
    ],
    valorMaoDeObra: 250.0,
    valorTotal: 535.0
  },
  {
    id: "orc_2",
    veiculoId: "vei_4",
    clienteId: "cli_3",
    mecanicoId: "mec_3",
    dataAbertura: "2026-05-15",
    dataValidade: "2026-05-25",
    status: "Autorizado Parcial",
    kmAtual: 98110,
    descricaoProblema: "Ar condicionado não gela e ruído ao frear",
    servicosOrcados: "Carga de gás refrigerante, troca do filtro e troca de pastilhas dianteiras",
    maoDeObraAprovada: true,
    pecasUtilizadas: [
      { pecaId: "pec_1", quantidade: 1, precoUnitario: 180.0, aprovada: true },  // Pastilha de Freio (aprovado)
      { pecaId: "pec_4", quantidade: 1, precoUnitario: 480.0, aprovada: false }  // Amortecedor Dianteiro (ficou pendente)
    ],
    valorMaoDeObra: 190.0,
    valorTotal: 850.0
  }
];

export const getStoredData = () => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) {
    return {
      clientes: INITIAL_CLIENTES,
      veiculos: INITIAL_VEICULOS,
      pecas: INITIAL_PECAS,
      mecanicos: INITIAL_MECANICOS,
      ordens: INITIAL_ORDENS,
      orcamentos: INITIAL_ORCAMENTOS,
      operadores: INITIAL_OPERADORES,
      config: INITIAL_CONFIG,
    };
  }

  let clientesRaw = localStorage.getItem("oficina_clientes");
  let veiculosRaw = localStorage.getItem("oficina_veiculos");
  let pecasRaw = localStorage.getItem("oficina_pecas");
  let mecanicosRaw = localStorage.getItem("oficina_mecanicos");
  let ordensRaw = localStorage.getItem("oficina_ordens");
  let orcamentosRaw = localStorage.getItem("oficina_orcamentos");
  let operadoresRaw = localStorage.getItem("oficina_operadores");
  let configRaw = localStorage.getItem("oficina_config");

  if (!clientesRaw) {
    localStorage.setItem("oficina_clientes", JSON.stringify(INITIAL_CLIENTES));
    clientesRaw = JSON.stringify(INITIAL_CLIENTES);
  }
  if (!veiculosRaw) {
    localStorage.setItem("oficina_veiculos", JSON.stringify(INITIAL_VEICULOS));
    veiculosRaw = JSON.stringify(INITIAL_VEICULOS);
  }
  if (!pecasRaw) {
    localStorage.setItem("oficina_pecas", JSON.stringify(INITIAL_PECAS));
    pecasRaw = JSON.stringify(INITIAL_PECAS);
  }
  if (!mecanicosRaw) {
    localStorage.setItem("oficina_mecanicos", JSON.stringify(INITIAL_MECANICOS));
    mecanicosRaw = JSON.stringify(INITIAL_MECANICOS);
  }
  if (!ordensRaw) {
    localStorage.setItem("oficina_ordens", JSON.stringify(INITIAL_ORDENS));
    ordensRaw = JSON.stringify(INITIAL_ORDENS);
  }
  if (!orcamentosRaw) {
    localStorage.setItem("oficina_orcamentos", JSON.stringify(INITIAL_ORCAMENTOS));
    orcamentosRaw = JSON.stringify(INITIAL_ORCAMENTOS);
  }
  if (!operadoresRaw) {
    localStorage.setItem("oficina_operadores", JSON.stringify(INITIAL_OPERADORES));
    operadoresRaw = JSON.stringify(INITIAL_OPERADORES);
  }
  if (!configRaw) {
    localStorage.setItem("oficina_config", JSON.stringify(INITIAL_CONFIG));
    configRaw = JSON.stringify(INITIAL_CONFIG);
  }

  return {
    clientes: JSON.parse(clientesRaw),
    veiculos: JSON.parse(veiculosRaw),
    pecas: JSON.parse(pecasRaw),
    mecanicos: JSON.parse(mecanicosRaw),
    ordens: JSON.parse(ordensRaw),
    orcamentos: JSON.parse(orcamentosRaw),
    operadores: JSON.parse(operadoresRaw),
    config: JSON.parse(configRaw),
  };
};

export const saveStoredData = (data: {
  clientes: Cliente[];
  veiculos: Veiculo[];
  pecas: Peca[];
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
  orcamentos: Orcamento[];
  operadores?: Operador[];
  config?: OficinaConfig;
}) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("oficina_clientes", JSON.stringify(data.clientes));
  localStorage.setItem("oficina_veiculos", JSON.stringify(data.veiculos));
  localStorage.setItem("oficina_pecas", JSON.stringify(data.pecas));
  localStorage.setItem("oficina_mecanicos", JSON.stringify(data.mecanicos));
  localStorage.setItem("oficina_ordens", JSON.stringify(data.ordens));
  localStorage.setItem("oficina_orcamentos", JSON.stringify(data.orcamentos));
  if (data.operadores) {
    localStorage.setItem("oficina_operadores", JSON.stringify(data.operadores));
  }
  if (data.config) {
    localStorage.setItem("oficina_config", JSON.stringify(data.config));
  }
};

// DETRAN SIMULATION API
export interface DetranResponse {
  marca: string;
  modelo: string;
  ano: string;
  motor: string;
  cor: string;
  chassi?: string;
  renavam?: string;
  municipio?: string;
  uf?: string;
  api_status?: string;
  api_source?: string;
  api_error?: string;
}

const VEICULO_TEMPLATES: { marca: string; modelo: string; ano: string; motor: string; cor: string }[] = [
  { marca: "Toyota", modelo: "Corolla XEi", ano: "2021", motor: "2.0 Dynamic Force", cor: "Prata" },
  { marca: "Hyundai", modelo: "HB20 Comfort", ano: "2022", motor: "1.0 TGDI", cor: "Branco" },
  { marca: "Chevrolet", modelo: "Tracker Premier", ano: "2020", motor: "1.2 Turbo", cor: "Cinza Metálico" },
  { marca: "Jeep", modelo: "Compass Longitude", ano: "2019", motor: "2.0 Flex", cor: "Azul Marinho" },
  { marca: "Renault", modelo: "Sandero Stepway", ano: "2018", motor: "1.6 SCe", cor: "Laranja" },
  { marca: "Fiat", modelo: "Mobi Like", ano: "2023", motor: "1.0 Firefly", cor: "Preto" },
  { marca: "Honda", modelo: "HR-V EXL", ano: "2021", motor: "1.8 i-VTEC", cor: "Vinho" },
  { marca: "Volkswagen", modelo: "Polo Highline", ano: "2022", motor: "1.0 200 TSI", cor: "Cinza Platinum" },
];

export const simulateDetranAPI = async (placa: string): Promise<DetranResponse> => {
  const cleanPlaca = placa.toUpperCase().replace(/[^A-Z0-9]/gi, "").trim();
  
  try {
    const res = await fetch(`/api/consulta-placa/${cleanPlaca}`);
    if (res.ok) {
      const data = await res.json();
      return {
        marca: data.marca || "Não Informada",
        modelo: data.modelo || "Não Informado",
        ano: data.ano || "2020",
        motor: data.motor || "1.0",
        cor: data.cor || "Prata",
        chassi: data.chassi,
        renavam: data.renavam,
        municipio: data.municipio,
        uf: data.uf,
        api_status: data.api_status || "real",
        api_source: data.api_source || "api_real",
        api_error: data.api_error
      };
    } else {
      console.warn("API de consulta retornou status de erro, usando fallback determinístico.");
      
      let code = 0;
      for (let i = 0; i < cleanPlaca.length; i++) {
        code += cleanPlaca.charCodeAt(i);
      }
      const index = code % VEICULO_TEMPLATES.length;
      const t = VEICULO_TEMPLATES[index];
      return {
        ...t,
        api_status: "simulated",
        api_source: "local_http_fail",
        api_error: `O servidor retornou HTTP ${res.status}`
      };
    }
  } catch (err: any) {
    console.error("Erro na consulta real da placa via API externa:", err);
    
    let code = 0;
    for (let i = 0; i < cleanPlaca.length; i++) {
      code += cleanPlaca.charCodeAt(i);
    }
    const index = code % VEICULO_TEMPLATES.length;
    const t = VEICULO_TEMPLATES[index];
    return {
      ...t,
      api_status: "simulated",
      api_source: "local_exception",
      api_error: err.message || "Erro de conexão com o servidor"
    };
  }
};
