import Square, { EmptyGlyph } from './Square';
import { SubTitle } from '../styles/Titles';

const NamedSquare = ({
  value,
  title,
  subtitle,
  setValue,
  inactive,
}: {
  value: number;
  title: string;
  subtitle?: string;
  setValue: (newValue: number) => void;
  inactive?: boolean;
}) => {
  const changeValue = () => {
    setValue(value < 3 ? value + 1 : 3);
  };
  return (
    <div className="flex justify-between w-full px-12 max-sm:px-0">
      <span className="flex justify-between w-[70%]">
        <SubTitle>{title}</SubTitle>
        <span className="w-16" />
        <span className="relative top-[9px]">{subtitle}</span>
      </span>
      <span className="relative top-[3px]">
        <EmptyGlyph
          type={title}
          onClick={() => setValue(0)}
          inactive={value === 0 || !!inactive}
        />
        <Square
          checked={value}
          onClick={changeValue}
          inactive={value === 3 || !!inactive}
          name={`${title}`}
        />
      </span>
    </div>
  );
};

export default NamedSquare;
