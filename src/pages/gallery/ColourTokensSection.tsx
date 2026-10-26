import { semanticTokenGroups } from '../../lib/semanticTokens';
import GallerySection, { Group } from './GallerySection';
import styles from './Gallery.module.css';

export default function ColourTokensSection() {
  return (
    <GallerySection id="colours" title="Colour tokens" note="Semantic tokens from tokens.css (palette excluded).">
      {semanticTokenGroups.map(({ group, tokens }) => (
        <Group key={group} title={group}>
          <ul className={styles.tokenList}>
            {tokens.map((token) => (
              <li key={token.name} className={styles.tokenRow}>
                <span className={styles.swatch} style={{ background: `var(${token.name})` }} />
                <span className={styles.tokenName}>{token.name}</span>
                <span className={styles.tokenValue}>
                  {token.light} / {token.dark}
                </span>
              </li>
            ))}
          </ul>
        </Group>
      ))}
    </GallerySection>
  );
}
