import { History, ListOrdered, Music, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RuleEditor from '../components/RuleEditor';
import RuleFieldList from '../components/RuleFieldList';
import RuleHistory from '../components/RuleHistory';
import Tabs from '../components/Tabs';
import { useRules } from '../lib/rules';
import panel from '../components/RulePanel.module.css';
import styles from './RulesPage.module.css';

export type RulesTab = 'dsps' | 'enrichment' | 'history';

const PATHS: Record<RulesTab, string> = {
  dsps: '/rules',
  enrichment: '/rules/enrichment',
  history: '/rules/history',
};

const TABS = [
  { id: 'dsps', label: 'DSPs', icon: Music },
  { id: 'enrichment', label: 'Enrichment', icon: Sparkles },
  { id: 'history', label: 'History', icon: History },
];

/** Harmonisation rules (Figma 607:5060, 607:5712, 608:6057, 611:5507). IFPI user only; the route guard is in App. */
export default function RulesPage({ tab }: { tab: RulesTab }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { fields } = useRules();
  const field = fields.find((f) => f.id === params.get('field')) ?? fields[0];

  const href = (fieldId: string, to: RulesTab = tab) =>
    fieldId === fields[0].id ? PATHS[to] : `${PATHS[to]}?field=${fieldId}`;
  const Icon = field.icon;

  return (
    <>
      <PageHeader title="Harmonisation rules" icon={ListOrdered} subtitle="Choose which source wins when DSPs disagree on a field" />
      <div className={styles.panels}>
        <RuleFieldList fields={fields} selectedId={field.id} hrefFor={(id) => href(id)} />

        <section className={styles.rule} aria-labelledby="rule-title">
          <header className={styles.header}>
            <span className={styles.iconTile} aria-hidden="true">
              <Icon size={20} />
            </span>
            <div className={styles.titles}>
              <h2 id="rule-title" className={styles.title}>
                {field.label} Hierarchy
              </h2>
              <p className={styles.subtitle}>{field.subtitle}</p>
            </div>
            <span className={panel.countChip}>Version {field.history[0]?.version}</span>
          </header>
          <div className={styles.tabsRow}>
            <Tabs label="Rule sections" items={TABS} value={tab} onChange={(id) => navigate(href(field.id, id as RulesTab))} />
          </div>
          {tab === 'history' ? <RuleHistory key={field.id} field={field} /> : <RuleEditor field={field} kind={tab} />}
        </section>
      </div>
    </>
  );
}
