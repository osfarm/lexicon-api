import chalk from 'chalk';
import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'
// TODO https://github.com/kutuluk/loglevel-plugin-remote
const { LOG_LEVEL = "debug" } = Bun.env

//log.setLevel(LOG_LEVEL || log.levels.DEBUG)

const colors: any = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);
log.enableAll();

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}:`)}`;
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
  nameFormatter(name = 'lexicon') {
    return name || '';
  },
});

prefix.apply(log.getLogger('critical'), {
  format(level, name, timestamp) {
    return chalk.red.bold(`[${timestamp}] ${level} ${name}:`);
  },
});

log.info('Logger configured');

export default log
