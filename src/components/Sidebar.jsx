import s from './Sidebar.module.css';
import { useStore } from '../state/useStore.js';
import { SetupIcon, AnnotateIcon, OverviewIcon, ExportIcon, ConfigIcon } from './icons.jsx';

const NAV = [
  { id: 'setup', label: 'Configuration', Icon: SetupIcon },
  { id: 'annotate', label: 'Annotation', Icon: AnnotateIcon, badge: true },
  { id: 'overview', label: 'Golden set', Icon: OverviewIcon },
  { id: 'export', label: 'Export', Icon: ExportIcon },
  { id: 'config', label: 'Contrat / YAML', Icon: ConfigIcon },
];

export default function Sidebar() {
  const screen = useStore(st => st.screen);
  const backend = useStore(st => st.backend);
  const theme = useStore(st => st.theme);
  const questions = useStore(st => st.questions);
  const setScreen = useStore(st => st.setScreen);
  const cycleBackend = useStore(st => st.cycleBackend);
  const toggleTheme = useStore(st => st.toggleTheme);

  const pending = questions.filter(q => !q.done).length;

  return (
    <aside className={s.aside}>
      <div className={s.header}>
        <div className={s.logo} />
        <div className={s.brand}>Touchstone</div>
        <div className={s.version}>v1</div>
      </div>

      <div className={s.block}>
        <div className={s.overline}>Backend actif</div>
        <button className={s.backendBtn} onClick={cycleBackend}>
          <span className={s.healthDot} />
          <span className={s.backendName}>{backend}</span>
          <span className={s.reach}>joignable</span>
        </button>
      </div>

      <nav className={s.nav}>
        <div className={s.navOverline}>Espace de travail</div>
        {NAV.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={screen === id ? `${s.navItem} ${s.navItemActive}` : s.navItem}
          >
            <Icon />
            <span className={s.navLabel}>{label}</span>
            {badge && pending > 0 && <span className={s.badge}>{pending}</span>}
          </button>
        ))}
      </nav>

      <div className={s.footer}>
        <button className={s.themeBtn} onClick={toggleTheme}>
          <span className={s.moon} />
          <span className={s.themeLabel}>{theme === 'dark' ? 'Thème sombre' : 'Thème clair'}</span>
        </button>
      </div>
    </aside>
  );
}
