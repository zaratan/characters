import { useContext } from 'react';
import type { pexElemsType } from './PexElem';
import PexElem, { PexSpan, computePexElems } from './PexElem';
import PreferencesContext from '../contexts/PreferencesContext';

const PexHandText = ({ children }: { children: React.ReactNode }) => (
  <span className="font-bilbo text-[2rem] text-neutral-700 dark:text-neutral-300 flex justify-center [&_span]:text-[1.5rem]">
    {children}
  </span>
);

const StyledPexSpan = ({ children }: { children: React.ReactNode }) => (
  <PexSpan className="w-[60%] max-w-[20rem] flex justify-between">
    {children}
  </PexSpan>
);

const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="w-full flex flex-col items-center">{children}</ul>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="pex-hover-container w-full flex justify-center">{children}</li>
);

const computePercentPex = (
  pexElems: pexElemsType,
  currentPex: number,
  nextPex: number
) => {
  const attrPex = computePexElems(pexElems);
  const percent = {
    current: Math.round((attrPex.current / currentPex) * 10000) / 100,
    next:
      Math.round(((attrPex.current + attrPex.diff) / nextPex) * 10000) / 100,
    diff: 0,
  };
  percent.diff = Math.round((percent.next - percent.current) * 100) / 100;
  return percent;
};

const PexPercentage = ({
  pexElemsAttributes,
  pexElemsAbilities,
  pexElemsMisc,
  pexElemsPowers,
  totalPex,
}: {
  pexElemsAttributes?: pexElemsType;
  pexElemsAbilities?: pexElemsType;
  pexElemsPowers?: pexElemsType;
  pexElemsMisc?: pexElemsType;
  totalPex: { current: number; diff: number };
}) => {
  const { showPex } = useContext(PreferencesContext);
  if (!showPex) return null;
  const currentPex = totalPex.current;
  const nextPex = totalPex.current + totalPex.diff;
  const attributesPercent = computePercentPex(
    pexElemsAttributes ?? [],
    currentPex,
    nextPex
  );
  const abilitiesPercent = computePercentPex(
    pexElemsAbilities ?? [],
    currentPex,
    nextPex
  );
  const powersPercent = computePercentPex(
    pexElemsPowers ?? [],
    currentPex,
    nextPex
  );
  const miscPercent = computePercentPex(
    pexElemsMisc ?? [],
    currentPex,
    nextPex
  );
  return (
    <PexHandText>
      <Ul>
        <Li>
          <StyledPexSpan>
            <span>Attributs: </span>
            <PexElem
              currentPex={attributesPercent.current}
              diffPex={attributesPercent.diff}
              withSpaces
              withPercent
              hideParentheses
              alwaysShow
              hover={attributesPercent.next}
            />
          </StyledPexSpan>
        </Li>
        <Li>
          <StyledPexSpan>
            <span>Capacitées: </span>
            <PexElem
              currentPex={abilitiesPercent.current}
              diffPex={abilitiesPercent.diff}
              withSpaces
              withPercent
              hideParentheses
              alwaysShow
              hover={abilitiesPercent.next}
            />
          </StyledPexSpan>
        </Li>
        <Li>
          <StyledPexSpan>
            <span>Pouvoirs: </span>
            <PexElem
              currentPex={powersPercent.current}
              diffPex={powersPercent.diff}
              withSpaces
              withPercent
              hideParentheses
              alwaysShow
              hover={powersPercent.next}
            />
          </StyledPexSpan>
        </Li>
        <Li>
          <StyledPexSpan>
            <span>Divers: </span>
            <PexElem
              currentPex={miscPercent.current}
              diffPex={miscPercent.diff}
              withSpaces
              withPercent
              hideParentheses
              alwaysShow
              hover={miscPercent.next}
            />
          </StyledPexSpan>
        </Li>
      </Ul>
    </PexHandText>
  );
};

export default PexPercentage;
