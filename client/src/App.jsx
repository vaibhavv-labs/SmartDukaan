import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import KhataBook from './pages/KhataBook';
import Insights from './pages/Insights';
import VoiceBilling from './pages/VoiceBilling';
import KhataScan from './pages/KhataScan';
import BillScan from './pages/BillScan';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/khata" element={<KhataBook />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/voice-billing" element={<VoiceBilling />} />
        <Route path="/khata-scan" element={<KhataScan />} />
        <Route path="/bill-scan" element={<BillScan />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
