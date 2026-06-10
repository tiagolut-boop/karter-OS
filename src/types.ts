export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  dataNascimento: string; // YYYY-MM-DD (campo obrigatório)
  tipo?: "PF" | "PJ";     // Tipo opcional (PF ou PJ)
}

export interface Veiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  motor: string;
  cor: string;
  km: number;
  chassi?: string;
  renavam?: string;
  municipio?: string;
  uf?: string;
}

export interface Peca {
  id: string;
  sku: string;
  descricao: string;
  fabricante: string;
  estoque: number;
  precoCusto: number;
  precoVenda: number;
}

export interface Mecanico {
  id: string;
  nome: string;
  especialidade: string;
  comissaoPercentual: number; // e.g. 10 para 10%
}

export interface PecaUtilizada {
  pecaId: string;
  quantidade: number;
  precoUnitario: number;
  mecanicoId?: string; // Optional machinist assigned to install this component
}

export interface ServicoDetalhado {
  id: string;
  descricao: string;
  valor: number;
  mecanicoId: string;
}

export type OSStatus = "Em Andamento" | "Concluído" | "Cancelado" | "Aguardando Conferência" | "Arquivada";

export interface FechamentoAdmDetails {
  formaPagamento: "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Crédito Parcelado" | "Múltiplo";
  bandeiraCartao?: string; // ex: Visa, Mastercard, Elo
  taxaCartaoPercentual: number;
  custoPecasOrigem: Record<string, "Compra Direta" | "Estoque Existente">;
  custoPecasFornecedor: Record<string, string>; // pecaId -> fornecedor
  custoPecasReais: Record<string, number>; // pecaId -> valor custo real
  comissaoMecanicoOriginal: number; // calculated automatic commission
  comissaoMecanicoFinal: number; // editable manual commission override
  impostosCustosExtras: number; 
  checklistValidados: string[]; // ids of validated items (e.g., specific pecaId, or 'mao-de-obra' as key)
  observacoes?: string;
  lucroLiquidoCalculado: number;
  contabilizadoEm?: string; // data do fechamento
  desconto?: number; // valor do desconto discriminado
  valoresPagoSplit?: Record<string, number>; // distribuição do pagamento nos diferentes canais
  parcelasCredito?: number; // parcelas para cartão de crédito
}

export interface OrdemServico {
  id: string;
  veiculoId: string;
  clienteId: string;
  mecanicoId: string;
  dataAbertura: string; // YYYY-MM-DD
  dataConclusao?: string; // YYYY-MM-DD
  status: OSStatus;
  kmAtual: number;
  descricaoProblema: string;
  servicosRealizados: string;
  pecasUtilizadas: PecaUtilizada[];
  valorMaoDeObra: number;
  valorTotal: number;
  nfeEmitida?: boolean;
  nfseEmitida?: boolean;
  nfeChave?: string;
  nfseChave?: string;
  evidences?: ServiceEvidence[];
  fechamentoAdm?: FechamentoAdmDetails;
  servicosDetalhados?: ServicoDetalhado[];
}

export type EvidenceCategory = "check-in_veiculo" | "pecas_substituidas" | "pecas_instaladas";

export type OrcamentoStatus = "Pendente" | "Autorizado Parcial" | "Autorizado Total" | "Expirado";

export interface OrcamentoItemPeca {
  pecaId: string;
  quantidade: number;
  precoUnitario: number;
  aprovada: boolean;
}

export interface Orcamento {
  id: string;
  veiculoId: string;
  clienteId: string;
  mecanicoId: string;
  dataAbertura: string; // YYYY-MM-DD
  dataValidade: string; // YYYY-MM-DD
  status: OrcamentoStatus;
  kmAtual: number;
  descricaoProblema: string;
  servicosOrcados: string;
  maoDeObraAprovada: boolean;
  pecasUtilizadas: OrcamentoItemPeca[];
  valorMaoDeObra: number;
  valorTotal: number;
  osGeradaId?: string; // ID da OS correspondente quando convertido
}

export interface ServiceEvidence {
  evidenceId: string;
  orderId: string;
  categoryEnum: EvidenceCategory;
  imageUrl: string;
  createdAt: string;
  uploadedBy: string; // ID do mecânico
  pecaId?: string;     // OPCIONAL: Vinculação com a peça substituída ou instalada
  latitude?: number;
  longitude?: number;
  expiresAt?: string;  // Signed URL Expiration timestamp (e.g. ISO string or similar)
  filePath: string;    // Estrutura de storage: /oficinas/{id_oficina}/ordens_servico/{id_os}/{categoria_foto}/{evidence_id}.jpg
}

export interface Operador {
  id: string;
  nome: string;
  usuario: string; // Ex: gabriel
  senha: string;   // Ex: 1234
  modulosPermitidos: string[]; // List of tab IDs containing permissions
  fotoPerfil?: string; // base64 or URL
  role?: "admin" | "mecanico" | "atendente";
  funcionarioId?: string; // vínculo opcional com a tabela de funcionários (Mecanico)
}

export interface OficinaConfig {
  nomeOficina: string;
  telefone: string;
  endereco: string;
  requireEvidenceToClose: boolean;
  standardDiscountLimitPercent: number;
  logoUrl?: string; // base64 or URL
  showLogoInNF?: boolean;
  showLogoInOrcamento?: boolean;
  showLogoInOS?: boolean;
  adminProfilePicUrl?: string; // profile picture for the admin user
  email?: string; // business email
  inscricaoMunicipal?: string; // municipal tax ID (Inscrição Municipal)
  regimeTributacao?: string; // e.g. Simples Nacional, Lucro Presumido, etc
  localPrestacao?: string; // e.g. No município, Fora do município
  modoPrestacao?: string; // e.g. Tributação no município, Isenta, suspensa
  codigoServicoLC116?: string; // e.g. 14.01 - Conserto de veículos
  aliquotaIss?: number; // e.g. 2.0 to 5.0 %
}
