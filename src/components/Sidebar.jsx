import { useTranslation } from 'react-i18next';
import s from './Sidebar.module.css';
import { useStore } from '../state/useStore.js';
import { LANGUAGES } from '../i18n/index.js';
import { SetupIcon, AnnotateIcon, OverviewIcon, ExportIcon, ConfigIcon } from './icons.jsx';

const NAV = [
  { id: 'setup', key: 'nav.setup', Icon: SetupIcon },
  { id: 'annotate', key: 'nav.annotate', Icon: AnnotateIcon, badge: true },
  { id: 'overview', key: 'nav.goldenSet', Icon: OverviewIcon },
  { id: 'export', key: 'nav.export', Icon: ExportIcon },
  { id: 'config', key: 'nav.config', Icon: ConfigIcon },
];

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const screen = useStore(st => st.screen);
  const backend = useStore(st => st.backend);
  const theme = useStore(st => st.theme);
  const questions = useStore(st => st.questions);
  const setScreen = useStore(st => st.setScreen);
  const cycleBackend = useStore(st => st.cycleBackend);
  const toggleTheme = useStore(st => st.toggleTheme);

  const pending = questions.filter(q => !q.done).length;
  const lang = i18n.resolvedLanguage;

  return (
    <aside className={s.aside}>
      <div className={s.header}>
        <div className={s.logo} />
        <div className={s.brand}>Touchstone</div>
        <div className={s.version}>v1</div>
      </div>

      <div className={s.block}>
        <div className={s.overline}>{t('sidebar.activeBackend')}</div>
        <button className={s.backendBtn} onClick={cycleBackend}>
          <span className={s.healthDot} />
          <span className={s.backendName}>{backend}</span>
          <span className={s.reach}>{t('sidebar.reachable')}</span>
        </button>
      </div>

      <nav className={s.nav}>
        <div className={s.navOverline}>{t('sidebar.workspace')}</div>
        {NAV.map(({ id, key, Icon, badge }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={screen === id ? `${s.navItem} ${s.navItemActive}` : s.navItem}
          >
            <Icon />
            <span className={s.navLabel}>{t(key)}</span>
            {badge && pending > 0 && <span className={s.badge}>{pending}</span>}
          </button>
        ))}
      </nav>

      <div className={s.footer}>
        <button className={s.themeBtn} onClick={toggleTheme}>
          <span className={s.moon} />
          <span className={s.themeLabel}>{theme === 'dark' ? t('sidebar.darkTheme') : t('sidebar.lightTheme')}</span>
        </button>
        <div className={s.langSwitch}>
          {LANGUAGES.map((code) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className={lang === code ? `${s.langBtn} ${s.langBtnActive}` : s.langBtn}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
