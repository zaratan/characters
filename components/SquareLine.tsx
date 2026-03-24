import classNames from '../helpers/classNames';
import Square, { EmptyGlyph } from './Square';
import type { TempElemType } from '../types/TempElemType';
import styles from './SquareLine.module.css';

const SquareLine = ({
  type,
  number,
  numberChecked,
  inactive,
}: {
  type: string;
  number: number;
  numberChecked: TempElemType<number>;
  inactive?: boolean;
}) => (
  <div className="relative">
    <div
      className={classNames(
        styles.squareLineContainer,
        number > 15 && styles.mustWrap,
        inactive && styles.inactive
      )}
    >
      <EmptyGlyph
        type={type}
        onClick={() => numberChecked.set(0)}
        inactive={numberChecked.value === 0 || !!inactive}
      />
      {Array.from(Array(number)).map((_, i) => [
        <Square
          checked={i < numberChecked.value}
          onClick={() => {
            numberChecked.set(i + 1);
          }}
          name={`${type} ${i}`}
          inactive={i + 1 === numberChecked.value || !!inactive}
          key={`${type} ${i}`}
        />,
        i % 5 === 4 && i !== number - 1 ? (
          <span
            className={classNames(
              styles.squareSeparator,
              i % 10 === 9 && styles.xsInvisible,
              i % 15 === 14 && styles.xsVisible
            )}
            key={`type-${i}`}
          />
        ) : null,
      ])}
    </div>
  </div>
);

export default SquareLine;
