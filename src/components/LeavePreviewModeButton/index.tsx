import Link from 'next/link';

import styles from './styles.module.scss';

export function LeavePreviewModeButton(): JSX.Element {
  return (
    <aside className={styles.buttonContainer}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
