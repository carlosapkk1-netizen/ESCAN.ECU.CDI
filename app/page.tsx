'use client';

import React, { useState } from 'react';
import { 
    Menu, 
    Settings, 
    Minus, 
    Plus, 
    Search, 
    Copy, 
    AlertTriangle, 
    Home, 
    List, 
    Clock, 
    Info, 
    HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

type DiagnosticResult = {
    titulo: string;
    subtitulo: string;
    verificacoes: string[];
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
    const [longas, setLongas] = useState(0);
    const [curtas, setCurtas] = useState(0);
    const [resultado, setResultado] = useState<{ codigo: number, falha: DiagnosticResult | null } | null>(null);

    const handleRun = () => {
        const codigo = (longas * 10) + curtas;
        const falha = banco[codigo] || null;
        setResultado({ codigo, falha });
    };

    return (
        <div className="min-h-screen bg-[#080B12] text-white font-sans flex flex-col selection:bg-red-500/30">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#242938]/50 relative z-10">
                <button className="text-white hover:text-gray-300">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E70000] to-transparent opacity-50"></div>
                <button className="text-white hover:text-gray-300">
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
                        <img 
                            src="https://raw.githubusercontent.com/carlosapkk1/honda-diagnostics/main/public/logo.png" 
                            alt="Scan ECU CDI"
                            className="w-52 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,100,0.5)]"
                            onError={(e) => {
                                // Fallback para logo local na pasta public que também chamaremos logo.png, logo1.png ou a original
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = "/logo1.png";
                            }}
                        />

                        <div className="flex items-center space-x-2">
                            <h1 className="text-[#E70000] text-2xl font-black tracking-widest uppercase">Honda</h1>
                            <h1 className="text-white text-2xl font-light tracking-widest uppercase">Diagnostics</h1>
                        </div>
                        <div className="flex items-center mt-1 w-full justify-center space-x-3">
                            <div className="h-[1px] w-8 bg-[#E70000]/80"></div>
                            <p className="text-[#64748B] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">System Protocol V4.1</p>
                            <div className="h-[1px] w-8 bg-[#E70000]/80"></div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-[#121620] border border-[#242938] rounded-xl p-3 flex justify-between items-center mb-6 shadow-lg shadow-black/40">
                        <div className="flex items-center space-x-4">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-[#00FF4D]/30 shadow-[0_0_10px_rgba(0,255,77,0.2)]">
                                <div className="w-3 h-3 rounded-full bg-[#00FF4D]"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#8C92A0] text-[10px] uppercase font-bold tracking-wider">Status</span>
                                <div className="flex items-center space-x-1">
                                    <span className="text-[#00FF4D] text-sm font-bold tracking-wide uppercase">Conectado</span>
                                    <span className="text-[#8C92A0] text-sm tracking-wide">via OBD-II</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-10 h-7 border border-[#00FF4D] rounded flex items-center justify-center bg-[#00FF4D]/5 text-[#00FF4D]">
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
                    <div className="bg-[#121620] border border-[#242938] rounded-xl p-4 sm:p-5 mb-5 shadow-lg shadow-black/40">
                        <div className="flex justify-center items-center mb-6 relative">
                            <h2 className="text-[#ADB0B8] text-sm font-semibold tracking-widest uppercase">Inserir Piscadas</h2>
                            <HelpCircle className="w-4 h-4 text-[#8C92A0] absolute right-0 cursor-pointer" />
                        </div>

                        {/* Longas */}
                        <div className="mb-5">
                            <label className="text-[#8C92A0] text-[11px] font-medium tracking-widest block text-center mb-3 uppercase">
                                Piscadas Longas (Dezenas)
                            </label>
                            <div className="flex justify-between items-center gap-3">
                                <button 
                                    onClick={() => setLongas(Math.max(0, longas - 1))}
                                    className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                >
                                    <Minus className="w-5 h-5 text-white" />
                                </button>
                                <div className="flex-1 h-12 bg-[#0B0E14] border border-[#242938] rounded-md flex items-center justify-center shadow-inner">
                                    <span className="text-[#E70000] text-2xl font-bold font-mono">{longas}</span>
                                </div>
                                <button 
                                    onClick={() => setLongas(longas + 1)}
                                    className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                >
                                    <Plus className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Curtas */}
                        <div className="mb-6">
                            <label className="text-[#8C92A0] text-[11px] font-medium tracking-widest block text-center mb-3 uppercase">
                                Piscadas Curtas (Unidades)
                            </label>
                            <div className="flex justify-between items-center gap-3">
                                <button 
                                    onClick={() => setCurtas(Math.max(0, curtas - 1))}
                                    className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                >
                                    <Minus className="w-5 h-5 text-white" />
                                </button>
                                <div className="flex-1 h-12 bg-[#0B0E14] border border-[#242938] rounded-md flex items-center justify-center shadow-inner">
                                    <span className="text-[#E70000] text-2xl font-bold font-mono">{curtas}</span>
                                </div>
                                <button 
                                    onClick={() => setCurtas(curtas + 1)}
                                    className="w-12 h-10 border border-[#E70000] rounded-md flex items-center justify-center bg-[#121620] hover:bg-[#E70000]/10 transition-colors active:scale-95"
                                >
                                    <Plus className="w-5 h-5 text-white" />
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
                                className="bg-[#121620] border border-[#242938] rounded-xl p-4 sm:p-5 shadow-lg shadow-black/40"
                            >
                                <h3 className="text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Código Identificado</h3>
                                <div className="flex items-center justify-between bg-[#0B0E14] border border-[#242938] rounded-md h-16 px-4 mb-5">
                                    <div className="flex-1 flex justify-center">
                                        <span className="text-[#00FF4D] text-4xl font-bold font-mono tracking-wider">{resultado.codigo}</span>
                                    </div>
                                    <button className="text-[#00FF4D] hover:text-green-400 p-2 opacity-80 hover:opacity-100 transition-opacity">
                                        <Copy className="w-6 h-6" />
                                    </button>
                                </div>

                                <h3 className="text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Falha Identificada</h3>
                                <div className="bg-[#0B0E14] border border-[#242938] rounded-md p-3 mb-5 flex gap-4 items-start">
                                    <div className="mt-1">
                                        <AlertTriangle className={resultado.falha ? "w-8 h-8 text-[#E70000]" : "w-8 h-8 text-yellow-500"} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm tracking-wide mb-1 uppercase">
                                            {resultado.falha ? resultado.falha.titulo : "CÓDIGO DESCONHECIDO"}
                                        </span>
                                        <span className="text-[#8C92A0] text-xs">
                                            {resultado.falha ? resultado.falha.subtitulo : "Este código não foi encontrado no banco de dados."}
                                        </span>
                                    </div>
                                </div>

                                {resultado.falha && (
                                    <>
                                        <h3 className="text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-3">Verificações Recomendadas</h3>
                                        <ul className="space-y-2.5">
                                            {resultado.falha.verificacoes.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF4D]"></div>
                                                    <span className="text-[#ADB0B8] text-[13px]">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 inset-x-0 h-16 bg-[#0B0E14] border-t border-[#242938] flex items-center justify-around px-2 z-50">
                <button className="flex flex-col items-center justify-center space-y-1 text-[#E70000] w-20">
                    <Home className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Diagnóstico</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-1 text-[#8C92A0] hover:text-white transition-colors w-20">
                    <List className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Códigos</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-1 text-[#8C92A0] hover:text-white transition-colors w-20">
                    <Clock className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Histórico</span>
                </button>
                <button className="flex flex-col items-center justify-center space-y-1 text-[#8C92A0] hover:text-white transition-colors w-20">
                    <Info className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Informações</span>
                </button>
            </div>
        </div>
    );
}
