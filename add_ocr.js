const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Add Tesseract import and Camera/UploadFilm icons if needed
if (!code.includes("import Tesseract")) {
    code = code.replace(/import Image from 'next\/image';/, `import Image from 'next/image';\nimport Tesseract from 'tesseract.js';\nimport { Camera, Image as ImageIcon, ScanText, Loader2 } from 'lucide-react';`);
}

// 2. Add ECU Database
if (!code.includes("ecuDatabase")) {
    const ecuDbStr = `
const ecuDatabase: Record<string, {modelo: string, detalhes: string, sintomas: string}> = {
    '38770-KVS-J01': { modelo: 'CG 150 Titan Mix', detalhes: 'Sistema de Injeção KEIHIN', sintomas: 'Corte de giro precoce, falha no MAP' },
    '38770-KRE-G01': { modelo: 'NXR 160 Bros', detalhes: 'FlexOne 2015+', sintomas: 'Bomba de combustível não aciona' },
    '38770-KVK-B21': { modelo: 'CB 300R', detalhes: 'Módulo PGM-FI', sintomas: 'Apagões repentinos em marcha lenta' },
    '38770-KRM-851': { modelo: 'CG 150 Titan 2004-2008', detalhes: 'Injeção PGM-FI Básica', sintomas: 'Falha de centelha no cilindro' }
};
`;
    code = code.replace(/const banco: Record<number, DiagnosticResult> = \{[\s\S]*?\};/, match => match + "\n" + ecuDbStr);
}

// 3. Add activeTab 'scanner' to types
code = code.replace(/<'diagnostico' \| 'codigos' \| 'historico' \| 'info'>/, `<'diagnostico' | 'codigos' | 'historico' | 'info' | 'scanner'>`);

// 4. Add state for OCR
if (!code.includes("const [ocrLoading")) {
    const stateStr = `    const [ocrLoading, setOcrLoading] = useState(false);
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
            console.log("OCR Extracted text:", text);
            
            // Regex to find Honda ECU patterns (usually start with 38770-XXX-XXX)
            const match = text.match(/38770-[A-Z0-9]{3}-[A-Z0-9]{3}/) || text.match(/[A-Z0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}/);
            
            if (match) {
                const codigo = match[0];
                const info = ecuDatabase[codigo] || { modelo: 'Modelo Desconhecido / Genérico', detalhes: 'ECU não encontrada no banco local.', sintomas: 'Consulte o manual de serviço.' };
                setEcuResult({ codigo, modelo: info.modelo, detalhes: info.detalhes, sintomas: info.sintomas });
            } else {
                setEcuResult({ codigo: 'NÃO ENCONTRADO', modelo: 'Código ECU Invalido ou Ilegível', detalhes: 'Tente tirar uma foto mais nítida com boa iluminação, focando diretamente no código impresso no adesivo do módulo.', sintomas: '' });
            }

        } catch (error) {
            console.error(error);
            setEcuResult({ codigo: 'ERRO OCR', modelo: 'Falha no processamento', detalhes: 'Não foi possível ler a imagem.', sintomas: '' });
        }
        
        setOcrLoading(false);
    };
`;
    // Insert after "const [theme..."
    code = code.replace(/const \[theme[^\n]+;\n/, match => match + "\n" + stateStr);
}

// 5. Add scanner tab in bottom nav
const bottomNavScanner = `
                <button 
                    onClick={() => setActiveTab('scanner')}
                    className={\`flex flex-col items-center justify-center space-y-1 w-20 transition-colors \${activeTab === 'scanner' ? 'text-[#E70000]' : 'text-slate-800 dark:text-[#8C92A0] hover:text-slate-900 dark:hover:text-white'}\`}
                >
                    <ScanText className="w-6 h-6" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Scanner</span>
                </button>
`;
if (!code.includes("ScanText className=")) {
    code = code.replace(/<button \n\s*onClick=\{\(\) => setActiveTab\('info'\)\}/, match => bottomNavScanner + "\n" + match);
}

// 6. Add Scanner Tab UI logic
const scannerUI = `
                    {/* OCR Scanner Tab */}
                    {activeTab === 'scanner' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            
                            <div className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-5 mb-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-slate-800 dark:text-[#8C92A0] text-sm font-bold tracking-widest uppercase">Captura OCR ECU CDI</h2>
                                    <ScanText className="w-5 h-5 text-[#E70000]" />
                                </div>
                                <p className="text-slate-700 dark:text-[#ADB0B8] text-xs mb-5">Tire uma foto ou envie a imagem do adesivo do módulo ECU para extração automática do código.</p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 h-12 bg-[#CC0000] hover:bg-[#E60000] rounded-md flex justify-center items-center space-x-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(204,0,0,0.3)]"
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
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#0033FF] dark:text-[#00FF4D]">Analisando Imagem...</span>
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                                    <div className="bg-[#0033FF] dark:bg-[#00FF4D] h-1.5 rounded-full transition-all duration-300" style={{ width: \`\${ocrProgress}%\` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {ocrLoading && <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#E70000] shadow-[0_0_10px_rgba(231,0,0,0.8)] animate-[pulseGlow_1s_infinite] Z-10 pointer-events-none"></div>}
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {ecuResult && !ocrLoading && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121620] border border-slate-300 dark:border-[#242938] rounded-xl p-5 shadow-lg shadow-slate-300/50 dark:shadow-black/40">
                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Código Extraído (OCR)</h3>
                                        <div className="flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14] border-2 border-slate-300 dark:border-[#242938] rounded-md h-16 px-4 mb-4 shadow-inner">
                                            <span className="text-[#0033FF] dark:text-[#00FF4D] text-3xl md:text-4xl font-black font-mono tracking-wider">{ecuResult.codigo}</span>
                                        </div>

                                        <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Especificação do Módulo</h3>
                                        <div className="bg-slate-100 dark:bg-[#0B0E14] border border-slate-300 dark:border-[#242938] rounded-md p-3 mb-4">
                                            <span className="block text-slate-900 dark:text-white font-bold text-sm tracking-wide uppercase mb-1">{ecuResult.modelo}</span>
                                            <span className="block text-slate-700 dark:text-[#8C92A0] text-xs">{ecuResult.detalhes}</span>
                                        </div>

                                        {ecuResult.sintomas && (
                                            <>
                                                <h3 className="text-slate-800 dark:text-[#8C92A0] text-[11px] font-bold tracking-widest uppercase mb-2">Sintomas Comuns</h3>
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
`;
// Insert before activeTab === 'codigos'
if (!code.includes("Scanner Tab UI logic")) {
    code = code.replace(/\{activeTab === 'codigos' && \(/, match => scannerUI + "\n                    " + match);
}

// Let's ensure the imported lucide react icons are not duplicated and we don't throw an error
code = code.replace(/import \{([^\}]+)\} from 'lucide-react';/g, (match, p1) => {
    let icons = p1.split(',').map(i => i.trim());
    if(!icons.includes('ScanText')) icons.push('ScanText');
    if(!icons.includes('Loader2')) icons.push('Loader2');
    if(!icons.includes('Image')) icons.push('Image as ImageIcon');
    // Remove duplicates
    icons = [...new Set(icons)];
    return \`import { \${icons.join(', ')} } from 'lucide-react';\`;
});


fs.writeFileSync('app/page.tsx', code);
console.log("OCR scanner tab added!");
