'use strict';

var gitSpawnedStream = require('git-spawned-stream');
var streamingParser = require('./lib/parser');

function blame(repoPath, opts) {
  var rev = typeof opts.rev !== 'undefined' ? opts.rev : 'HEAD';
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

  args.push('-p');
  args.push('--');
  args.push(opts.file);

  // TODO: implement limit
  return streamingParser(gitSpawnedStream(repoPath, args));
}

module.exports = blame;
