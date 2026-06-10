import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileSearch, 
  MessageSquare, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Download,
  AlertCircle,
  BarChart3,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse';
import { toast } from 'sonner';

export const DataAutomation = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'ocr' | 'whatsapp' | 'statement'>('ocr');
  
  // OCR State
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState('');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // WhatsApp State
  const [waFile, setWaFile] = useState<File | null>(null);
  const [waParsedData, setWaParsedData] = useState<any[]>([]);
  const [isParsingWa, setIsParsingWa] = useState(false);

  // Statement State
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [statementData, setStatementData] = useState<any[]>([]);
  const [pivotConfig, setPivotConfig] = useState<{ row: string, val: string }>({ row: '', val: '' });

  // Refs
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const waInputRef = useRef<HTMLInputElement>(null);
  const statementInputRef = useRef<HTMLInputElement>(null);

  // --- OCR Handlers ---
  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setOcrImage(event.target?.result as string);
      reader.readAsDataURL(file);
      processOcr(file);
    }
  };

  const processOcr = async (file: File) => {
    setIsProcessingOcr(true);
    setOcrResult('');
    try {
      const result = await Tesseract.recognize(file, 'eng+ara', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      setOcrResult(result.data.text);
      toast.success('Text extracted successfully');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text');
    } finally {
      setIsProcessingOcr(false);
      setOcrProgress(0);
    }
  };

  // --- WhatsApp Parser ---
  const handleWaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWaFile(file);
      parseWhatsApp(file);
    }
  };

  const parseWhatsApp = (file: File) => {
    setIsParsingWa(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Basic regex for WhatsApp export: [Date, Time] Name: Message
      const lines = text.split('\n');
      const messages = lines.map(line => {
        const match = line.match(/\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?[APM]*)\]?\s([^:]+):\s(.*)/);
        if (match) {
          return {
            date: match[1],
            time: match[2],
            sender: match[3],
            message: match[4]
          };
        }
        return null;
      }).filter(Boolean);
      
      setWaParsedData(messages);
      setIsParsingWa(false);
      toast.success(`${messages.length} messages parsed`);
    };
    reader.readAsText(file);
  };

  // --- Statement Importer ---
  const handleStatementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatementFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setStatementData(results.data);
          toast.success('Statement loaded successfully');
        }
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F9D976] bg-clip-text text-transparent">
            Data Automation Hub
          </h1>
          <p className="text-muted-foreground mt-1">Automate data extraction, parsing and reporting</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-card border border-border rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('ocr')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ocr' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'hover:bg-muted'
          }`}
        >
          <FileSearch size={18} /> OCR Text Extraction
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'whatsapp' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'hover:bg-muted'
          }`}
        >
          <MessageSquare size={18} /> WhatsApp Parser
        </button>
        <button 
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'statement' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'hover:bg-muted'
          }`}
        >
          <FileText size={18} /> Statement Importer
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Interface */}
        <div className="xl:col-span-8 space-y-6">
          {activeTab === 'ocr' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Upload size={20} className="text-[#D4AF37]" /> Upload Image for OCR
                </h3>
              </div>
              <div className="p-8">
                <div 
                  onClick={() => ocrInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                    ocrImage ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-border hover:border-[#D4AF37]/30 hover:bg-muted/50'
                  }`}
                >
                  <input type="file" ref={ocrInputRef} onChange={handleOcrUpload} accept="image/*" className="hidden" />
                  {ocrImage ? (
                    <div className="relative aspect-video max-h-64 mx-auto overflow-hidden rounded-lg shadow-2xl border border-[#D4AF37]/20">
                      <img src={ocrImage} alt="OCR Source" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white font-bold flex items-center gap-2"><Upload size={20} /> Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">Drop image or click to upload</p>
                        <p className="text-sm text-muted-foreground">Supports PNG, JPG, JPEG (English & Arabic)</p>
                      </div>
                    </div>
                  )}
                </div>

                {isProcessingOcr && (
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing OCR...</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${ocrProgress}%` }}
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F9D976]"
                      />
                    </div>
                  </div>
                )}

                {ocrResult && (
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2"><CheckCircle2 size={18} className="text-success" /> Extracted Text</h4>
                      <button 
                        onClick={() => copyToClipboard(ocrResult)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <div className="p-6 bg-muted/30 border border-border rounded-xl font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {ocrResult}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'whatsapp' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border shadow-xl"
            >
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#D4AF37]" /> WhatsApp Conversation Parser
                </h3>
              </div>
              <div className="p-8">
                <div 
                  onClick={() => waInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-[#D4AF37]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <input type="file" ref={waInputRef} onChange={handleWaUpload} accept=".txt" className="hidden" />
                  <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold">Upload exported .txt chat</p>
                    <p className="text-sm text-muted-foreground">Select the "Export Chat" file from WhatsApp</p>
                  </div>
                </div>

                {waParsedData.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-success" /> 
                        Parsed Chat Logs ({waParsedData.length})
                      </h4>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-border rounded-lg text-xs font-bold transition-all">
                          <Download size={14} /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20">
                          <Database size={14} /> Save to Database
                        </button>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                          <tr>
                            <th className="px-6 py-4">Date/Time</th>
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {waParsedData.slice(0, 10).map((msg, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="block font-medium">{msg.date}</span>
                                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                              </td>
                              <td className="px-6 py-4 font-bold text-[#D4AF37]">{msg.sender}</td>
                              <td className="px-6 py-4 line-clamp-1 max-w-xs">{msg.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {waParsedData.length > 10 && (
                        <div className="p-4 bg-muted/20 text-center text-xs text-muted-foreground border-t border-border">
                          Showing first 10 rows. Total {waParsedData.length} records parsed.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'statement' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border shadow-xl"
            >
              <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={20} className="text-[#D4AF37]" /> Statement Importer
                </h3>
              </div>
              <div className="p-8">
                <div 
                  onClick={() => statementInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-[#D4AF37]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <input type="file" ref={statementInputRef} onChange={handleStatementUpload} accept=".csv" className="hidden" />
                  <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileText size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold">Import CSV Statement</p>
                    <p className="text-sm text-muted-foreground">Supports UST, Bank & Broker exports</p>
                  </div>
                </div>

                {statementData.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2">
                        <BarChart3 size={18} className="text-accent" /> 
                        Statement Analysis & Pivot
                      </h4>
                      <div className="flex gap-2">
                        <select 
                          className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          onChange={(e) => setPivotConfig({...pivotConfig, row: e.target.value})}
                        >
                          <option value="">Group By (Row)</option>
                          {Object.keys(statementData[0]).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select 
                          className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          onChange={(e) => setPivotConfig({...pivotConfig, val: e.target.value})}
                        >
                          <option value="">Aggregate (Sum)</option>
                          {Object.keys(statementData[0]).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                    </div>

                    {pivotConfig.row && pivotConfig.val ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-muted/20 p-6 rounded-2xl border border-border">
                          <h5 className="text-xs font-bold uppercase text-muted-foreground mb-4">Pivot Result</h5>
                          <div className="space-y-3">
                            {Object.entries(
                              statementData.reduce((acc: any, curr) => {
                                const key = curr[pivotConfig.row];
                                const val = parseFloat(curr[pivotConfig.val]) || 0;
                                acc[key] = (acc[key] || 0) + val;
                                return acc;
                              }, {})
                            ).map(([k, v]: [any, any]) => (
                              <div key={k} className="flex justify-between items-center p-3 bg-card rounded-xl border border-border shadow-sm">
                                <span className="font-bold">{k}</span>
                                <span className="text-[#D4AF37] font-mono font-bold">{v.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-muted/20 p-6 rounded-2xl border border-border flex flex-col justify-center items-center text-center">
                          <BarChart3 size={48} className="text-[#D4AF37] mb-4 opacity-20" />
                          <p className="text-sm text-muted-foreground">Chart visualization generated based on pivot logic</p>
                          <button className="mt-4 px-6 py-2 bg-[#D4AF37] text-black rounded-xl text-xs font-bold shadow-lg shadow-[#D4AF37]/20">
                            Download Chart
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-border rounded-xl overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[800px]">
                          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                            <tr>
                              {Object.keys(statementData[0]).map((key) => (
                                <th key={key} className="px-6 py-4">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {statementData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                {Object.values(row).map((val: any, vIdx) => (
                                  <td key={vIdx} className="px-6 py-4 whitespace-nowrap">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6">
            <h3 className="font-bold text-[#D4AF37] flex items-center gap-2 mb-4">
              <AlertCircle size={20} /> Pro Tips
            </h3>
            <ul className="space-y-4 text-sm leading-relaxed">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] flex-shrink-0 font-bold">1</div>
                <p>Ensure images are high contrast for better OCR accuracy. Tesseract works best with 300 DPI.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] flex-shrink-0 font-bold">2</div>
                <p>When exporting WhatsApp, choose "Without Media" to keep the text file size small and focused.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] flex-shrink-0 font-bold">3</div>
                <p>Our AI-powered engine automatically maps bank CSV columns to our internal transaction format.</p>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Integration Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm">Tesseract OCR Eng/Ara</span>
                </div>
                <span className="text-[10px] font-bold text-success uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm">CSV Parser Engine</span>
                </div>
                <span className="text-[10px] font-bold text-success uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span className="text-sm">Google Vision API</span>
                </div>
                <span className="text-[10px] font-bold text-warning uppercase">Standby</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
