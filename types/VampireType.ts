import { AttributesType } from '../contexts/AttributesContext';
import { RawAbilitiesListType } from '../contexts/AbilitiesContext';
import { InfosType } from '../contexts/InfosContext';
import { MindType } from '../contexts/MindContext';
import {
  DisciplinesList,
  CombinedDisciplinesList,
} from '../contexts/DisciplinesContext';
import { AdvFlawType } from '../contexts/AdvFlawContext';
import { RawLanguage } from '../contexts/LanguagesContext';
import { SectionsType } from '../contexts/SectionsContext';
import { HumanMagicType } from '../contexts/HumanMagicContext';

export type VampireType = {
  generation: number;
  attributes: AttributesType;
  talents: RawAbilitiesListType;
  customTalents: RawAbilitiesListType;
  skills: RawAbilitiesListType;
  customSkills: RawAbilitiesListType;
  knowledges: RawAbilitiesListType;
  customKnowledges: RawAbilitiesListType;
  infos: InfosType;
  mind: MindType;
  clanDisciplines: DisciplinesList;
  outClanDisciplines: DisciplinesList;
  combinedDisciplines: CombinedDisciplinesList;
  advantages: Array<AdvFlawType>;
  flaws: Array<AdvFlawType>;
  languages: Array<RawLanguage>;
  leftOverPex: number;
  sections: SectionsType;
  trueFaith: number;
  humanMagic: HumanMagicType;
  editors: Array<string>;
  viewers: Array<string>;
};
