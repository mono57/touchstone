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

const SCREENS = {
  setup: SetupScreen,
  annotate: AnnotateScreen,
  overview: OverviewScreen,
  export: ExportScreen,
  config: ConfigScreen,
};

export default function App() {
  const screen = useStore(st => st.screen);
  const theme = useStore(st => st.theme);
  const Screen = SCREENS[screen] || SetupScreen;

  // Theme = CSS custom properties applied inline on the root; class rules below
  // read them via var().
  return (
    <div className={s.app} style={css(themeVars(theme))}>
      <Sidebar />
      <main className={s.main}>
        <Screen />
      </main>
    </div>
  );
}
