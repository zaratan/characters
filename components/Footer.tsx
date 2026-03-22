import { BlackLine, EmptyLine } from '../styles/Lines';

const Footer = ({ withoutEmptyLines }: { withoutEmptyLines?: boolean }) => (
  <footer className="italic text-[1.2rem] text-center">
    {withoutEmptyLines ? null : (
      <>
        <EmptyLine />
        <EmptyLine />
      </>
    )}
    <BlackLine />
    <span className="h-12 flex items-center justify-center w-full">
      <span>
        Made with{' '}
        <span className="heart-transition cursor-grab hover:text-red-600 dark:hover:text-red-500">
          ♥
        </span>{' '}
        by
      </span>
      <a className="pl-[0.3rem]" href="https://twitter.com/zaratan">
        @zaratan
      </a>
      .
      <a className="pl-[0.3rem]" href="https://ko-fi.com/zaratan">
        Buy me a tea
      </a>
      .
    </span>
  </footer>
);

export default Footer;
