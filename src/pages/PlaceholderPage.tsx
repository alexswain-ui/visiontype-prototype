import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PlaceholderPanel from '../components/PlaceholderPanel';

export interface PlaceholderPageProps {
  title: string;
  icon?: LucideIcon;
  subtitle?: ReactNode;
  figmaNode?: string;
  links?: { to: string; label: string }[];
  children: ReactNode;
}

/** A routed page that is not built yet: real header, plus a note on what it will be. */
export default function PlaceholderPage({ title, icon, subtitle, figmaNode, links, children }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} icon={icon} subtitle={subtitle} />
      <PlaceholderPanel figmaNode={figmaNode} links={links}>
        {children}
      </PlaceholderPanel>
    </>
  );
}
