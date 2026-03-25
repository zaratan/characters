import type { ChangeEvent } from 'react';
import { useContext } from 'react';
import { HorizontalSection } from '../../styles/Sections';
import { EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import { HandLargeEditableText, HandLargeText } from '../../styles/Texts';
import InfosContext from '../../contexts/InfosContext';
import GenerationContext from '../../contexts/GenerationContext';
import ModeContext from '../../contexts/ModeContext';
import SectionsContext from '../../contexts/SectionsContext';

const Infos = () => {
  const { name, playerName, chronicle, clan, demeanor, haven, nature, sire } =
    useContext(InfosContext);

  const { editMode } = useContext(ModeContext);
  const generation = useContext(GenerationContext);
  const { useGeneration, useVampireInfos } = useContext(SectionsContext);
  const handleChange =
    (changeFunction: (val: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      changeFunction(event.currentTarget.value);
    };
  const handleChangeGeneration = (event: ChangeEvent<HTMLInputElement>) => {
    generation.set(Number(event.currentTarget.value));
  };
  return (
    <>
      <EmptyLine />

      <HorizontalSection className="compact">
        <div className="flex max-md:block">
          <Title>Nom:</Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              value={name.value}
              onChange={handleChange(name.set)}
            />
          ) : (
            <HandLargeText className="label">{name.value}</HandLargeText>
          )}
        </div>
        <div className="flex max-md:block">
          <Title>Joueur: </Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              value={playerName.value}
              onChange={handleChange(playerName.set)}
            />
          ) : (
            <HandLargeText className="label">{playerName.value}</HandLargeText>
          )}
        </div>
        <div className="flex max-md:block">
          <Title>Chronique: </Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(chronicle.set)}
              value={chronicle.value}
            />
          ) : (
            <HandLargeText className="label">{chronicle.value}</HandLargeText>
          )}
        </div>
        <div className="flex max-md:block">
          <Title>Nature: </Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(nature.set)}
              value={nature.value}
            />
          ) : (
            <HandLargeText className="label">{nature.value}</HandLargeText>
          )}
        </div>
        <div className="flex max-md:block">
          <Title>Attitude: </Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(demeanor.set)}
              value={demeanor.value}
            />
          ) : (
            <HandLargeText className="label">{demeanor.value}</HandLargeText>
          )}
        </div>
        {useVampireInfos ? (
          <div className="flex max-md:block">
            <Title>Clan: </Title>
            <span className="w-4" />
            {editMode ? (
              <HandLargeEditableText
                type="text"
                onChange={handleChange(clan.set)}
                value={clan.value}
              />
            ) : (
              <HandLargeText className="label">{clan.value}</HandLargeText>
            )}
          </div>
        ) : null}
        {useGeneration ? (
          <div className="flex max-md:block">
            <Title>Génération: </Title>
            <span className="w-4" />
            {editMode ? (
              <HandLargeEditableText
                type="number"
                max={15}
                min={3}
                value={generation.value === 0 ? '' : generation.value}
                onChange={handleChangeGeneration}
              />
            ) : (
              <HandLargeText className="label">
                {generation.value}
              </HandLargeText>
            )}
          </div>
        ) : null}
        <div className="flex max-md:block">
          <Title>Refuge: </Title>
          <span className="w-4" />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(haven.set)}
              value={haven.value}
            />
          ) : (
            <HandLargeText className="label">{haven.value}</HandLargeText>
          )}
        </div>
        {useVampireInfos ? (
          <div className="flex max-md:block">
            <Title>Sire: </Title>
            <span className="w-4" />
            {editMode ? (
              <HandLargeEditableText
                type="text"
                onChange={handleChange(sire.set)}
                value={sire.value}
              />
            ) : (
              <HandLargeText className="label">{sire.value}</HandLargeText>
            )}
          </div>
        ) : null}
      </HorizontalSection>
    </>
  );
};

export default Infos;
