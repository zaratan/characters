import type { AttributesType } from '../contexts/AttributesContext';
import type { RawAbilitiesListType } from '../contexts/AbilitiesContext';
import type { InfosType } from '../contexts/InfosContext';
import type { MindType } from '../contexts/MindContext';
import type {
  DisciplinesList,
  CombinedDisciplinesList,
} from '../contexts/DisciplinesContext';
import type { AdvFlawType } from '../contexts/AdvFlawContext';
import type { RawLanguage } from '../contexts/LanguagesContext';
import type { SectionsType } from '../contexts/SectionsContext';
import type { HumanMagicType } from '../contexts/HumanMagicContext';

export type VampireType = {
  id: string;
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
  privateSheet: boolean;
};
