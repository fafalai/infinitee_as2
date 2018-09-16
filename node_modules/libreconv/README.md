# libreconv

> A simple and fast node.js module for converting office documents to different formats.

## Dependency

Please install LibreOffice in /Applications (Mac), with your favorite package manager (Linux), or with the msi (Windows).

## Usage

### Library

__Coming Soon__

### Command Line

```
 USAGE

   libreconv <file>

 ARGUMENTS

   <file>      File path to be converted      required

 OPTIONS

   -f, --format <format>      Format to convert: output_file_extension[:output_filter_name]      required
   -o, --output <output>      Output directory to convert to                                     optional

 GLOBAL OPTIONS

   -h, --help         Display help
   -V, --version      Display version
   --no-color         Disable colors
   --quiet            Quiet mode - only displays warn and error messages
   -v, --verbose      Verbose mode - will also output debug messages
     
```

Example:

```bash

libreconv file.doc -f pdf 
libreconv file.doc -f pdf -o /path/to/
libreconv file.xlsx -f pdf:"MS Excel 95"
```
