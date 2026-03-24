import type { HTMLAttributes } from 'react';
import type { TempElemType } from '../types/TempElemType';
import { Title } from '../styles/Titles';
import { BlackLine, EmptyLine } from '../styles/Lines';
import PexElem from './PexElem';
import classNames from '../helpers/classNames';

export const StyledTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <Title
    className={classNames('px-4 whitespace-nowrap', className)}
    {...props}
  />
);

const SectionTitle = ({
  title,
  pexElems,
}: {
  title?: string;
  pexElems?: Array<{
    elemArray: Array<TempElemType<number>>;
    pexCalc: (value: number) => number;
  }>;
}) => (
  <>
    <EmptyLine />
    <EmptyLine>
      <BlackLine />
      {title ? (
        <StyledTitle>
          {title}
          <PexElem pexElems={pexElems} />
        </StyledTitle>
      ) : (
        ''
      )}
      <BlackLine />
    </EmptyLine>
  </>
);

export default SectionTitle;
