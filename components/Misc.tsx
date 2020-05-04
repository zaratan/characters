import React, { useContext } from 'react';
import AdvFlawContext from '../contexts/AdvFlawContext';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import { LineValue } from './Line';
import { calcPexDiffAdvFlaw } from '../helpers/pex';
import { Container } from '../styles/Container';
import LanguagesContext from '../contexts/LanguagesContext';
import AbilitiesContext from '../contexts/AbilitiesContext';
import { maxLanguages } from '../helpers/maxLevels';

const Misc = () => {
  const {
    advantages,
    flaws,
    addNewAdvantage,
    addNewFlaw,
    removeAdvantage,
    removeFlaw,
  } = useContext(AdvFlawContext);
  const { languages, addNewLanguage, removeLanguage } = useContext(
    LanguagesContext
  );
  const { knowledges } = useContext(AbilitiesContext);
  const linguisticsValue =
    knowledges.find((knowledge) => knowledge.title === 'Linguistique')?.value ||
    -1;
  // 999 should be big enough. If you need more. You probably shouldn't use this tool.
  const maxLang =
    linguisticsValue === -1 ? 999 : maxLanguages(linguisticsValue);
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
        <Container>
          <ColumnTitleWithOptions
            title="Langues"
            button={{
              glyph: '+',
              value: addNewLanguage,
              hidden: maxLang <= languages.length,
            }}
          />
          <ul>
            {languages.map((language, i) =>
              i < maxLang ? (
                <li key={language.key}>
                  <LineValue
                    changeName={language.set}
                    diffPexCalc={() => 0}
                    title={language.value}
                    remove={() => removeLanguage(language.key)}
                    name={language.key}
                    full
                  />
                </li>
              ) : null
            )}
          </ul>
        </Container>
      </HorizontalSection>
    </>
  );
};

export default Misc;
