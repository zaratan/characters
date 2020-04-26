import React, { useState } from 'react';
import { ColumnTitle } from '../styles/Titles';
import NamedSquare from './NamedSquare';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';

const Health = ({
  extraSquare,
  bruised,
  hurt,
  injured,
  wounded,
  mauled,
  crippled,
  incapacitated,
}: {
  extraSquare?: number;
  bruised: number;
  hurt: number;
  injured: number;
  wounded: number;
  mauled: number;
  crippled: number;
  incapacitated: number;
}) => {
  const health =
    extraSquare !== undefined
      ? [
          extraSquare,
          bruised,
          hurt,
          injured,
          wounded,
          mauled,
          crippled,
          incapacitated,
        ]
      : [bruised, hurt, injured, wounded, mauled, crippled, incapacitated];
  const [localHealth, setLocalHealth] = useState(health);
  const offset = extraSquare === undefined ? 0 : 1;
  const genSetValue = (rank: number) => (value: number) => {
    const newHealth = [...localHealth];
    newHealth[rank] = value;
    newHealth.sort((a, b) => b - a);
    setLocalHealth(newHealth);
  };
  return (
    <div>
      <ColumnTitleWithOptions
        title="Santé"
        options={[{ name: 'Extra Contusion', value: true }]}
      />
      {extraSquare !== undefined ? (
        <NamedSquare
          title="Contusion"
          value={localHealth[0]}
          setValue={genSetValue(0)}
        />
      ) : null}
      <NamedSquare
        title="Contusion"
        value={localHealth[offset]}
        setValue={genSetValue(offset)}
      />
      <NamedSquare
        title="Blessure légère"
        subtitle="-1"
        value={localHealth[offset + 1]}
        setValue={genSetValue(offset + 1)}
      />
      <NamedSquare
        title="Blessure moyenne"
        subtitle="-1"
        value={localHealth[offset + 2]}
        setValue={genSetValue(offset + 2)}
      />
      <NamedSquare
        title="Blessure grave"
        subtitle="-2"
        value={localHealth[offset + 3]}
        setValue={genSetValue(offset + 3)}
      />
      <NamedSquare
        title="Handicap"
        subtitle="-2"
        value={localHealth[offset + 4]}
        setValue={genSetValue(offset + 4)}
      />
      <NamedSquare
        title="Infirmité"
        subtitle="-5"
        value={localHealth[offset + 5]}
        setValue={genSetValue(offset + 5)}
      />
      <NamedSquare
        title="Invalidité"
        value={localHealth[offset + 6]}
        setValue={genSetValue(offset + 6)}
      />
    </div>
  );
};

export default Health;
