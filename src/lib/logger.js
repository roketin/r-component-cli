import pc from 'picocolors';

export const logger = {
  info: (message) => console.log(pc.blue('ℹ'), message),
  success: (message) => console.log(pc.green('✔'), message),
  warn: (message) => console.log(pc.yellow('⚠'), message),
  error: (message) => console.log(pc.red('✖'), message),
  skip: (message) => console.log(pc.gray('○'), message),
  break: () => console.log(),
};

export const highlight = (text) => pc.cyan(text);
export const dim = (text) => pc.dim(text);
export const bold = (text) => pc.bold(text);
