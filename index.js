'use strict';

var gitSpawnedStream = require('git-spawned-stream');
var streamingParser = require('./lib/parser');

function blame(repoPath, opts) {
  var args = ['blame', (opts.rev || 'HEAD'), '-p', '--', opts.file];

  if(opts.ignoreWhitespaces) {
    args.splice(3, 0, '-w');
  }

  // TODO: implement limit
  return streamingParser(gitSpawnedStream(repoPath, args));
}

module.exports = blame;
