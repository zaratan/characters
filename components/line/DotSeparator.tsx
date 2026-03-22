import type { HTMLAttributes } from 'react';
import classNames from '../../helpers/classNames';

const DotSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={classNames('dot-separator', className)} {...props} />
);
export default DotSeparator;
