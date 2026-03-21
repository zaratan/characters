import { useContext, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import styled from 'styled-components';
import type { SectionsType } from '../../contexts/SectionsContext';
import SectionsContext from '../../contexts/SectionsContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import { useToast } from '../../contexts/ToastContext';
import { Glyph } from '../Glyph';

const YesNoGlyph = ({
  value,
  name,
  onClick,
}: {
  value: boolean;
  name: string;
  onClick: () => void;
}) => (
  <>
    {value ? (
      <Glyph
        onClick={() => {
          if (!value) return;
          onClick();
        }}
        inactive={!value}
        name={`${name}: Non`}
      >
        ✘
      </Glyph>
    ) : (
      <Glyph
        onClick={() => {
          if (value) return;
          onClick();
        }}
        inactive={value}
        name={`${name}: Oui`}
      >
        ✔
      </Glyph>
    )}
  </>
);

const StyledLi = styled.li`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SectionLi = ({
  displayName,
  name,
  value,
  onClick,
}: {
  displayName: string;
  name: string;
  value: boolean;
  onClick: (name: string) => () => void;
}) => (
  <StyledLi>
    <span>
      {displayName} : {value ? 'Oui' : 'Non'}{' '}
    </span>
    <YesNoGlyph name={name} value={value} onClick={onClick(name)} />
  </StyledLi>
);

const OptionList = styled.ul`
  width: 80%;
  max-width: 30rem;
`;

const ConfigPreferencesSection = ({ id }: { id: string }) => {
  const {
    toggleSection,
    useBlood,
    useDisciplines,
    useGeneration,
    useHumanMagic,
    usePath,
    useTrueFaith,
    useVampireInfos,
  } = useContext(SectionsContext);
  const { appId } = useContext(SystemContext);
  const { showError } = useToast();
  const [sectionsChanged, setSectionsChanged] = useState(false);

  useDebounce(
    async () => {
      if (!sectionsChanged) return;
      const newSections: SectionsType = {
        blood: useBlood,
        disciplines: useDisciplines,
        generation: useGeneration,
        humanMagic: useHumanMagic,
        path: usePath,
        trueFaith: useTrueFaith,
        vampireInfos: useVampireInfos,
      };

      try {
        await fetcher(`/api/vampires/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            sections: newSections,
            appId,
          }),
        });
      } catch {
        showError('Erreur lors de la sauvegarde des préférences.');
      }
    },
    300,
    [
      useBlood,
      useDisciplines,
      useGeneration,
      useHumanMagic,
      usePath,
      useTrueFaith,
      useVampireInfos,
      sectionsChanged,
    ]
  );
  const changeSection = (sectionName: string) => () => {
    setSectionsChanged(true);
    toggleSection(sectionName)();
  };
  return (
    <>
      <h2>Sections disponibles sur la fiche</h2>
      <OptionList>
        <SectionLi
          displayName="Sang"
          name="blood"
          value={useBlood}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Disciplines"
          name="disciplines"
          value={useDisciplines}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Génération"
          name="generation"
          value={useGeneration}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Magie humaine"
          name="humanMagic"
          value={useHumanMagic}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Voie"
          name="path"
          value={usePath}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Foi"
          name="trueFaith"
          value={useTrueFaith}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Informations vampiriques"
          name="vampireInfos"
          value={useVampireInfos}
          onClick={changeSection}
        />
      </OptionList>
    </>
  );
};

export default ConfigPreferencesSection;
