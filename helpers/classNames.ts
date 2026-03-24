export default function classNames(
  ...classes: Array<string | null | boolean | undefined>
) {
  return classes.filter(Boolean).join(' ');
}
