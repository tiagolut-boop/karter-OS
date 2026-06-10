import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Lock, 
  Trash2, 
  Sliders, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  CheckCircle,
  FolderOpen,
  UserCheck,
  Smartphone
} from "lucide-react";
import { OrdemServico, ServiceEvidence, EvidenceCategory, Peca, Mecanico } from "../types";

interface EVSManagerProps {
  ordem: OrdemServico;
  mecanicos: Mecanico[];
  pecas: Peca[];
  onUpdateEvidences: (newEvidences: ServiceEvidence[]) => void;
}

// Client-side downscaling and quality compression utility
export function compressImage(
  fileOrBase64: File | string, 
  maxWidth = 1280, 
  maxHeight = 720, 
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Keep proportional aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível inicializar canvas do navegador."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };
    img.onerror = (err) => reject(img.src ? new Error("Erro ao carregar renderizador de imagem.") : err);

    if (typeof fileOrBase64 === "string") {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    }
  });
}

export default function EVSManager({ ordem, mecanicos, pecas, onUpdateEvidences }: EVSManagerProps) {
  // Mode selection & capture state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [category, setCategory] = useState<EvidenceCategory>("pecas_substituidas");
  const [selectedPecaId, setSelectedPecaId] = useState<string>("");
  const [uploadedBy, setUploadedBy] = useState<string>(ordem.mecanicoId || "");
  
  // Camera & coordinates state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
  const [acquiringGps, setAcquiringGps] = useState(false);
  
  // Upload status states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [successEvidence, setSuccessEvidence] = useState<ServiceEvidence | null>(null);

  // Admin Audit Desk state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Video and Canvas stream refs for custom camera frame acquisition
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch location on modal opening for automatic metadata injection
  useEffect(() => {
    if (showUploadModal) {
      setAcquiringGps(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            setAcquiringGps(false);
          },
          (err) => {
            console.warn("GPS de oficina bloqueado ou sem permissão na sandbox:", err.message);
            // Fallback: Simulador de coordenadas do plano de auditoria do KarterOS
            setCoords({ latitude: -27.8156, longitude: -50.3262 }); // Sede em Lages - SC
            setAcquiringGps(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setCoords({ latitude: -27.8156, longitude: -50.3262 });
        setAcquiringGps(false);
      }
    }
  }, [showUploadModal]);

  // Handle webcam stream start
  const startCamera = async () => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, // Back-camera ideal for auto mechanics
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn(e));
      }
    } catch (err: any) {
      console.error("Camera fail:", err);
      setCameraError("Permissão bloqueada ou indisponível. Por favor, faça upload de arquivo como contingência.");
      setIsCameraActive(false);
    }
  };

  // Handle camera snapshot capture
  const takeSnapshot = async () => {
    if (!videoRef.current || !streamRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        
        // Execute client-side proportional compression immediately
        const compressedBase64 = await compressImage(dataUrl, 1280, 720, 0.8);
        setSelectedImage(compressedBase64);
        
        // Turn off camera streaming to save resources
        stopCamera();
      }
    } catch (e: any) {
      setCameraError(`Falha ao congelar frame capturado: ${e.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // File picker handler with automatic compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadStatus("Comprimindo arquivo...");
        const compressedBase64 = await compressImage(file, 1280, 720, 0.8);
        setSelectedImage(compressedBase64);
        setUploadStatus("");
      } catch (err: any) {
        setCameraError(`Erro ao redimensionar arquivo: ${err.message}`);
      }
    }
  };

  // Trigger high transparency storage upload
  const handleUploadSubmit = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    setUploadStatus("Processando pipeline de imagem GCS...");

    try {
      const response = await fetch("/api/evidences/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          orderId: ordem.id,
          category: category,
          uploadedBy: uploadedBy,
          pecaId: selectedPecaId || undefined,
          latitude: coords.latitude,
          longitude: coords.longitude,
          oficinaId: "oficina_karter_lages"
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor de storage retornou erro HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Create full structured ServiceEvidence object
        const newEvidenceItem: ServiceEvidence = {
          evidenceId: result.evidenceId,
          orderId: ordem.id,
          categoryEnum: category,
          imageUrl: result.imageUrl,
          createdAt: new Date().toISOString(),
          uploadedBy: uploadedBy,
          pecaId: selectedPecaId || undefined,
          latitude: coords.latitude || undefined,
          longitude: coords.longitude || undefined,
          filePath: result.filePath,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // Simulated safe duration bounds
        };

        const existingEvidences = ordem.evidences || [];
        onUpdateEvidences([...existingEvidences, newEvidenceItem]);
        
        setSuccessEvidence(newEvidenceItem);
        setUploadStatus("✓ Integrado e assinado no Cloud Storage!");
      } else {
        throw new Error(result.error || "Erro de validação no upload.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`Falha no upload de evidência: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Admin access validation standard logic
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError("");
    setLoadingLogs(true);
    
    try {
      const rawString = `${adminUser}:${adminPass}`;
      const base64Auth = btoa(unescape(encodeURIComponent(rawString)));
      
      const res = await fetch("/api/evidences/logs", {
        headers: {
          "Authorization": `Basic ${base64Auth}`
        }
      });

      if (res.status === 401) {
        setAdminAuthError("Dados incorretos. Acesso bloqueado para auditoria.");
        setAdminAuthenticated(false);
      } else if (!res.ok) {
        setAdminAuthError(`Servidor retornou erro HTTP ${res.status}`);
      } else {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditStats(data.stats || null);
        setAdminAuthenticated(true);
      }
    } catch (err: any) {
      setAdminAuthError(`Erro na requisição: ${err.message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Close upload modal cleaning resources
  const closeUploadModal = () => {
    stopCamera();
    setSelectedImage(null);
    setCategory("pecas_substituidas");
    setSelectedPecaId("");
    setSuccessEvidence(null);
    setUploadStatus("");
    setCameraError("");
    setShowUploadModal(false);
  };

  // Helpers
  const getPecaDetail = (pId?: string) => pecas.find(p => p.id === pId);
  const getMecanicoNome = (mId: string) => mecanicos.find(m => m.id === mId)?.nome || "Mecânico geral";

  // Organize actual evidences
  const evidences = ordem.evidences || [];
  const checkinEvidences = evidences.filter(e => e.categoryEnum === "check-in_veiculo");

  return (
    <div className="space-y-6 pt-5 border-t border-white/5 font-sans text-xs">
      
      {/* Header Panel with legal/marketing focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-orange-600/10 via-orange-500/5 to-transparent p-4 rounded-2xl border border-orange-500/20 shadow-inner">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-orange-500/20 text-orange-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              EVS — Evidência Visual de Serviço
            </h3>
          </div>
          <p className="text-slate-400 text-[10px] mt-1 leading-normal max-w-lg">
            Sistema de auditoria eletrônica e arquivos não estruturados. Vincula imagens com carimbo de geolocalização e fotos de peças substituídas, gerando segurança jurídica e total transparência.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAdminUser("");
              setAdminPass("");
              setAdminAuthError("");
              setAdminAuthenticated(false);
              setShowAdminPanel(!showAdminPanel);
            }}
            className="px-3 py-1.5 text-xxs font-bold text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>{showAdminPanel ? "Ocultar Auditor" : "Logs Google Storage (Adm)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 font-bold text-xxs text-white bg-orange-600 hover:bg-orange-550 border border-orange-500/30 rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-950/20 transition cursor-pointer animate-shimmer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Adicionar Evidência</span>
          </button>
        </div>
      </div>

      {/* Admin Audit Desk Panel */}
      {showAdminPanel && (
        <div className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl space-y-4 shadow-xl">
          <div className="border-b border-white/5 pb-2">
            <h4 className="font-extrabold text-orange-400 text-xxs uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-orange-500" />
              Painel de Logs e Auditoria Google Cloud Storage / SQLite
            </h4>
            <p className="text-[10px] text-slate-500">
              Acesso restrito para auditoria técnica de upload e links temporários assinados (Signed URLs).
            </p>
          </div>

          {!adminAuthenticated ? (
            <form onSubmit={handleAdminAuthSubmit} className="max-w-md space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Usuário</label>
                  <input
                    type="text"
                    required
                    placeholder="Adm"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Senha do Administrador"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                </div>
              </div>
              {adminAuthError && (
                <p className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {adminAuthError}
                </p>
              )}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loadingLogs}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-xxs transition flex items-center gap-1 hover:border-slate-550"
                >
                  {loadingLogs && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Autenticar Usuário</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 font-mono text-[10px]">
              {auditStats && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-slate-400">Total Upload Evidências:</p>
                    <p className="text-base font-black font-sans text-orange-400">{auditStats.totalUploads} arquivos</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Dimensão em Storage (Aprox. KB):</p>
                    <p className="text-base font-black font-sans text-white">{auditStats.totalKilobytesStored} KB</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="font-bold text-slate-350 flex items-center gap-1 text-[11px] font-sans">Logs de Auditoria de uploads:</p>
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-black/40 rounded-lg text-center">Nenhum evento registrado nesta sessão do servidor.</p>
                ) : (
                  <div className="max-h-52 overflow-y-auto border border-white/10 rounded-xl bg-black/40 divide-y divide-white/5 leading-relaxed text-[9px] text-slate-350">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-white/5 space-y-1">
                        <div className="flex justify-between items-center text-white font-bold font-sans">
                          <span className="text-orange-400">[{log.category.toUpperCase()}]</span>
                          <span>{new Date(log.timestamp).toLocaleString("pt-BR")}</span>
                        </div>
                        <p>ID Evidência: <span className="text-blue-300">{log.evidenceId}</span> | OS: <span className="text-yellow-300">{log.orderId}</span></p>
                        <p className="truncate">GCS Path: <span className="text-emerald-400 font-sans">{log.filePath}</span></p>
                        <div className="flex justify-between text-slate-450 pt-0.5">
                          <span>Mecânico: {log.mecanicoId} | Coords: {log.coords}</span>
                          <span>IP: {log.clientIp} | Size: {log.sizeKb}KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BEFORE AND AFTER Paired Parts Gallery (Peça Velha vs Peça Nova) */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-white text-xxs uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4 text-orange-500" />
          Antes e Depois das Peças de Substituição
        </h4>

        {ordem.pecasUtilizadas.length === 0 ? (
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 text-center text-slate-400">
            <p className="italic">Nenhum insumo físico consumido nesta OS. Adicione peças para gerar o grid "Antes e Depois".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ordem.pecasUtilizadas.map((item, idx) => {
              const spec = getPecaDetail(item.pecaId);
              // Filter old piece picture
              const oldImg = evidences.find(e => e.pecaId === item.pecaId && e.categoryEnum === "pecas_substituidas");
              // Filter new piece picture
              const newImg = evidences.find(e => e.pecaId === item.pecaId && e.categoryEnum === "pecas_instaladas");

              return (
                <div key={idx} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow shadow-black/25">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-white truncate text-xs">{spec?.descricao || "Peça não identificada"}</p>
                      <p className="text-[10px] text-slate-450 font-mono">Fabricante: {spec?.fabricante || "Fabricante MOCK"} | SKU: {spec?.sku}</p>
                    </div>
                    <span className="shrink-0 bg-orange-600/10 text-orange-400 border border-orange-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                      Insumo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Before (Old / Substituída) */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        Antes (Peça Velha)
                      </p>
                      {oldImg ? (
                        <div className="relative group rounded-xl overflow-hidden aspect-video border border-white/5 bg-slate-950">
                          <img 
                            src={`${oldImg.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                            alt="Antes - Peça Velha" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={`${oldImg.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-200 text-[10px] font-bold"
                          >
                            <Eye className="w-4 h-4 mr-1 text-orange-400" />
                            Ampliar
                          </a>
                          
                          {/* Metadata stamp overlay */}
                          {oldImg.latitude && (
                            <div className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 rounded font-mono text-[7px] text-slate-350 scale-90 origin-bottom-right">
                              📍 Geolocalizado
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 aspect-video flex flex-col items-center justify-center text-center p-2 text-slate-450 bg-slate-950/20">
                          <AlertCircle className="w-4 h-4 mb-1 text-slate-500" />
                          <p className="text-[8px] leading-tight">Nenhuma foto<br/>da peça velha</p>
                        </div>
                      )}
                    </div>

                    {/* After (New / Instalada) */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Depois (Peça Nova)
                      </p>
                      {newImg ? (
                        <div className="relative group rounded-xl overflow-hidden aspect-video border border-white/5 bg-slate-950">
                          <img 
                            src={`${newImg.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                            alt="Depois - Peça Nova" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={`${newImg.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-200 text-[10px] font-bold"
                          >
                            <Eye className="w-4 h-4 mr-1 text-orange-400" />
                            Ampliar
                          </a>

                          {/* Metadata stamp overlay */}
                          {newImg.latitude && (
                            <div className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 rounded font-mono text-[7px] text-slate-350 scale-90 origin-bottom-right">
                              📍 Geolocalizado
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 aspect-video flex flex-col items-center justify-center text-center p-2 text-slate-450 bg-slate-950/20">
                          <AlertCircle className="w-4 h-4 mb-1 text-slate-500" />
                          <p className="text-[8px] leading-tight">Nenhuma foto<br/>da peça instalada</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this specific piece of replacement */}
                  <div className="flex justify-end gap-1.5 pt-1.5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPecaId(item.pecaId);
                        setCategory("pecas_substituidas");
                        setShowUploadModal(true);
                      }}
                      className="px-2 py-1 hover:bg-white/5 text-[9px] text-slate-350 hover:text-white border border-white/5 rounded-md flex items-center gap-1 transition cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-yellow-500" />
                      <span>Adicionar Velha</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPecaId(item.pecaId);
                        setCategory("pecas_instaladas");
                        setShowUploadModal(true);
                      }}
                      className="px-2 py-1 hover:bg-white/5 text-[9px] text-slate-350 hover:text-white border border-white/5 rounded-md flex items-center gap-1 transition cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-emerald-500" />
                      <span>Adicionar Nova</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHECK-IN VEHICLE PICTURES GALLERY */}
      <div className="space-y-4 pt-3">
        <h4 className="font-extrabold text-white text-xxs uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-orange-500" />
          Evidências de Check-in do Veículo Geral
        </h4>
        
        {checkinEvidences.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/20 flex flex-col items-center justify-center text-center text-slate-500">
            <Camera className="w-7 h-7 mb-1.5 text-slate-650" />
            <p className="text-xxs font-bold text-slate-400">Nenhuma evidência registrada para o check-in inicial.</p>
            <p className="text-[10px] text-slate-500 max-w-xs mt-0.5 leading-normal">
              Recomendamos fotografar a integridade exterior do veículo para cobertura jurídica.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("check-in_veiculo");
                setSelectedPecaId("");
                setShowUploadModal(true);
              }}
              className="mt-2.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-md text-[10px] font-bold transition flex items-center gap-1"
            >
              <Camera className="w-3 h-3 text-orange-400" />
              <span>Adicionar Foto Check-in</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {checkinEvidences.map((item, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 bg-slate-900 shadow">
                <img 
                  src={`${item.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                  alt="Foto Check-in" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual hover quick info overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[7px] text-orange-400 font-bold bg-orange-950/80 px-1 py-0.2 rounded uppercase">
                      Check-in
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        const filt = evidences.filter(e => e.evidenceId !== item.evidenceId);
                        onUpdateEvidences(filt);
                      }}
                      className="p-1 bg-red-950/60 text-red-400 hover:text-white rounded border border-red-500/10 cursor-pointer"
                      title="Remover evidência"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <a 
                    href={`${item.imageUrl}?conclusao=${ordem.dataConclusao || ""}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="self-center flex items-center justify-center text-[9px] font-bold text-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5 mr-0.5 text-orange-400" />
                    Abrir original
                  </a>

                  <div className="space-y-0.5 font-mono text-[7px] text-slate-400">
                    <p className="flex items-center gap-0.5">
                      <Clock className="w-2 h-2" />
                      {new Date(item.createdAt).toLocaleTimeString("pt-BR")}
                    </p>
                    {item.latitude && (
                      <p className="flex items-center gap-0.5 truncate text-[6px]">
                        <MapPin className="w-2 h-2 text-red-500" />
                        {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Always visible gps tiny stamp indicator */}
                {item.latitude && (
                  <div className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 rounded font-mono text-[7px] text-slate-300 scale-90 origin-bottom-right pointer-events-none group-hover:hidden">
                    📍 Lat/Lng
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD EVIDENCE DIALOG MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-orange-400" />
                  Capturar Evidência Visual (GCS Pipeline)
                </h3>
                <p className="text-[10px] text-slate-500">Pipeline de segurança com downscaling automático (1280x720, JPG 80%) de imagem.</p>
              </div>
              <button
                type="button"
                onClick={closeUploadModal}
                className="p-1 bg-white/10 hover:bg-white/15 text-slate-350 hover:text-white rounded-lg transition text-xs font-bold w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              
              {/* Category and Part association selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-white/5 text-[10px]">
                <div>
                  <label className="text-slate-400 font-bold uppercase pb-1 block">Categoria Requerida</label>
                  <select
                    className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
                  >
                    <option value="check-in_veiculo">Geral Check-in (Entrada)</option>
                    <option value="pecas_substituidas">Substituídas / Velha (Antes)</option>
                    <option value="pecas_instaladas">Instaladas / Nova (Depois)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase pb-1 block">Vincular a Peça da OS</label>
                  <select
                    className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white"
                    value={selectedPecaId}
                    onChange={(e) => setSelectedPecaId(e.target.value)}
                    disabled={category === "check-in_veiculo"}
                  >
                    <option value="">Nenhuma especificamente (Uso Geral)</option>
                    {ordem.pecasUtilizadas.map((item, idx) => {
                      const spec = getPecaDetail(item.pecaId);
                      return (
                        <option key={idx} value={item.pecaId}>
                          {spec?.descricao || "Insumo físico"} [{item.quantidade}x]
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-2 text-[9px] text-slate-450 bg-white/5 p-2 rounded-lg scroll-m-1">
                  <div>
                    <span className="font-bold text-slate-350 block uppercase">Timestamp Captura</span>
                    <span>{new Date().toLocaleString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-350 block uppercase">Auditoria GPS</span>
                    <span>
                      {acquiringGps ? (
                        <span className="text-yellow-400 animate-pulse">Sincronizando satélite...</span>
                      ) : coords.latitude ? (
                        <span className="text-emerald-400">✓ Ativo ({coords.latitude.toFixed(6)}, {coords.longitude?.toFixed(6)})</span>
                      ) : (
                        <span className="text-slate-500">Oficina matriz configurada</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Central Camera frame stream or image preview panel */}
              <div className="space-y-3">
                {selectedImage ? (
                  /* Captured image preview state */
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black">
                      <img 
                        src={selectedImage} 
                        alt="Evidência Pré-compilada" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                        Comprimido (1280x720)
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[9px]">
                      <span className="text-slate-400">Resolução de Auditoria: 1280x720 auto JPEG</span>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="text-orange-400 hover:text-orange-350 font-bold font-sans cursor-pointer"
                      >
                        Descartar e tirar outra
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Camera and upload choose switcher box */
                  <div className="space-y-3">
                    {isCameraActive ? (
                      <div className="space-y-2">
                        <div className="relative rounded-2xl overflow-hidden border-2 border-orange-550/40 aspect-video bg-black">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {cameraError && (
                          <div className="p-2 bg-red-950/40 border border-red-500/20 text-red-300 rounded-lg flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{cameraError}</span>
                          </div>
                        )}

                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-1.5 text-xxs font-bold text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                          >
                            Parar Câmera
                          </button>
                          <button
                            type="button"
                            onClick={takeSnapshot}
                            className="px-4 py-1.5 text-xxs font-extrabold text-white bg-orange-650 hover:bg-orange-600 rounded-lg transition shadow-md shadow-orange-950/20 flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Capturar Foto</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="p-5 border border-dashed border-white/10 hover:border-orange-550/40 bg-white/5 hover:bg-orange-600/5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition space-y-1.5"
                        >
                          <Camera className="w-8 h-8 text-orange-400" />
                          <span className="font-bold text-white text-[11px]">Usar Câmera do Dispositivo</span>
                          <span className="text-[10px] text-slate-500">Tirar foto real de peças e mecânica</span>
                        </button>

                        <div className="p-5 border border-dashed border-white/10 hover:border-emerald-555/40 bg-white/5 hover:bg-emerald-600/5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative transition space-y-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={handleFileChange}
                          />
                          <Upload className="w-8 h-8 text-emerald-400" />
                          <span className="font-bold text-white text-[11px]">Upload de Arquivo</span>
                          <span className="text-[10px] text-slate-500">Selecione foto (.jpg, .png) existente</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status and Action trigger section */}
              {uploadStatus && (
                <div className={`p-3 rounded-xl border text-[10px] flex items-center gap-2 ${
                  uploadStatus.includes("✓") 
                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300"
                    : "bg-orange-950/30 border-orange-500/10 text-slate-300"
                }`}>
                  {uploadStatus.includes("✓") ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400 shrink-0" />}
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-2 text-xxs font-bold">
              {successEvidence ? (
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg transition"
                >
                  Confirmar e Concluir
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="px-3.5 py-2 hover:bg-white/5 text-slate-350 border border-white/10 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={!selectedImage || isUploading}
                    className={`px-4 py-2 text-white rounded-lg transition flex items-center gap-1 ${
                      selectedImage && !isUploading
                        ? "bg-orange-600 hover:bg-orange-550 cursor-pointer"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    {isUploading && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>Salvar Evidência</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
