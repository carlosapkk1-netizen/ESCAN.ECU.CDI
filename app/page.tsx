'use client';

import React, { useState, useEffect } from 'react';
import { 
    Menu, 
    Settings, 
    Minus, 
    Plus, 
    Search, 
    Copy,
    CheckCircle2,
    AlertTriangle, 
    Home, 
    List, 
    Clock, 
    Info, 
    HelpCircle,
    ChevronRight,
    Trash2,
    X,
    Camera,
    Database,
    Moon,
    Sun,
    ScanText,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Tesseract from 'tesseract.js';

type DiagnosticResult = {
    titulo: string;
    subtitulo: string;
    verificacoes: string[];
};


const ecuDatabase: Record<string, {modelo: string, detalhes: string, sintomas: string}> = {
    '38770-KVS-J01': { modelo: 'CG 150 Titan Mix', detalhes: 'Sistema de Injeção KEIHIN', sintomas: 'Corte de giro precoce, falha no MAP' },
    '38770-KRE-G01': { modelo: 'NXR 160 Bros', detalhes: 'FlexOne 2015+', sintomas: 'Bomba de combustível não aciona' },
    '38770-KVK-B21': { modelo: 'CB 300R', detalhes: 'Módulo PGM-FI', sintomas: 'Apagões repentinos em marcha lenta' },
    '38770-KRM-851': { modelo: 'CG 150 Titan 2004-2008', detalhes: 'Injeção PGM-FI Básica', sintomas: 'Falha de centelha no cilindro' }
};

const banco: Record<number, DiagnosticResult> = {
    1: { titulo: "SENSOR MAP", subtitulo: "Baixa/Alta Voltagem do MAP", verificacoes: ["Verificar mangueira do MAP", "Testar sensor MAP"] },
    7: { titulo: "SENSOR EOT/ECT", subtitulo: "Falha de temperatura", verificacoes: ["Testar tensão no sensor"] },
    8: { titulo: "SENSOR TP", subtitulo: "Baixa/Alta voltagem", verificacoes: ["Verificar falha no acelerador"] },
    9: { titulo: "SENSOR IAT", subtitulo: "Circuito de Temperatura do Ar", verificacoes: ["Testar circuito do IAT"] },
    12: { titulo: "INJETOR 1", subtitulo: "Mau funcionamento do circuito", verificacoes: ["Testar bico injetor", "Verificar chicote"] },
    21: { titulo: "SENSOR O2 (SONDA LAMBDA)", subtitulo: "Falha no aquecimento", verificacoes: ["Testar aquecedor do sensor", "Verificar fiação O2"] },
    29: { titulo: "VÁLVULA IACV", subtitulo: "Controle de marcha lenta", verificacoes: ["Testar sensor e conexão"] },
    33: { titulo: "EEPROM", subtitulo: "Erro na unidade de controle", verificacoes: ["Verificar módulo ECM/PCM", "Tentar reiniciar sistema"] },
    54: { titulo: "SENSOR DE VELOCIDADE", subtitulo: "Sinal incorreto ou ausente.", verificacoes: ["Verificar chicote e conectores", "Testar sensor de velocidade", "Verificar painel e instrumento"] },
    67: { titulo: "BOMBA DE COMBUSTÍVEL", subtitulo: "Falha de pressão/alimentação", verificacoes: ["Testar tensão na bomba", "Verificar relé da bomba"] },
    86: { titulo: "PAINEL DE INSTRUMENTOS", subtitulo: "Falha de comunicação", verificacoes: ["Testar chicote de comunicação"] }
};

export default function HondaDiagnostics() {
    const [activeTab, setActiveTab] = useState<'diagnostico' | 'codigos' | 'historico' | 'info' | 'scanner'>('diagnostico');
    const [longas, setLongas] = useState(0);
    const [curtas, setCurtas] = useState(0);
    const [resultado, setResultado] = useState<{ codigo: number, falha: DiagnosticResult | null } | null>(null);
    const [historico, setHistorico] = useState<{codigo: number, data: string}[]>([]);
    const [copied, setCopied] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ecuResult, setEcuResult] = useState<{modelo: string, codigo: string, detalhes: string, sintomas?: string} | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setSelectedImage(URL.createObjectURL(file));
        setOcrLoading(true);
        setOcrProgress(0);
        setEcuResult(null);

        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.floor(m.progress * 100));
                    }
                }
            });

            const text = result.data.text.toUpperCase();
            
            const match = text.match(/38770-[A-Z0-9]{3}-[A-Z0-9]{3}/) || text.match(/[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}/);
            
            if (match) {
                const codigo = match[0];
                const info = ecuDatabase[codigo] || { modelo: 'Modelo Desconhecido / Genérico', detalhes: 'ECU não encontrada no banco local.', sintomas: 'Consulte o manual de serviço.' };
                setEcuResult({ codigo, modelo: info.modelo, detalhes: info.detalhes, sintomas: info.sintomas });
            } else {
                setEcuResult({ codigo: 'NÃO RECONHECIDO', modelo: 'Código Ilegível', detalhes: 'Tente tirar uma foto mais nítida focado direto no código impresso no módulo.', sintomas: '' });
            }

        } catch (error) {
            console.error(error);
            setEcuResult({ codigo: 'ERRO OCR', modelo: 'Falha no processamento', detalhes: 'Não ocorreu a leitura.', sintomas: '' });
        }
        
        setOcrLoading(false);
    };


    useEffect(() => {
        const saved = localStorage.getItem('honda_historico');
        if (saved) {
            try { setHistorico(JSON.parse(saved)); } catch (e) {}
        }
        
        // Load theme or detect OS default
        const savedTheme = localStorage.getItem('honda_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme as 'light' | 'dark');
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
            if (prefersDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('honda_theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleRun = () => {
        const codigo = (longas * 10) + curtas;
        const falha = banco[codigo] || null;
        setResultado({ codigo, falha });

        // Save to History
        const novoHist = [{ codigo, data: new Date().toISOString() }, ...historico].slice(0, 30);
        setHistorico(novoHist);
        localStorage.setItem('honda_historico', JSON.stringify(novoHist));
    };

    const handleCopy = () => {
        if (resultado) {
            navigator.clipboard.writeText(resultado.codigo.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const clearHistory = () => {
        setHistorico([]);
        localStorage.removeItem('honda_historico');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#080B12] text-slate-900 dark:text-white font-sans flex flex-col selection:bg-red-500/30 overflow-x-hidden relative">
            
            {/* Drawer Area and Overlay shadow */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm shadow-xl"
                        ></motion.div>
                        
                        <motion.div 
                            id="drawerLayout"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 w-64 md:w-80 h-full bg-slate-50 dark:bg-[#0A0D14] border-r border-slate-300 dark:border-[#242938] z-[70] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-5 border-b border-slate-300 dark:border-[#242938] flex justify-between items-center bg-white dark:bg-[#121620]">
                                <h2 className="text-slate-900 dark:text-white font-bold tracking-widest uppercase">HONDA SCAN Menu</h2>
                                <button onClick={() => setDrawerOpen(false)} className="text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="flex flex-col p-4 space-y-2">
                                <button 
                                    onClick={() => { setActiveTab('scanner'); setDrawerOpen(false); }}
                                    className="flex items-center space-x-3 w-full p-4 hover:bg-slate-100 dark:bg-[#1A1F2D] rounded-lg transition-colors group"
                                >
                                    <Camera className="w-5 h-5 text-slate-800 dark:text-[#8C92A0] group-hover:text-[#0033FF] dark:group-hover:text-[#00FF4D]" />
                                    <span className="text-slate-800 dark:text-[#8C92A0] group-hover:text-slate-900 dark:hover:text-white font-semibold text-sm tracking-wide uppercase">Câmera OCR (Visão)</span>
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('codigos'); setDrawerOpen(false); }}
                                    className="flex items-center space-x-3 w-full p-4 hover:bg-slate-100 dark:bg-[#1A1F2D] rounded-lg transition-colors group"
                                >
                                    <Database className="w-5 h-5 text-slate-800 dark:text-[#8C92A0] group-hover:text-[#E70000]" />
                                    <span className="text-slate-800 dark:text-[#8C92A0] group-hover:text-slate-900 dark:hover:text-white font-semibold text-sm tracking-wide uppercase">Tabela de Códigos PGM-FI</span>
                                </button>
                            </div>
                            
                            <div className="mt-auto p-5 border-t border-slate-300 dark:border-[#242938] text-center">
                                <span className="text-slate-700 dark:text-[#64748B] text-[10px] font-bold tracking-[0.2em] uppercase">V4.1 BETA</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-300 dark:border-[#242938]/50 relative z-10">
                <button id="btnMenu" onClick={() => setDrawerOpen(true)} className="text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-gray-300 transition-transform active:scale-95">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E70000] to-transparent opacity-50"></div>
                <button id="btnSettings" onClick={() => setActiveTab('info')} className="text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-gray-300 transition-transform active:scale-95">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 relative">
                
                {/* Visual Background Accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-[#0A3041]/30 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-lg mx-auto flex flex-col pt-2 relative z-10">
                    
                    {/* Header Image & Title */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="logo-container mb-4">
                            <img 
                                src="/final_logo.png?v=5" 
                                alt="logo"
                                className="logo-img w-52 mx-auto"
                            />
                            <div className="scan-line"></div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <h1 className="text-[#E70000] text-2xl font-black tracking-widest uppercase">Honda</h1>
                            <h1 className="text-slate-900 dark:text-white text-2xl font-light tracking-widest uppercase">Diagnostics</h1>
                        </div>
                        <div className="flex items-center mt-1 w-full justify-center space-x-3">
                            <div className="h-[1px] w-8 bg-[#E70000]/80"></div>
                            <p className="text-slate-700 dark:text-[#64748B] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">System Protocol V4.1</p>
                            <div className="h-[1px] w-8 bg-[#E70000]/80"></div>
                        </div>
                    </div>

                    {/* Core Area: Switches based on Active Tab */}
                    {activeTab === 'diagnostico' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Status Card */}
                            <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-3 flex justify-between items-center mb-6 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 rounded-full bg-[#0033FF]/10 dark:bg-green-500/20 flex items-center justify-center border border-[#0033FF]/30 dark:border-[#00FF4D]/30 shadow-[0_0_10px_rgba(0,51,255,0.2)] dark:shadow-[0_0_10px_rgba(0,255,77,0.2)]">
                                        <div className="w-3 h-3 rounded-full bg-[#0033FF] dark:bg-[#00FF4D]"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-800 dark:text-[#8C92A0] text-[10px] uppercase font-bold tracking-wider">Status</span>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[#0033FF] dark:text-[#00FF4D] text-sm font-bold tracking-wide uppercase">Conectado</span>
                                            <span className="text-slate-800 dark:text-[#8C92A0] text-sm tracking-wide">via OBD-II</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-7 border border-[#0033FF] dark:border-[#00FF4D] rounded flex items-center justify-center bg-[#0033FF]/5 dark:bg-[#00FF4D]/5 text-[#0033FF] dark:text-[#00FF4D]">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 8h16l-2 8H6L4 8z" />
                                        <circle cx="8" cy="11" r="1" fill="currentColor" />
                                        <circle cx="12" cy="11" r="1" fill="currentColor" />
                                        <circle cx="16" cy="11" r="1" fill="currentColor" />
                                        <circle cx="10" cy="14" r="1" fill="currentColor" />
                                        <circle cx="14" cy="14" r="1" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>

                            {/* Input Controls Card */}
                            <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-4 sm:p-5 mb-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                <div className="flex justify-center items-center mb-6 relative">
                                    <h2 className="text-slate-700 dark:text-[#ADB0B8] text-sm font-semibold tracking-widest uppercase">Inserir Piscadas</h2>
                                    <HelpCircle className="w-4 h-4 text-slate-800 dark:text-[#8C92A0] absolute right-0 cursor-pointer" />
                                </div>

                                {/* Longas */}
                                <div className="mb-5">
                                    <label className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-medium tracking-widest block text-center mb-3 uppercase">
                                        Piscadas Longas (Dezenas)
                                    </label>
                                    <div className="flex justify-between items-center gap-3">
                                        <button 
                                            onClick={() => setLongas(Math.max(0, longas - 1))}
                                            className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-white dark:bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                        >
                                            <Minus className="w-5 h-5 text-slate-900 dark:text-white" />
                                        </button>
                                        <div className="flex-1 h-12 bg-white dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-md flex items-center justify-center shadow-inner">
                                            <span className="text-black dark:text-[#E70000] text-3xl font-black font-mono">{longas}</span>
                                        </div>
                                        <button 
                                            onClick={() => setLongas(longas + 1)}
                                            className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-white dark:bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                        >
                                            <Plus className="w-5 h-5 text-slate-900 dark:text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Curtas */}
                                <div className="mb-6">
                                    <label className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-medium tracking-widest block text-center mb-3 uppercase">
                                        Piscadas Curtas (Unidades)
                                    </label>
                                    <div className="flex justify-between items-center gap-3">
                                        <button 
                                            onClick={() => setCurtas(Math.max(0, curtas - 1))}
                                            className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-white dark:bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                        >
                                            <Minus className="w-5 h-5 text-slate-900 dark:text-white" />
                                        </button>
                                        <div className="flex-1 h-12 bg-white dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-md flex items-center justify-center shadow-inner">
                                            <span className="text-black dark:text-[#E70000] text-3xl font-black font-mono">{curtas}</span>
                                        </div>
                                        <button 
                                            onClick={() => setCurtas(curtas + 1)}
                                            className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-white dark:bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                        >
                                            <Plus className="w-5 h-5 text-slate-900 dark:text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Execute Button */}
                                <button 
                                    onClick={handleRun}
                                    className="w-full h-12 bg-[#CC0000] hover:bg-[#E60000] rounded-md flex justify-center items-center space-x-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(204,0,0,0.3)] mt-2"
                                >
                                    <Search className="w-5 h-5 text-white" />
                                    <span className="text-white text-sm font-bold tracking-wider uppercase">Executar Diagnóstico</span>
                                </button>
                            </div>

                            {/* Results Card */}
                            <AnimatePresence>
                                {resultado !== null && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-4 sm:p-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40"
                                    >
                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Código Identificado</h3>
                                        <div className="flex items-center justify-between bg-white dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-md h-20 px-4 mb-5 shadow-inner">
                                            <div className="flex-1 flex justify-center">
                                                <span className="text-[#0033FF] dark:text-[#00FF4D] text-6xl font-black font-mono tracking-wider">{resultado.codigo}</span>
                                            </div>
                                            <button 
                                                onClick={handleCopy}
                                                className="text-[#0033FF] dark:text-[#00FF4D] hover:text-[#0011bb] dark:hover:text-green-400 p-2 opacity-80 hover:opacity-100 transition-opacity"
                                            >
                                                {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                            </button>
                                        </div>

                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Falha Identificada</h3>
                                        <div className="bg-slate-100 dark:bg-[#0B0E14] border border-slate-300 dark:border-[#242938] rounded-md p-3 mb-5 flex gap-4 items-start">
                                            <div className="mt-1">
                                                <AlertTriangle className={resultado.falha ? "w-8 h-8 text-[#E70000]" : "w-8 h-8 text-yellow-500"} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-white font-bold text-sm tracking-wide mb-1 uppercase">
                                                    {resultado.falha ? resultado.falha.titulo : "CÓDIGO DESCONHECIDO"}
                                                </span>
                                                <span className="text-slate-800 dark:text-[#8C92A0] text-xs">
                                                    {resultado.falha ? resultado.falha.subtitulo : "Este código não foi encontrado no banco de dados."}
                                                </span>
                                            </div>
                                        </div>

                                        {resultado.falha && (
                                            <>
                                                <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-3">Verificações Recomendadas</h3>
                                                <ul className="space-y-2.5">
                                                    {resultado.falha.verificacoes.map((item, idx) => (
                                                        <li key={idx} className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#0033FF] dark:bg-[#00FF4D]"></div>
                                                            <span className="text-slate-700 dark:text-[#ADB0B8] text-[13px]">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    
                    {/* OCR Scanner Tab */}
                    {activeTab === 'scanner' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            
                            <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-5 mb-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-slate-800 dark:text-[#8C92A0] text-sm font-bold tracking-widest uppercase">Captura OCR ECU CDI</h2>
                                    <ScanText className="w-5 h-5 text-[#E70000]" />
                                </div>
                                <p className="text-slate-700 dark:text-[#ADB0B8] text-xs mb-5">Envie a imagem do adesivo do módulo ECU para extração automática do código impresso (Ex: 38770-KVS-J01).</p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-12 bg-[#CC0000] hover:bg-[#E60000] rounded-md flex justify-center items-center space-x-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(204,0,0,0.3)]"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                        <span className="text-white text-[11px] font-bold tracking-wider uppercase">Tirar Foto / Galeria</span>
                                    </button>
                                </div>
                            </div>

                            {selectedImage && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-4 shadow-lg shadow-slate-300/50 dark:shadow-black/40 mb-5 relative overflow-hidden">
                                    <div className="w-full h-40 bg-slate-100 dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-lg overflow-hidden flex items-center justify-center relative shadow-inner">
                                        <img src={selectedImage} alt="ECU Original" className="w-full h-full object-contain" />
                                        
                                        {ocrLoading && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                                                <Loader2 className="w-8 h-8 text-[#0033FF] dark:text-[#00FF4D] animate-spin mb-2" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#0033FF] dark:text-[#00FF4D]">Analisando... {ocrProgress}%</span>
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                                    <div className="bg-[#0033FF] dark:bg-[#00FF4D] h-1.5 rounded-full transition-all duration-300" style={{ width: ocrProgress + '%' }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {ecuResult && !ocrLoading && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Código Extraído (OCR)</h3>
                                        <div className="flex items-center justify-center bg-white dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-md h-16 px-4 mb-4 shadow-inner">
                                            <span className="text-[#0033FF] dark:text-[#00FF4D] text-2xl font-black font-mono tracking-wider">{ecuResult.codigo}</span>
                                        </div>

                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Módulo Identificado</h3>
                                        <div className="bg-slate-100 dark:bg-[#0B0E14] border border-slate-300 dark:border-[#242938] rounded-md p-3 mb-4">
                                            <span className="block text-slate-900 dark:text-white font-bold text-sm tracking-wide uppercase mb-1">{ecuResult.modelo}</span>
                                            <span className="block text-slate-700 dark:text-[#8C92A0] text-xs">{ecuResult.detalhes}</span>
                                        </div>

                                        {ecuResult.sintomas && (
                                            <>
                                                <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Falhas Comuns</h3>
                                                <div className="bg-red-50 dark:bg-[#E70000]/10 border border-red-200 dark:border-[#E70000]/20 rounded-md p-3">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-[#E70000] mt-0.5" />
                                                        <span className="text-slate-800 dark:text-red-200 text-xs">{ecuResult.sintomas}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    {activeTab === 'codigos' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8 space-y-4">
                            <h2 className="text-slate-800 dark:text-[#8C92A0] text-xs font-bold tracking-wider uppercase mb-4 pl-1">Banco de Códigos (PGM-FI)</h2>
                            {Object.entries(banco).map(([cod, info]) => (
                                <div key={cod} className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-4 flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#0B0E14] rounded-lg border border-slate-300 dark:border-[#242938] flex items-center justify-center shadow-inner">
                                        <span className="text-[#0033FF] dark:text-[#00FF4D] text-lg font-bold font-mono">{cod}</span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-slate-900 dark:text-white font-bold text-sm tracking-wide uppercase">{info.titulo}</span>
                                        <span className="text-slate-800 dark:text-[#8C92A0] text-[11px]">{info.subtitulo}</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'historico' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
                            <div className="flex justify-between items-center mb-4 pl-1 pr-1">
                                <h2 className="text-slate-800 dark:text-[#8C92A0] text-xs font-bold tracking-wider uppercase">Últimos Scanners</h2>
                                {historico.length > 0 && (
                                    <button onClick={clearHistory} className="text-slate-700 dark:text-[#64748B] hover:text-[#E70000] flex items-center gap-1 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-[10px] font-semibold uppercase">Limpar</span>
                                    </button>
                                )}
                            </div>
                            
                            {historico.length === 0 ? (
                                <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                    <Clock className="w-10 h-10 text-slate-600 dark:text-[#242938] mb-3" />
                                    <span className="text-slate-800 dark:text-[#8C92A0] text-sm">Nenhum diagnóstico recente.</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historico.map((h, i) => {
                                        const found = banco[h.codigo];
                                        return (
                                            <div key={i} className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-[#0B0E14] rounded border-2 border-slate-300 dark:border-[#242938] flex items-center justify-center shadow-inner">
                                                        <span className="text-[#0033FF] dark:text-[#00FF4D] text-base font-bold font-mono">{h.codigo}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900 dark:text-white text-xs font-bold tracking-wide uppercase">{found ? found.titulo : "Desconhecido"}</span>
                                                        <span className="text-slate-700 dark:text-[#64748B] text-[10px]">{new Date(h.data).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'info' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
                           <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-6 shadow-lg shadow-slate-300/50 dark:shadow-black/40 text-center flex flex-col items-center">
                                <Info className="w-12 h-12 text-[#E70000] mb-4" />
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-wider uppercase mb-2">Honda Scan V4.1</h2>
                                <p className="text-slate-800 dark:text-[#8C92A0] text-sm leading-relaxed mb-6">
                                    Ferramenta não-oficial de apoio a profissionais. Baseada em códigos abertos OBD e manuais de serviço da linha PGM-FI.
                                </p>
                                <div className="w-full h-[1px] bg-[#242938] mb-6"></div>
                                <div className="flex flex-col space-y-2 w-full">
                                    <button 
                                        onClick={toggleTheme}
                                        className="flex justify-between items-center bg-slate-100 dark:bg-[#0B0E14] p-3 rounded-md border border-slate-300 dark:border-[#242938] hover:bg-slate-200 dark:hover:bg-[#1A1F2D] transition-colors active:scale-95"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {theme === 'dark' ? <Moon className="w-4 h-4 text-[#8C92A0]" /> : <Sun className="w-4 h-4 text-slate-800" />}
                                            <span className="text-slate-700 dark:text-[#ADB0B8] text-xs font-bold uppercase">Aparência</span>
                                        </div>
                                        <span className="text-[#E70000] text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-[#121620] px-2 py-1 rounded border border-slate-300 dark:border-[#242938]">
                                            {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                                        </span>
                                    </button>

                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-[#0B0E14] p-3 rounded-md border border-slate-300 dark:border-[#242938]">
                                        <span className="text-slate-700 dark:text-[#64748B] text-xs font-bold uppercase">Uso Responsável</span>
                                        <CheckCircle2 className="w-4 h-4 text-[#0033FF] dark:text-[#00FF4D]" />
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-100 dark:bg-[#0B0E14] p-3 rounded-md border border-slate-300 dark:border-[#242938]">
                                        <span className="text-slate-700 dark:text-[#64748B] text-xs font-bold uppercase">Updates Lifetime</span>
                                        <CheckCircle2 className="w-4 h-4 text-[#0033FF] dark:text-[#00FF4D]" />
                                    </div>
                                </div>
                           </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 inset-x-0 h-16 bg-slate-100 dark:bg-[#0B0E14] border-t border-slate-300 dark:border-[#242938] flex items-center justify-around px-2 z-50">
                <button 
                    onClick={() => setActiveTab('diagnostico')}
                    className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors ${activeTab === 'diagnostico' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Diagnóstico</span>
                </button>
                <button 
                    onClick={() => setActiveTab('codigos')}
                    className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors ${activeTab === 'codigos' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <List className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Códigos</span>
                </button>
                <button 
                    onClick={() => setActiveTab('historico')}
                    className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors ${activeTab === 'historico' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Clock className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Histórico</span>
                </button>
                <button 
                    onClick={() => setActiveTab('scanner')}
                    className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors ${activeTab === 'scanner' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <ScanText className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Scanner</span>
                </button>
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors ${activeTab === 'info' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Info className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Informações</span>
                </button>
            </div>
        </div>
    );
}
