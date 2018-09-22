# Drupal Translate finder

This tool aim to scan a directory and acquire all strings that have to be translated.
Then it checks whether it is in a po file or not.


## Usage

```bash
$ docker run --rm -it -v $PATH_TO_YOUR_FOLDER:/tmp/scannedDir dockrcrazy/drupal-translate-finder
```

## Contributing
Prerequisite:

 - NodeJs
 
Installation :
```bash
$ npm i
```
Testing :
```bash
$ node index.js /path/to/your/folder
```
