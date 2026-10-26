import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Upload, Camera, Check, RotateCcw, Zap, FileText, Edit2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const DEMO_RESULT = {
  entries: [
    { customer: 'Raju', items: 'Tel 1L, Atta 5kg, Cheeni 2kg', amount: 620, type: 'udhaar' },
    { customer: 'Meena', items: 'Sabun 3, Shampoo 2', amount: 185, type: 'udhaar' },
    { customer: 'Deepak', items: 'Maggi 10, Biscuit 5', amount: 190, type: 'paid' },
    { customer: 'Kavita', items: 'Doodh 2L, Bread 1', amount: 125, type: 'udhaar' },
  ],
};

export default function KhataScan() {
  const { state } = useApp();
  const { language } = state;

  const [step, setStep] = useState('upload');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleUpload = () => {
    setStep('processing');
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setResult(DEMO_RESULT);
      setStep('result');
    }, 2500);
  };

  const handleReset = () => {
    setStep('upload');
    setResult(null);
    setSaved(false);
  };

  return (
    <PageWrapper title="Khata Scan" titleHi="खाता स्कैन">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white text-center">
        <h2 className="text-lg font-bold mb-1">
          {language === 'hi' ? '📸 हाथ से लिखा खाता स्कैन करो' : '📸 Scan Your Handwritten Khata'}
        </h2>
        <p className="text-sm text-white/80">
          {language === 'hi' ? 'फोटो खींचो — AI पढ़ेगा, डिजिटल बनाएगा' : 'Take a photo — AI reads messy handwriting into digital records'}
        </p>
      </motion.div>

      {/* Upload Area */}
      {step === 'upload' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-8 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleUpload}>
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-amber-600" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-white mb-1">
            {language === 'hi' ? 'खाता की फोटो अपलोड करो' : 'Upload Khata Photo'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {language === 'hi' ? 'टैप करके कैमरा या गैलरी से चुनो' : 'Tap to capture or choose from gallery'}
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 text-xs font-medium flex items-center gap-1">
              <Camera className="w-3 h-3" /> Camera
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 text-xs font-medium flex items-center gap-1">
              <Upload className="w-3 h-3" /> Gallery
            </span>
          </div>
        </motion.div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="font-semibold text-gray-800 dark:text-white">
            {language === 'hi' ? '🤖 AI खाता पढ़ रहा है...' : '🤖 AI Reading Your Khata...'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'hi' ? 'हाथ की लिखावट पहचान रहा है' : 'Recognizing handwriting patterns'}
          </p>
        </motion.div>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {language === 'hi' ? 'AI ने पढ़ा — ये मिला' : 'AI Parsed Result — Extracted Entries'}
              </span>
              <span className="badge badge-success ml-auto">{result.entries.length} entries</span>
            </div>

            <div className="space-y-3">
              {result.entries.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                    {entry.customer[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{entry.customer}</p>
                    <p className="text-xs text-gray-500 truncate">{entry.items}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(entry.amount)}</p>
                    <span className={`text-[10px] font-medium ${entry.type === 'udhaar' ? 'text-amber-600' : 'text-green-600'}`}>
                      {entry.type === 'udhaar' ? 'Udhaar' : 'Paid'}
                    </span>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><Edit2 className="w-3 h-3" /></button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleReset}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {language === 'hi' ? 'फिर से' : 'Rescan'}
            </button>
            <button onClick={() => setSaved(true)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 ${saved ? 'bg-green-500' : 'gradient-primary hover:shadow-lg'}`}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><FileText className="w-4 h-4" /> {language === 'hi' ? 'सेव करो' : 'Confirm & Save'}</>}
            </button>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
