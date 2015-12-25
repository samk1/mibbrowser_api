"use strict";
/**
 * Created by Samuel on 21/11/2015.
 */

var smiParser = require('./smiparser.js').parser;
var SmiObject = require('./smiobject.js');
var SmiType = function () {}; //require('./smitype.js');

function compileSmi(source, objectDb, typeDb, compiledModules) {
    var moduleName = null;
    var imports = {}; // descriptors imported from other modules
    var registrations = new Set([]); // descriptors registered in this module
    var anonCount = 0; // count of anonymous descriptors
    var mibSyntax;

    var implementedObjectMacros = new Set([
        'module_identity',
        'object_identity',
        'object_type',
        'notification_type',
        'object_group',
        'notification_group',
        'module_compliance',
        'agent_capabilities'
    ]);

    function compileImport(importSyntax) {
        var moduleName = importSyntax.module_name;
        importSyntax.object_names.forEach(function (objectDescriptor) {
            if(imports[objectDescriptor]) {
                throw(new Error(`${objectDescriptor} imported twice in module ${moduleName}`));
            }

            imports[objectDescriptor] = moduleName;
        });
    }

    function compileValue(descriptor, valueSyntax, typeSyntax) {
        if(valueSyntax.class !== 'object_identifier') {
            throw new Error("non-object identifier value assignments are not implemented");
        }

        var oidSyntax = valueSyntax.value;
        var parentId = oidSyntax.shift();

        var parentDescriptor = parentId.de;
        var parentIdentifier = parentId.id;
        var parentModuleName = imports[parentDescriptor];

        if(!parentModuleName) {
            parentModuleName = moduleName;
        }

        // Get the parent node
        var node = objectDb.getNode(parentModuleName, parentDescriptor, parentIdentifier);
        var object, oidElm, subDescriptor, subIdentifier;
        while(oidSyntax.length > 1) {
            oidElm = oidSyntax.shift();
            subDescriptor = oidElm.de || `anonymous#${anonCount++}`;
            subIdentifier = oidElm.id || 0;
            object = new SmiObject({
                descriptor: subDescriptor,
                identifier: subIdentifier,
                moduleName: moduleName
            });

            // Returns the child node that was added
            node = node.addChild(object);
        }

        var identifier = oidSyntax.pop().id;
        object = new SmiObject({
            descriptor: descriptor,
            identifier: identifier,
            moduleName: moduleName
        });

        if(typeSyntax.type_class === 'macro') {
            if(implementedObjectMacros.has(typeSyntax.macro_name)) {
                object.macroData = typeSyntax.macro_data;
                object.macroName = typeSyntax.macro_name;
            } else {
                throw new Error("Unimplemented macro type: " + typeSyntax.macro_name);
            }
        } else
        if (typeSyntax.type_class !== 'builtin') {
            if(typeSyntax.builtin_name === 'OBJECT IDENTIFIER') {

            } else {
                throw new Error("Unimplemented type:"  + typeSyntax);
            }
        }

        node.addChild(object);
        return true;
    }

    function compileType(descriptor, typeSyntax) {
        var type = new SmiType({
            descriptor: descriptor,
            moduleName: moduleName
        });

        if(typeSyntax.type_class === 'builtin') {
            type.typeClass = 'builtin';
            type.builtinName = typeSyntax.builtin_name;
        } else
        if(typeSyntax.type_class === 'macro') {
            if(typeSyntax.macro_name === 'trap_type') {

            } else
            if(typeSyntax.macro_name === 'textual_convention') {

            } else {
                throw new Error(`Unimplemented macro type: ${typeSyntax.macro_name}`);
            }
        } else
        if(typeSyntax.type_class === 'defined') {

        }
    }

    function compileDefinition(definitionSyntax) {
        var descriptor = definitionSyntax.descriptor;

        if(definitionSyntax.definition_class === 'macro') {
            return;
        }

        if(registrations.has(descriptor)) {
            // Not allowed to register the same descriptor twice
            throw new Error(`descriptor redefined: ${descriptor}`);
        } else {
            // Add to the set of descriptors registered in this module
            registrations.add(descriptor);
        }

        if(definitionSyntax.definition_class === 'value') {
            compileValue(descriptor, definitionSyntax.value, definitionSyntax.type);
        } else
        if(definitionSyntax.definition_class === 'type') {
            compileType(descriptor, definitionSyntax.type);
        }
    }

    mibSyntax = smiParser.parse(source);
    moduleName = mibSyntax.module_identifier;

    if (compiledModules.has(moduleName)) {
        return;
    } else {
        compiledModules.add(moduleName);
    }

    mibSyntax.imports.forEach(function (importSyntax) {
        compileImport(importSyntax);
    });

    mibSyntax.definitions.forEach(function (definitionSyntax) {
        compileDefinition(definitionSyntax);
    });

    objectDb.updateRoot();

    return moduleName;
}

module.exports = compileSmi;