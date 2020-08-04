import React, { useContext } from 'react';
import styled from 'styled-components';
import PexElem, {
  RedSpan,
  PexSpan,
  pexElemsType,
  computePexElems,
} from './PexElem';
import PreferencesContext from '../contexts/PreferencesContext';
import { HandLargeText } from '../styles/Texts';

const HandText = styled(HandLargeText)`
  display: flex;
  justify-content: center;
  span {
    font-size: 1.5rem;
  }
`;

const StyledPexSpan = styled(PexSpan)`
  width: 60%;
  max-width: 20rem;
  display: flex;
  justify-content: space-between;
`;

const Ul = styled.ul`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Li = styled.li`
  width: 100%;
  display: flex;
  justify-content: center;
  :hover {
    .hideHover {
      display: none;
    }
    .showHover {
      display: inherit;
    }
  }
  .hideHover {
    display: inherit;
  }
  .showHover {
    display: none;
  }
`;

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
    pexElemsAttributes,
    currentPex,
    nextPex
  );
  const abilitiesPercent = computePercentPex(
    pexElemsAbilities,
    currentPex,
    nextPex
  );
  const powersPercent = computePercentPex(pexElemsPowers, currentPex, nextPex);
  const miscPercent = computePercentPex(pexElemsMisc, currentPex, nextPex);
  return (
    <HandText>
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
    </HandText>
  );
};

export default PexPercentage;
