import React, { useContext } from 'react';
import styled from 'styled-components';
import AttributesContext from '../../contexts/AttributesContext';
import SectionTitle from '../SectionTitle';
import { HorizontalSection } from '../../styles/Sections';
import { Container } from '../../styles/Container';
import ColumnTitle from '../ColumnTitle';
import PexElem, { pexElemsType, computePexElems } from '../PexElem';
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
  calcPexTrueFaith,
  calcPexHumanMagic,
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
import FaithContext from '../../contexts/FaithContext';
import HumanMagicContext from '../../contexts/HumanMagicContext';
import PexPercentage from '../PexPercentages';
import PreferencesContext from '../../contexts/PreferencesContext';

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
  const { showPex } = useContext(PreferencesContext);
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
  const { trueFaith } = useContext(FaithContext);
  const { psy, staticMagic, theurgy } = useContext(HumanMagicContext);
  const {
    useDisciplines,
    usePath,
    useGeneration,
    useTrueFaith,
    useHumanMagic,
  } = useContext(SectionsContext);
  const maxDots = useGeneration ? maxDot(generation.value) : 5;
  const attributesPexElems: pexElemsType = [
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
  ];
  const abilitiesPexElems: pexElemsType = [
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
  ];
  const miscPexElems: pexElemsType = [
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
  const powersPexElems: pexElemsType = [
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
          ...[...clanDisciplines, ...outClanDisciplines]
            .filter((disc) => disc.isThaumaturgy)
            .flatMap((disc) => ({
              elemArray: disc.rituals,
              pexCalc: (value: number) =>
                calcPexThaumaturgyRitual(value, disc.ritualMulti),
            })),
        ]
      : []),
    // Faith
    ...(useTrueFaith
      ? [
          {
            elemArray: [trueFaith],
            pexCalc: calcPexTrueFaith,
          },
        ]
      : []),
    // Human Magic
    ...(useHumanMagic
      ? [
          {
            elemArray: [...psy, ...staticMagic, ...theurgy],
            pexCalc: calcPexHumanMagic,
          },
          ...[...psy, ...staticMagic, ...theurgy]
            .filter((power) => power.hasRitual)
            .flatMap((power) => ({
              elemArray: power.rituals,
              pexCalc: (value: number) => calcPexThaumaturgyRitual(value, 3),
            })),
        ]
      : []),
  ];
  const pexElems: pexElemsType = [
    ...attributesPexElems,
    ...abilitiesPexElems,
    ...miscPexElems,
    ...powersPexElems,
  ];
  const totalPex = computePexElems(pexElems);
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
              currentPex={totalPex.current}
              diffPex={totalPex.diff}
              alwaysShow
              hideParentheses
              withSpaces
            />
          </HandText>
        </Container>
        {showPex ? (
          <Container>
            <ColumnTitle title="Statistiques" />
            <PexPercentage
              pexElemsAttributes={attributesPexElems}
              pexElemsAbilities={abilitiesPexElems}
              pexElemsMisc={miscPexElems}
              pexElemsPowers={powersPexElems}
              totalPex={totalPex}
            />
          </Container>
        ) : null}
      </HorizontalSection>
    </>
  );
};

export default PexSection;
