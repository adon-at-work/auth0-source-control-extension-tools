const expect = require('chai').expect;

const utils = require('../src/utils');


describe('#utils', function() {
  it('should unify scripts', function(done) {
    const data = [ {
      name: 'database',
      scripts: [
        {
          name: 'login',
          htmlFile: '<html>@@hello@@</html>',
          metadataFile: { b: 2 },
          scriptFile: { a: 1 }
        },
        {
          name: 'else',
          metadataFile: '{"b":@@two@@}',
          scriptFile: 'console.log(@@hello@@);'
        }
      ]
    } ];

    const mappings = {
      hello: 'goodbye',
      two: 2
    };

    const expectation = [ {
      name: 'database',
      scripts: {
        login: {
          name: 'login',
          htmlFile: '<html>"goodbye"</html>',
          metadataFile: '{"b":2}',
          scriptFile: '{"a":1}'
        },
        else: {
          name: 'else',
          metadataFile: '{"b":2}',
          scriptFile: 'console.log("goodbye");'
        }
      }
    } ];

    expect(utils.unifyDatabases(data, mappings)).to.deep.equal(expectation);
    done();
  });

  it('should unify configs', function(done) {
    const data = [
      {
        name: 'client1',
        metadataFile: { b: 2 },
        configFile: { a: 1 }
      },
      {
        name: 'client2',
        metadataFile: '{"b":@@two@@}',
        configFile: '{"a":1}'
      }
    ];

    const expectation = {
      client1: {
        name: 'client1',
        metadataFile: '{"b":2}',
        configFile: '{"a":1}'
      },
      client2: {
        name: 'client2',
        metadataFile: '{"b":2}',
        configFile: '{"a":1}'
      }
    };

    expect(utils.unifyScripts(data, { two: 2 })).to.deep.equal(expectation);
    done();
  });

  it('should parse json', function(done) {
    const string = '{ "a": 1 }';

    expect(utils.parseJsonFile('test', string)).to.deep.equal({ a: 1 });
    done();
  });

  it('should parse json with keyword replacement mappings', function(done) {
    const mappings = {
      string: 'some string',
      array: [
        'some value',
        'some other value'
      ],
      object: {
        key1: 'value1',
        key2: 'value2'
      },
      int: 5
    };
    const contents = '{ "a": 1, "string_key": @@string@@, "array_key": @@array@@, "object_key": @@object@@, "int_key": @@int@@ }';
    const expectations = {
      a: 1,
      string_key: 'some string',
      array_key: [
        'some value',
        'some other value'
      ],
      object_key: {
        key1: 'value1',
        key2: 'value2'
      },
      int_key: 5
    };
    expect(utils.parseJsonFile('test2', contents, mappings)).to.deep.equal(expectations);
    done();
  });

  it('should throw error if cannot parse json', function(done) {
    const string = 'json?';

    expect(function() {
      utils.parseJsonFile('test', string);
    }).to.throw(/Error parsing JSON from metadata file: test/);
    done();
  });

  it('should generate sha256 hex checksum with string', function(done) {
    const string = 'Some string value';
    const expectation = 'ec52355b4573bfac072b4fd2391e4b536edaabb09b55a4b71493b19fcf2461f1';

    expect(utils.generateChecksum(string, expectation));
    done();
  });

  it('should throw argument error for a checksum on a non-string', function(done) {
    const nonstring = {};

    expect(function() {
      utils.generateChecksum(nonstring);
    }).to.throw(/Must provide data as a string/);
    done();
  });

  it('should reduce stringified JSON with array of parameter names', function(done) {
    const object = {
      prop1: 'value 1',
      prop2: 'value 2',
      prop3: 'value 3',
      prop4: 'value 4',
      prop5: 'value 5',
      prop6: {
        prop1: 'value 1',
        prop2: 'value 2',
        prop3: 'value 3'
      }
    };

    const expectation = {
      prop1: 'value 1',
      prop2: 'value 2',
      prop4: 'value 4',
      prop6: {
        prop1: 'value 1',
        prop2: 'value 2'
      }
    };

    const json = JSON.stringify(object, utils.propertyReducer([ 'prop3', 'prop5' ]));
    const reducedObject = JSON.parse(json);

    expect(reducedObject).to.deep.equal(expectation);
    done();
  });

  it('should reduce stringified JSON with a single parameter name as a string', function(done) {
    const object = {
      prop1: 'value 1',
      prop2: 'value 2',
      prop3: 'value 3',
      prop4: 'value 4',
      prop5: 'value 5',
      prop6: {
        prop1: 'value 1',
        prop2: 'value 2',
        prop3: 'value 3'
      }
    };

    const expectation = {
      prop1: 'value 1',
      prop2: 'value 2',
      prop4: 'value 4',
      prop5: 'value 5',
      prop6: {
        prop1: 'value 1',
        prop2: 'value 2'
      }
    };

    const json = JSON.stringify(object, utils.propertyReducer('prop3'));
    const reducedObject = JSON.parse(json);

    expect(reducedObject).to.deep.equal(expectation);
    done();
  });

  it('should not impact stringified JSON with unspecified properties', function(done) {
    const object = {
      prop1: 'value 1',
      prop2: 'value 2',
      prop3: 'value 3',
      prop4: 'value 4',
      prop5: 'value 5',
      prop6: {
        prop1: 'value 1',
        prop2: 'value 2',
        prop3: 'value 3'
      }
    };

    const json = JSON.stringify(object, utils.propertyReducer());
    const reducedObject = JSON.parse(json);

    expect(reducedObject).to.deep.equal(object);
    done();
  });
});
