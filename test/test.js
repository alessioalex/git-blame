/* eslint-disable no-console, func-names */
'use strict';

require('should');
var proxyquire = require('proxyquire');
var fs = require('fs');
var streamingParser = require('../lib/parser');

describe('git-blame', function() {
  it('should parse the git-blame output', function(done) {
    var output = {
      lines: [],
      commits: []
    };
    streamingParser(fs.createReadStream(__dirname + '/fixture.txt', 'utf8'))
      .on('data', function(type, data) {
        output[type + 's'].push(data);
      }).on('error', function(err) {
        throw err;
      }).on('end', function() {
        output.should.eql(require('./output.json'));

        done();
      });
  });

  it('should delegate with the correct params', function(done) {
    var repoPath = '/home/node.git';
    var opts = {
      ignoreWhitespaces: false,
      detectMoved: false,
      detectCopy: false,
      repoPath: repoPath,
    };

    var gitBlame = proxyquire.load('../', {
      './lib/parser': function(inputStream) {
        inputStream.should.eql('git-spawned-stream');

        return 'streamingParser';
      },
      'git-spawned-stream': function(args, configs) {
        configs.repoPath.should.eql(repoPath);
        args.should.eql(['blame', '-p', '--', 'CHANGES.md']);

        return 'git-spawned-stream';
      }
    });

    gitBlame('CHANGES.md', opts).should.eql('streamingParser');

    done();
  });
});
