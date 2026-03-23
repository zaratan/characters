import type { HTMLAttributes } from 'react';
import classNames from '../../helpers/classNames';
import styles from './DotSeparator.module.css';

const DotSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames(styles.dotSeparator, 'dot-separator', className)}
    {...props}
  />
);
export default DotSeparator;
