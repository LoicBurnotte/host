export const pathFor = (basename: string | undefined, to: string) =>
  basename ? `${basename}${to === '/' ? '' : to}` : to
