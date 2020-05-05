import React, { useContext } from 'react';
import styled from 'styled-components';
import { AbilityLine } from '../Line';
import { HorizontalSection } from '../../styles/Sections';
import { maxDot } from '../../helpers/maxLevels';
import ColumnTitleWithOptions from '../ColumnTitleWithOptions';
import AbilitiesContext, {
  AbilitiesListType,
} from '../../contexts/AbilitiesContext';
import GenerationContext from '../../contexts/GenerationContext';
import { calcPexAbility, calcPexSpecialty } from '../../helpers/pex';
import SectionTitle from '../SectionTitle';

const Container = styled.div`
  .col-button {
    font-size: 1.5rem;
  }
  @media screen and (any-hover: hover) {
    .empty-glyph,
    .line-button,
    .remove-glyph,
    .remove-spec-button,
    .col-button {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    :hover,
    :focus-within {
      .empty-glyph,
      .line-button,
      .remove-glyph,
      .remove-spec-button,
      .col-button {
        opacity: 1;
      }
    }
  }
`;

const AbilitiesColumn = ({
  abilities,
  customAbilities,
  title,
  maxLevel,
  addNewCustomAbility,
  removeCustomAbility,
  changeCustomAbilityTitle,
}: {
  abilities: AbilitiesListType;
  customAbilities: AbilitiesListType;
  title: string;
  maxLevel: number;
  addNewCustomAbility: () => void;
  removeCustomAbility: (key: string) => () => void;
  changeCustomAbilityTitle: (key: string) => (newTitle: string) => void;
}) => (
  <Container>
    <ColumnTitleWithOptions
      title={title}
      button={{ glyph: '+', value: addNewCustomAbility }}
      pexElems={[
        {
          elemArray: [...abilities, ...customAbilities],
          pexCalc: calcPexAbility,
        },
        {
          elemArray: [...abilities, ...customAbilities]
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
      ]}
    />
    {abilities.map((ability) => (
      <AbilityLine
        title={ability.title}
        elem={ability}
        maxLevel={maxLevel}
        key={ability.title}
        lineAction={
          ((ability.specialties && ability.specialties.length) || 0) <
          ability.value - 3
            ? { glyph: '+', value: ability.addNewSpecialty }
            : null
        }
        baseSpecialtyCount={ability.baseSpecialtiesCount}
        specialties={ability.specialties}
        changeSpecialtyTitle={ability.changeSpecialty}
        removeSpecialty={ability.removeSpecialty}
      />
    ))}
    {customAbilities.map((ability) => (
      <AbilityLine
        title={ability.title}
        elem={ability}
        maxLevel={maxLevel}
        key={ability.key}
        custom
        changeTitle={changeCustomAbilityTitle(ability.key)}
        remove={removeCustomAbility(ability.key)}
        lineAction={
          ((ability.specialties && ability.specialties.length) || 0) <
          ability.value - 3
            ? { glyph: '+', value: ability.addNewSpecialty }
            : null
        }
        baseSpecialtyCount={ability.baseSpecialtiesCount}
        specialties={ability.specialties}
        changeSpecialtyTitle={ability.changeSpecialty}
        removeSpecialty={ability.removeSpecialty}
      />
    ))}
  </Container>
);

const Abilities = () => {
  const {
    talents,
    customTalents,
    addNewCustomTalent,
    removeCustomTalent,
    changeCustomTalentTitle,
    skills,
    customSkills,
    addNewCustomSkill,
    removeCustomSkill,
    changeCustomSkillTitle,
    knowledges,
    customKnowledges,
    addNewCustomKnowledge,
    removeCustomKnowledge,
    changeCustomKnowledgeTitle,
  } = useContext(AbilitiesContext);
  const generation = useContext(GenerationContext);
  const maxLevel = maxDot(generation.value);
  return (
    <>
      <SectionTitle
        title="Capacités"
        pexElems={[
          {
            elemArray: [
              ...talents,
              ...customTalents,
              ...skills,
              ...customSkills,
              ...knowledges,
              ...customKnowledges,
            ],
            pexCalc: calcPexAbility,
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
        ]}
      />
      <HorizontalSection>
        <AbilitiesColumn
          title="Talents"
          abilities={talents}
          customAbilities={customTalents}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomTalent}
          removeCustomAbility={removeCustomTalent}
          changeCustomAbilityTitle={changeCustomTalentTitle}
        />
        <AbilitiesColumn
          title="Compétences"
          abilities={skills}
          customAbilities={customSkills}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomSkill}
          removeCustomAbility={removeCustomSkill}
          changeCustomAbilityTitle={changeCustomSkillTitle}
        />
        <AbilitiesColumn
          title="Connaissances"
          abilities={knowledges}
          customAbilities={customKnowledges}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomKnowledge}
          removeCustomAbility={removeCustomKnowledge}
          changeCustomAbilityTitle={changeCustomKnowledgeTitle}
        />
      </HorizontalSection>
    </>
  );
};

export default Abilities;
