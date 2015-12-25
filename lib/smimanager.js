"use strict";

/**
 * Created by Samuel on 21/11/2015.
 */

var oidparser = require('./oidparser.js').parser;
var OID_SYNTAX_CLASSES = require('./constants.js').OID_SYNTAX_CLASSES;
var compileSmi = require('./compilesmi.js');
var SmiObject = require('./smiobject.js');
var ObjectDb = require('./objectdb.js');
var fs = require('fs');
var path = require('path');

function SmiManager() {
    var compiledModules = new Set();

    function TypeDb() {

    }

    function parseModuleObjectOidSyntax(oidSyntax) {
        var moduleName = oidSyntax.module_name;
        var objectDescriptor = oidSyntax.object_name;
        var postIdentifiers = oidSyntax.post_identifier_list;
        var node, object;

        if (objectDb.nodeExists(moduleName, objectDescriptor)) {
            node = objectDb.getNode(moduleName, objectDescriptor);
        } else {
            throw new Error(`Undefined object: ${moduleName}::${objectDescriptor}`);
        }

        if (postIdentifiers) {
            object = node.getObject(postIdentifiers);
        } else {
            object = node.object;
        }

        if(object.constructor !== SmiObject) {
            return object.lastObject.getOid().concat(object.oidRemaining);
        } else {
            return object.getOid();
        }
    }

    function parseIdentifierListOidSyntax(oidSyntax) {
        var identifiers = oidSyntax.identifier_list;

        var object = objectDb.getObject(identifiers);

        if(object.constructor !== SmiObject) {
            return object.lastObject.getOid().concat(object.oidRemaining);
        } else {
            return object.getOid();
        }
    }

    function parseOid(oidString) {
        var oidSyntax = oidparser.parse(oidString);

        if(oidSyntax.syntax_class === OID_SYNTAX_CLASSES.ModuleObject) {
            return parseModuleObjectOidSyntax(oidSyntax);
        } else if (oidSyntax.syntax_class === OID_SYNTAX_CLASSES.IdentifierList) {
            return parseIdentifierListOidSyntax(oidSyntax);
        }
    }

    function getObject(oid) {
        return objectDb.getObject(oid);
    }

    function translateNumericOid(oid) {

    }

    function translateFullOid(oid) {

    }

    function translateSymbolicOid(oid) {

    }

    var objectDb = new ObjectDb();
    var typeDb = new TypeDb();

    function compileMib(mibFile, callback) {
        fs.readFile(mibFile, {encoding: 'utf8'}, function(err, data) {
            compileSmi(data, objectDb, typeDb, compiledModules);
            callback();
        });
    }

    function compileMibSync(mibFile) {
        var source = fs.readFileSync(mibFile, {encoding: 'utf8'});

        return compileSmi(source, objectDb, typeDb, compiledModules);
    }

    function compileMibSourceSync(source) {
        return compileSmi(source, objectDb, typeDb, compiledModules);
    }

    Object.defineProperty(this, 'parseOid', {
        value: parseOid
    });

    Object.defineProperty(this, 'getObject', {
        value: getObject
    });

    Object.defineProperty(this, 'translateNumericOid', {
        value: translateNumericOid
    });

    Object.defineProperty(this, 'translateFullOid', {
        value: translateFullOid
    });

    Object.defineProperty(this, 'translateSymbolicOid', {
        value: translateSymbolicOid
    });

    Object.defineProperty(this, 'compileMib', {
        value: compileMib
    });

    Object.defineProperty(this, 'compileMibSync', {
        value: compileMibSync
    });

    Object.defineProperty(this, 'compileMibSourceSync', {
        value: compileMibSourceSync
    });

    Object.defineProperty(this, 'modules', {
        value: compiledModules
    });

    Object.defineProperty(this, 'rootNodes', {
        get: function () {
            var rootNodes = [];
            objectDb.rootNodes.forEach(v => rootNodes.push(v));

            return rootNodes;
        }
    });
}

module.exports = SmiManager;