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
    var opts = { rev: 'master', file: 'CHANGES.md' };

    var gitBlame = proxyquire.load('../', {
      './lib/parser': function(inputStream) {
        inputStream.should.eql('git-spawned-stream');

        return 'streamingParser';
      },
      'git-spawned-stream': function(path, args) {
        path.should.eql(repoPath);
        args.should.eql(['blame', opts.rev, '-p', '--', opts.file]);

        return 'git-spawned-stream';
      }
    });

    gitBlame(repoPath, opts).should.eql('streamingParser');

    done();
  });
});
