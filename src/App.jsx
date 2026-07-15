import { Routes, Route, Navigate } from 'react-router-dom';
import s from './App.module.css';
import { css } from './lib/css.js';
import { themeVars } from './lib/theme.js';
import { useStore } from './state/useStore.js';
import Sidebar from './components/Sidebar.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import AnnotateScreen from './screens/AnnotateScreen.jsx';
import OverviewScreen from './screens/OverviewScreen.jsx';
import ExportScreen from './screens/ExportScreen.jsx';
import ConfigScreen from './screens/ConfigScreen.jsx';

export default function App() {
  const theme = useStore(st => st.theme);

  // Theme = CSS custom properties applied inline on the root; class rules read
  // them via var(). Which screen is shown is owned by the URL (react-router).
  return (
    <div className={s.app} style={css(themeVars(theme))}>
      <Sidebar />
      <main className={s.main}>
        <Routes>
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/annotate" element={<AnnotateScreen />} />
          <Route path="/golden-set" element={<OverviewScreen />} />
          <Route path="/export" element={<ExportScreen />} />
          <Route path="/contract" element={<ConfigScreen />} />
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </main>
    </div>
  );
}
