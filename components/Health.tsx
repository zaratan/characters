import React, { useContext } from 'react';
import { useDebounce } from 'react-use';
import { mutate } from 'swr';
import NamedSquare from './NamedSquare';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import MindContext from '../contexts/MindContext';
import ModeContext from '../contexts/ModeContext';
import IdContext from '../contexts/IdContext';
import { fetcher } from '../helpers/fetcher';
import SystemContext from '../contexts/SystemContext';

const Health = () => {
  const { isExtraBruisable, health } = useContext(MindContext);
  const { playMode, editMode } = useContext(ModeContext);
  const { id } = useContext(IdContext);
  const { appId } = useContext(SystemContext);
  const changeIsExtraBruisable = () =>
    isExtraBruisable.set(!isExtraBruisable.value);

  const offset = isExtraBruisable ? 1 : 0;
  const genSetValue = (rank: number) => (value: number) => {
    const newHealth = [...health.value];
    newHealth[rank] = value;
    newHealth.sort((a, b) => b - a);
    health.set(newHealth);
  };
  useDebounce(
    async () => {
      if (JSON.stringify(health.value) === JSON.stringify(health.baseValue))
        return;

      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({ mind: { health: health.value }, appId }),
      });
      mutate(`/api/vampires/${id}`);
    },
    10000,
    [JSON.stringify(health)]
  );
  return (
    <div>
      <ColumnTitleWithOptions
        title="Santé"
        options={[
          {
            name: 'Extra Contusion',
            value: isExtraBruisable.value,
            onClick: changeIsExtraBruisable,
          },
        ]}
        inactive={!editMode}
      />
      {isExtraBruisable.value ? (
        <NamedSquare
          title="Contusion"
          value={health.value[0]}
          setValue={genSetValue(0)}
          inactive={!playMode}
        />
      ) : null}
      <NamedSquare
        title="Contusion"
        value={health.value[offset]}
        setValue={genSetValue(offset)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Blessure légère"
        subtitle="-1"
        value={health.value[offset + 1]}
        setValue={genSetValue(offset + 1)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Blessure moyenne"
        subtitle="-1"
        value={health.value[offset + 2]}
        setValue={genSetValue(offset + 2)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Blessure grave"
        subtitle="-2"
        value={health.value[offset + 3]}
        setValue={genSetValue(offset + 3)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Handicap"
        subtitle="-2"
        value={health.value[offset + 4]}
        setValue={genSetValue(offset + 4)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Infirmité"
        subtitle="-5"
        value={health.value[offset + 5]}
        setValue={genSetValue(offset + 5)}
        inactive={!playMode}
      />
      <NamedSquare
        title="Invalidité"
        value={health.value[offset + 6]}
        setValue={genSetValue(offset + 6)}
        inactive={!playMode}
      />
    </div>
  );
};

export default Health;
