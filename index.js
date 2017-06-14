'use strict';

var gitSpawnedStream = require('git-spawned-stream');
var streamingParser = require('./lib/parser');

/**
 * Create a readable stream from a spawned git process.
 * @param   {String}                         file                      `<file>` in `git blame`
 * @param   {Object}                         [options]                 options extend from [git-spawned-stream](https://github.com/gucong3000/git-spawned-stream/tree/options.input#options)
 * @param   {String}                         [rev]                     `<rev>` from `git blame`
 * @param   {boolean}                        [ignoreWhitespace=true]   `-w` from `git blame`
 * @param   {String}                         [limitLines]              `-L` from `git blame`
 * @param   {String}                         [contents]                `--contents <file>` from `git blame`
 * @param   {String|Buffer|Stream.Readable}  [input]                   `--contents -` from `git blame`
 * @param   {boolean|number}                 [detectMoved=true]        `-M` from `git blame`. Requiered for `detectCopy`
 * @param   {boolean|number}                 [detectCopy=true]         `-C` from `git blame`
 * @param   {String}                         [detectCopyMode]          Possible options:
- `any` - Look in all files and at all times
- `created` - Look in files changed in the commit creating the file
- `default` - Look in the same commit
 * @returns {Stream.Readable}                                          readable stream from spawned git process.
 */
function blame(file, opts) {
  opts = Object.assign({
    ignoreWhitespaces: true,
    detectMoved: true,
    detectCopy: true,
  }, opts)

  var args = ['blame'];

  if (opts.rev) {
    args.push(opts.rev);
  } else if (opts.input) {
    args.push('--contents');
    args.push('-');
  } else if (opts.contents) {
    args.push('--contents');
    args.push(opts.contents);
  }

  if (opts.ignoreWhitespaces) {
    args.push('-w');
  }

  if (opts.limitLines) {
    args.push('-L ' + opts.limitLines);
  }

  if (opts.detectMoved) {
    if (typeof opts.detectMoved === 'number') {
      args.push('-M' + opts.detectMoved);
    } else {
      args.push('-M');
    }
  }

  if (opts.detectCopy) {
    switch (opts.detectCopyMode) {
    case 'any':
      args.push('-C -C');
      break;

    case 'created':
      args.push('-C');
      break;

    case 'default':
    default:
      // Placeholder
      break;
    }

    if (typeof opts.detectCopy === 'number') {
      args.push('-C' + opts.detectCopy);
    } else {
      args.push('-C');
    }
  }

  args.push('-p');
  args.push('--');
  args.push(file);

  return streamingParser(gitSpawnedStream(args, opts));
}

module.exports = blame;
