const debug = require('debug')('libreconv');
const assert = require('assert');
const fs = require('fs-extra');
const tmp = require('tmp');
const path = require('path');
const exec = require('child-process-promise').exec;
const PromiseA = require('bluebird');

tmp.setGracefulCleanup();

const SOFFICE_POSSIBLE_PATHS = (platform => {
  switch (platform) {
    case 'darwin':
      return ['/Applications/LibreOffice.app/Contents/MacOS/soffice'];
    case 'linux':
      return ['/usr/bin/libreoffice', '/usr/bin/soffice'];
    case 'win32':
      return [path.join(process.env['PROGRAMFILES(X86)'], 'LIBREO~1/program/soffice.exe')];
  }
})(process.platform);

function findSoffice(paths) {
  for (let i = 0; i < paths.length; i++) {
    if (paths[i] && fs.existsSync(paths[i])) {
      return paths[i];
    }
  }
}

exports.convert = function (file, format, opts) {
  if (!SOFFICE_POSSIBLE_PATHS) {
    return PromiseA.reject(new Error('Operating system not yet supported: ' + process.platform));
  }

  const soffice = findSoffice(SOFFICE_POSSIBLE_PATHS);
  if (!soffice) {
    return PromiseA.reject(new Error('Could not find soffice binary'));
  }
  assert(file, '`file` is required');
  file = path.resolve(file);

  opts = opts || {};
  if (typeof format !== 'string') {
    opts = format;
    format = null;
  }
  format = format || opts.format;
  assert(format, '`format` is required');

  let filter, dir;
  if (format.indexOf(':') > 0) {
    const parts = format.split(':');
    format = parts[0];
    filter = parts[1];
  }

  dir = opts.output || opts.dir;
  filter = opts.filter || filter;
  if (filter && filter[0] !== '"') {
    filter = `"${filter}"`;
  }

  return PromiseA.try(() => {
    if (dir) {
      fs.mkdirpSync(dir);
      return {dir};
    }
    return PromiseA.fromCallback(cb => tmp.dir({
      unsafeCleanup: true,
      template: '/tmp/libreconv-XXXXXX'
    }, cb), {multiArgs: true}).spread((dir, cleanup) => ({dir, cleanup}));
  }).then(({dir, cleanup}) => {
    let command = `${soffice} --headless --convert-to ${format}`;
    if (filter) {
      command += `:${filter}`;
    }
    command += ` --outdir "${dir}" "${file}"`;
    debug('Executing:\n', command);
    return exec(command).then(result => {
      const {stdout, stderr} = result;
      if (stderr) {
        throw new Error(stderr);
      }
      debug('Executed with result:\n', stdout);
      const output = path.resolve(dir, path.basename(file, path.extname(file)) + '.' + format);
      debug('output:', output);
      return {stdout, output, cleanup};
    });
  })
};
