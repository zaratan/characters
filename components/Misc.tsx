import React, { useContext } from 'react';
import AdvFlawContext from '../contexts/AdvFlawContext';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import { LineValue } from './Line';
import { calcPexDiffAdvFlaw } from '../helpers/pex';
import { Container } from '../styles/Container';

const Misc = () => {
  const {
    advantages,
    flaws,
    addNewAdvantage,
    addNewFlaw,
    removeAdvantage,
    removeFlaw,
  } = useContext(AdvFlawContext);
  return (
    <>
      <StyledLine title="Misc." />
      <HorizontalSection>
        <Container>
          <ColumnTitleWithOptions
            title="Avantages"
            button={{ glyph: '+', value: addNewAdvantage }}
          />
          <ul>
            {advantages.map((advantage) => (
              <li key={advantage.key}>
                <LineValue
                  changeName={advantage.setTitle}
                  diffPexCalc={(from, to) =>
                    calcPexDiffAdvFlaw(from, to, false)
                  }
                  elem={advantage}
                  name={advantage.title}
                  remove={() => removeAdvantage(advantage.key)}
                  title={advantage.title}
                  placeholderName="Nouvel avantage"
                />
              </li>
            ))}
          </ul>
        </Container>
        <Container>
          <ColumnTitleWithOptions
            title="Inconvénients"
            button={{ glyph: '+', value: addNewFlaw }}
          />
          <ul>
            {flaws.map((flaw) => (
              <li key={flaw.key}>
                <LineValue
                  changeName={flaw.setTitle}
                  diffPexCalc={(from, to) => calcPexDiffAdvFlaw(from, to, true)}
                  elem={flaw}
                  name={flaw.title}
                  remove={() => removeFlaw(flaw.key)}
                  title={flaw.title}
                  placeholderName="Nouvel inconvénient"
                  placeholderSub="Niv."
                />
              </li>
            ))}
          </ul>
        </Container>
      </HorizontalSection>
    </>
  );
};

export default Misc;
