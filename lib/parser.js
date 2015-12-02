/* eslint-disable no-cond-assign */
'use strict';

var debug = require('debug')('git-blame:parser');
var splitStream = require('split-transform-stream');

module.exports = function streamBlame(inputStream) {
  var blameLine;
  var commit;
  var lastCommitId;

  function write(line, enc, cb) {
    var key;
    var pos;
    var val;
    var tmp;

    debug('line', line);

    var matched = line.match(/^(\w{40}) (\d+) (\d+)/);

    if (matched) {
      if (blameLine) {
        this.emit('data', 'line', blameLine);
      }

      if (commit) {
        this.emit('data', 'commit', commit);
      }

      blameLine = {
        hash: matched[1],
        originalLine: matched[2],
        finalLine: matched[3]
      };

      lastCommitId = matched[1];
      commit = null;
    } else if (line.substring(0, 1) === '\t') {
      blameLine.content = line.substring(1, line.length);
    } else if (line) {
      if (!commit) {
        commit = { hash: lastCommitId, author: {}, committer: {} };
      }

      if (matched = line.match(/^(author|committer) (.*)/)) {
        key = 'name';
        val = matched[2];

        commit[matched[1]][key] = val;
      } else if (matched = line.match(/^(author|committer)-mail <(.*)>/)) {
        key = 'mail';
        val = matched[2];

        commit[matched[1]][key] = val;
      } else if (matched = line.match(/^(author|committer)-(.*) (.*)/)) {
        key = matched[2];
        val = matched[3];

        if (key === 'time') {
          key = 'timestamp';
          val = parseInt(val, 10);
        }

        commit[matched[1]][key] = val;
      } else {
        pos = line.indexOf(' ');
        key = line.substring(0, pos);
        val = line.substring(pos + 1, line.length);

        if (key === 'previous') {
          tmp = val.split(' ');
          val = {
            hash: tmp[0],
            filename: tmp[1]
          };
        }

        if (key && val) {
          commit[key] = val;
        }
      }
    }

    cb();
  }

  function end(cb) {
    if (blameLine) {
      this.emit('data', 'line', blameLine);
    }
    if (commit) {
      this.emit('data', 'commit', commit);
    }

    cb();
  }

  return splitStream(inputStream, write, end);
};
