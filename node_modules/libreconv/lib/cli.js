'use strict';

const program = require('caporal');
const pkg = require('../package.json');
const convert = require('.').convert;
program
  .version(pkg.version)
  .description('A simple documents converter using LibreOffice')
  .argument('<file>', 'File path to be converted')
  .option('-f, --format <format>', 'Format to convert: output_file_extension[:output_filter_name]', null, null, true)
  .option('-o, --output <output>', 'Output directory to convert to')
  .action(function(args, options, logger) {
    options.output = options.output || process.cwd();
    convert(args.file, options).then(result => {
      logger.info('Converted:', result.output);
    })
  });

program.parse(process.argv);
