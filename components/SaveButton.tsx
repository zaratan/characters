import React, { useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { mutate } from 'swr';
import IdContext from '../contexts/IdContext';
import InfosContext from '../contexts/InfosContext';
import AttributesContext from '../contexts/AttributesContext';
import AbilitiesContext from '../contexts/AbilitiesContext';
import GenerationContext from '../contexts/GenerationContext';
import MindContext from '../contexts/MindContext';
import DisciplinesContext from '../contexts/DisciplinesContext';
import { fetcher } from '../helpers/fetcher';
import AdvFlawContext from '../contexts/AdvFlawContext';
import LanguagesContext from '../contexts/LanguagesContext';
import PexContext from '../contexts/PexContext';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import SystemContext from '../contexts/SystemContext';

const SaveButton = ({
  newChar,
  children,
}: {
  newChar: boolean;
  children: ReactNode;
}) => {
  const router = useRouter();
  const { id } = useContext(IdContext);
  const { appId } = useContext(SystemContext);
  const {
    chronicle,
    clan,
    demeanor,
    haven,
    name,
    nature,
    playerName,
    sire,
  } = useContext(InfosContext);
  const {
    appearance,
    charisma,
    dexterity,
    intelligence,
    manipulation,
    perception,
    stamina,
    strength,
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
  const generation = useContext(GenerationContext);
  const {
    bloodSpent,
    conscience,
    courage,
    health,
    isConviction,
    isExtraBruisable,
    isInstinct,
    path,
    pathName,
    selfControl,
    tempWillpower,
    willpower,
  } = useContext(MindContext);
  const {
    clanDisciplines,
    outClanDisciplines,
    combinedDisciplines,
  } = useContext(DisciplinesContext);
  const { advantages, flaws } = useContext(AdvFlawContext);
  const { languages } = useContext(LanguagesContext);
  const { leftOver } = useContext(PexContext);
  const action = async () => {
    const combinedDisc = combinedDisciplines.map((disc) => ({
      key: disc.key,
      title: disc.title,
      value: disc.value,
    }));
    const clanDisc = clanDisciplines.map((disc) => ({
      value: disc.value,
      key: disc.key,
      title: disc.title,
      isThaumaturgy: disc.isThaumaturgy,
      mainPathName: disc.mainPathName,
      paths: disc.paths.map((tpath) => ({
        title: tpath.title,
        value: tpath.value,
        key: tpath.key,
      })),
      rituals: disc.rituals.map((ritual) => ({
        title: ritual.title,
        key: ritual.key,
        value: ritual.value,
      })),
      ritualMulti: disc.ritualMulti,
    }));
    const outClanDisc = outClanDisciplines.map((disc) => ({
      value: disc.value,
      key: disc.key,
      title: disc.title,
      isThaumaturgy: disc.isThaumaturgy,
      mainPathName: disc.mainPathName,
      paths: disc.paths.map((tpath) => ({
        title: tpath.title,
        value: tpath.value,
        key: tpath.key,
      })),
      rituals: disc.rituals.map((ritual) => ({
        title: ritual.title,
        key: ritual.key,
        value: ritual.value,
      })),
      ritualMulti: disc.ritualMulti,
    }));
    const mind = {
      bloodSpent: bloodSpent.value,
      conscience: conscience.value,
      courage: courage.value,
      health: health.value,
      isConviction: isConviction.value,
      isExtraBruisable: isExtraBruisable.value,
      isInstinct: isInstinct.value,
      path: path.value,
      pathName: pathName.value,
      selfControl: selfControl.value,
      tempWillpower: tempWillpower.value,
      willpower: willpower.value,
    };
    const infos = {
      chronicle: chronicle.value,
      clan: clan.value,
      demeanor: demeanor.value,
      haven: haven.value,
      name: name.value,
      nature: nature.value,
      playerName: playerName.value,
      sire: sire.value,
    };
    const attributes = {
      strength: strength.value,
      dexterity: dexterity.value,
      stamina: stamina.value,
      charisma: charisma.value,
      manipulation: manipulation.value,
      appearance: appearance.value,
      perception: perception.value,
      intelligence: intelligence.value,
      wits: wits.value,
    };
    const data = {
      id,
      infos,
      attributes,
      talents: talents.map((talent) => ({
        title: talent.title,
        value: talent.value,
        specialties: talent.specialties,
        key: talent.key,
      })),
      skills: skills.map((skill) => ({
        title: skill.title,
        value: skill.value,
        specialties: skill.specialties,
        key: skill.key,
      })),
      knowledges: knowledges.map((knowledge) => ({
        title: knowledge.title,
        value: knowledge.value,
        specialties: knowledge.specialties,
        key: knowledge.key,
      })),
      customTalents: customTalents.map((talent) => ({
        title: talent.title,
        value: talent.value,
        specialties: talent.specialties,
        key: talent.key,
      })),
      customSkills: customSkills.map((skill) => ({
        title: skill.title,
        value: skill.value,
        specialties: skill.specialties,
        key: skill.key,
      })),
      customKnowledges: customKnowledges.map((knowledge) => ({
        title: knowledge.title,
        value: knowledge.value,
        specialties: knowledge.specialties,
        key: knowledge.key,
      })),
      generation: generation.value,
      mind,
      clanDisciplines: clanDisc,
      outClanDisciplines: outClanDisc,
      combinedDisciplines: combinedDisc,
      advantages: advantages.map((advantage) => ({
        value: advantage.value,
        title: advantage.title,
        key: advantage.key,
      })),
      flaws: flaws.map((flaw) => ({
        value: flaw.value,
        title: flaw.title,
        key: flaw.key,
      })),
      languages: languages.map((language) => ({
        value: language.value,
        key: language.key,
      })),
      leftOverPex: leftOver.value,
    };
    const url = newChar ? '/api/vampires/create' : `/api/vampires/${id}/update`;
    await fetcher(url, {
      method: 'POST',
      body: JSON.stringify({ ...data, appId }),
    });
    if (newChar) {
      router.push(`/vampires/${id}`);
    } else {
      mutate(`/api/vampires/${id}`, data);
    }
  };
  const handleClick = generateHandleClick(action);
  const handleKeypress = generateHandleKeypress(action);
  return (
    <span
      role="button"
      onClick={handleClick}
      onKeyPress={handleKeypress}
      tabIndex={0}
    >
      {children}
    </span>
  );
};

export default SaveButton;
