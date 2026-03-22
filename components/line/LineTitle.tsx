import { HandText } from '../../styles/Texts';
import { SubTitle } from '../../styles/Titles';
import { Glyph } from '../Glyph';
import DotSeparator from './DotSeparator';
import LineInput from './LineInput';
import classNames from '../../helpers/classNames';

type LineTitleProps<T> = {
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
  title?: string;
  placeholder?: string;
  full?: boolean;
  inactive?: boolean;
  autocomplete?: Array<T>;
  infoLink?: string;
};

const LineTitle = <T extends { name: string }>({
  custom,
  changeName = () => {},
  remove,
  title,
  placeholder,
  full,
  inactive,
  autocomplete,
  infoLink,
}: LineTitleProps<T>) => {
  if (title === undefined) return null;
  return custom ? (
    <span
      className={classNames(
        'flex grow max-w-[70%] max-md:w-full',
        full && 'max-w-full!'
      )}
    >
      <span className="custom-title relative flex flex-col grow max-w-[90%]">
        <span className="flex items-baseline">
          {inactive ? (
            <HandText>{title}</HandText>
          ) : (
            <LineInput
              autocomplete={autocomplete}
              changeName={changeName}
              placeholder={placeholder}
              title={title}
            />
          )}
          {infoLink && inactive ? (
            <a
              rel="noopener noreferrer nofollow"
              target="_blank"
              href={infoLink}
              className="text-base border border-[#d3d3d3] dark:border-[#a9a9a9] ml-1 shrink-0 w-[1.5rem] text-center rounded-full hover:bg-[#eeeeee] dark:hover:bg-[#444444] text-inherit"
            >
              ?
            </a>
          ) : null}
          {!inactive && remove ? (
            <span className="remove-glyph shrink-0 ml-1 z-[1] transition-[visibility] duration-300">
              <Glyph onClick={remove} name={`Remove ${title}`}>
                ✘
              </Glyph>
            </span>
          ) : null}
        </span>
      </span>
      <DotSeparator />
    </span>
  ) : (
    <span>
      <SubTitle>{title}</SubTitle>
      <DotSeparator />
    </span>
  );
};

export default LineTitle;
