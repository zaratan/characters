import React, { useContext } from 'react';
import styled from 'styled-components';
import AttributesContext from '../../contexts/AttributesContext';
import SectionTitle from '../SectionTitle';
import { HorizontalSection } from '../../styles/Sections';
import { Container } from '../../styles/Container';
import ColumnTitle from '../ColumnTitle';
import PexElem, { pexElemsType } from '../PexElem';
import {
  calcPexAttribute,
  calcPexAbility,
  calcPexSpecialty,
  calcPexWillpower,
  calcPexPathOrVirtue,
  calcPexInClanDiscipline,
  calcPexOutOfClanDiscipline,
  calcPexThaumaturgyPath,
  calcPexThaumaturgyRitual,
  calcPexAdvFlaw,
} from '../../helpers/pex';
import AbilitiesContext from '../../contexts/AbilitiesContext';
import MindContext from '../../contexts/MindContext';
import DisciplinesContext from '../../contexts/DisciplinesContext';
import AdvFlawContext from '../../contexts/AdvFlawContext';
import { HandLargeText, HandEditableText } from '../../styles/Texts';
import PexContext from '../../contexts/PexContext';
import ModeContext from '../../contexts/ModeContext';
import SectionsContext from '../../contexts/SectionsContext';
import { maxDot } from '../../helpers/maxLevels';
import GenerationContext from '../../contexts/GenerationContext';

const HandText = styled(HandLargeText)`
  display: flex;
  justify-content: center;
  span {
    font-size: 1.5rem;
  }
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
  input {
    text-align: center;
  }
`;

const PexSection = () => {
  const { leftOver } = useContext(PexContext);
  const {
    strength,
    appearance,
    charisma,
    dexterity,
    intelligence,
    manipulation,
    perception,
    stamina,
    wits,
  } = useContext(AttributesContext);
  const {
    talents,
    customTalents,
    skills,
    customSkills,
    knowledges,
    customKnowledges,
  } = useContext(AbilitiesContext);
  const { willpower, conscience, courage, path, selfControl } = useContext(
    MindContext
  );
  const {
    clanDisciplines,
    outClanDisciplines,
    combinedDisciplines,
  } = useContext(DisciplinesContext);
  const { advantages, flaws } = useContext(AdvFlawContext);
  const { editMode } = useContext(ModeContext);
  const generation = useContext(GenerationContext);
  const { useDisciplines, usePath, useGeneration } = useContext(
    SectionsContext
  );
  const maxDots = useGeneration ? maxDot(generation.value) : 5;
  const pexElems: pexElemsType = [
    // Attributes
    {
      elemArray: [
        strength,
        appearance,
        charisma,
        dexterity,
        intelligence,
        manipulation,
        perception,
        stamina,
        wits,
      ],
      pexCalc: calcPexAttribute(maxDots),
    },
    // Abilities
    {
      elemArray: [
        ...talents,
        ...customTalents,
        ...skills,
        ...customSkills,
        ...knowledges,
        ...customKnowledges,
      ],
      pexCalc: calcPexAbility(maxDots),
    },
    {
      elemArray: [
        ...talents,
        ...customTalents,
        ...skills,
        ...customSkills,
        ...knowledges,
        ...customKnowledges,
      ]
        .flatMap(
          (cap) =>
            cap.specialties && {
              baseValue: cap.baseSpecialtiesCount,
              value: cap.specialties.length,
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              set: () => {},
            }
        )
        .filter((e) => e !== undefined),
      pexCalc: calcPexSpecialty,
    },
    // Mind
    {
      elemArray: [willpower],
      pexCalc: calcPexWillpower,
    },
    {
      elemArray: [courage, selfControl, conscience],
      pexCalc: calcPexPathOrVirtue,
    },
    ...(usePath
      ? [
          {
            elemArray: [path],
            pexCalc: calcPexPathOrVirtue,
          },
        ]
      : []),
    // Disciplines
    ...(useDisciplines
      ? [
          {
            elemArray: clanDisciplines,
            pexCalc: calcPexInClanDiscipline(maxDots),
          },
          {
            elemArray: outClanDisciplines,
            pexCalc: calcPexOutOfClanDiscipline(maxDots),
          },
          {
            elemArray: combinedDisciplines,
            pexCalc: (value) => value,
          },
          {
            elemArray: [...clanDisciplines, ...outClanDisciplines].flatMap(
              (disc) => disc.paths
            ),
            pexCalc: calcPexThaumaturgyPath,
          },
          ...[...clanDisciplines, ...outClanDisciplines].flatMap((disc) => ({
            elemArray: disc.rituals,
            pexCalc: (value) =>
              calcPexThaumaturgyRitual(value, disc.ritualMulti),
          })),
        ]
      : []),
    // Misc.
    {
      elemArray: advantages,
      pexCalc: (value) => calcPexAdvFlaw(value, false),
    },
    {
      elemArray: flaws,
      pexCalc: (value) => calcPexAdvFlaw(value, true),
    },
    {
      elemArray: [leftOver],
      pexCalc: (value) => value,
    },
  ];
  return (
    <>
      <SectionTitle title="Expérience" />
      <HorizontalSection>
        <Container>
          <ColumnTitle title="Restant" />
          <TextContainer>
            {editMode ? (
              <HandEditableText
                onChange={(e) => leftOver.set(Number(e.target.value))}
                value={leftOver.value === 0 ? '' : leftOver.value}
                placeholder="PEX restant"
              />
            ) : (
              <HandText>{leftOver.value === 0 ? '' : leftOver.value}</HandText>
            )}
          </TextContainer>
        </Container>
        <Container>
          <ColumnTitle title="Total" />
          <HandText>
            <PexElem
              pexElems={pexElems}
              alwaysShow
              hideParentheses
              withSpaces
            />
          </HandText>
        </Container>
      </HorizontalSection>
    </>
  );
};

export default PexSection;
