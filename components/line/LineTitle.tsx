import React from 'react';
import styled from 'styled-components';
import { HandText } from '../../styles/Texts';
import { SubTitle } from '../../styles/Titles';
import { Glyph } from '../Glyph';
import DotSeparator from './DotSeparator';
import LineInput from './LineInput';

const CustomTitleContainer = styled.span`
  display: flex;
  flex-grow: 1;
  max-width: 70%;
  &.full-size {
    max-width: 100%;
  }
  @media screen and (max-width: 500px) {
    width: 100%;
  }
`;

const RemoveContainer = styled.span`
  position: absolute;
  right: 0;
  top: 4px;
  z-index: 1;
  transition: visibility 0.3s ease-in-out;
`;
const CustomTitle = styled.span`
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 90%;
  input {
    flex-grow: 1;
    text-indent: 1px;
  }
  @media screen and (max-width: 500px) {
    input {
      text-align: center;
      padding: 0;
      text-indent: 0;
    }
    margin: 0 auto;
  }
`;

const InfoLink = styled.a`
  font-size: 1rem;
  border: 1px solid ${(props) => props.theme.borderColor};
  display: inline;
  position: absolute;
  right: 0;
  top: 4px;
  width: 1.5rem;
  text-align: center;
  border-radius: 100%;
  &:hover {
    background-color: ${(props) => props.theme.actionBackground};
    color: ${(props) => props.theme.color};
  }
`;

interface LineTitleProps<T> {
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
  title?: string;
  placeholder?: string;
  full?: boolean;
  inactive?: boolean;
  autocomplete?: Array<T>;
  infoLink?: string;
}

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
    <CustomTitleContainer className={full ? `full-size` : ''}>
      <CustomTitle>
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
          <InfoLink
            rel="noopener noreferrer nofollow"
            target="_blank"
            href={infoLink}
          >
            ?
          </InfoLink>
        ) : null}
        {!inactive && remove ? (
          <RemoveContainer className="remove-glyph">
            <Glyph onClick={remove} name={`Remove ${title}`}>
              ✘
            </Glyph>
          </RemoveContainer>
        ) : null}
      </CustomTitle>
      <DotSeparator />
    </CustomTitleContainer>
  ) : (
    <span>
      <SubTitle>{title}</SubTitle>
      <DotSeparator />
    </span>
  );
};

export default LineTitle;
