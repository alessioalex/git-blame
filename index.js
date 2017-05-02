'use strict';

var gitSpawnedStream = require('git-spawned-stream');
var streamingParser = require('./lib/parser');

function blame(repoPath, opts, gitCommand = 'git') {
  var rev = typeof opts.rev !== 'undefined' ? opts.rev : 'HEAD';
  var args = [];

  if (typeof opts.workTree === 'string') {
    args.push('--work-tree=' + opts.workTree);
  }

  args.push('blame');

  if (rev) {
    args.push(rev);
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
  args.push(opts.file);

  // TODO: implement limit
  return streamingParser(gitSpawnedStream(repoPath, args, gitCommand));
}

module.exports = blame;
