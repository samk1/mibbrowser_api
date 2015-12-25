/**
 * Created by Samuel on 25/12/2015.
 */
var express = require('express');
var router = express.Router();
var oidparser = require('./lib/oidparser').parser;

router.param('id', function (req, res, next, id) {
    id = parseInt(id);
    req.smiManager = req.app.locals.mgr.getSmiManager(id);
    next();
});

router.param('oid', function (req, res, next, oid) {
    var oidSyntax = oidparser.parse(oid);

    req.oid = oidSyntax.identifier_list;
    next();
});

router.get('/smimanager', function(req, res) {
    var id = req.app.locals.mgr.newSmiManager();

    res.json({id});
});

router.put('/smimanager/:id/compile', function(req, res) {
    var source = req.body.source;

    if(!source) {
        throw new Error("bad request");
    }

    var module = req.smiManager.compileMibSourceSync(req.body.source);

    res.json({module});
});

router.get('/smimanager/:id/rootNodes', function(req, res) {
    var rootNodes = [];

    req.smiManager.rootNodes.forEach(function(rootNode) {
        var childIdentifiers = [];
        var childDescriptors = [];

        rootNode.childIdentifiers.forEach((v, k) => childIdentifiers.push(k));
        rootNode.childDescriptors.forEach((v, k) => childDescriptors.push(k));

        rootNodes.push({
            module: rootNode.module,
            identifier: rootNode.identifier,
            descriptor: rootNode.descriptor,
            childIdentifiers: childIdentifiers,
            childDescriptors: childDescriptors
        });
    });

    res.json({rootNodes});
});

router.put('/smimanager/:id/load/:module', function(req, res) {
    var module = req.params.module;

    var modulePath = req.app.locals.modules.get(module);

    if(!modulePath) {
        throw new Error('No such module');
    }

    req.smiManager.compileMibSync(modulePath);

    res.json({module});
});

router.put('/smimanager/:id/loadAll', function(req, res) {
   var modules = [];

   req.app.locals.modules.forEach(function (path, module) {
       req.smiManager.compileMibSync(path);

       modules.push(module);
   });

    res.json({modules});
});

router.get('/smimanager/:id/objects/:oid', function(req, res) {
    var object = req.smiManager.getObject(req.oid);
    var macros = new Map([
        ['module_identity', 'MODULE IDENTITY']
    ]);

    if(!object) {
        throw new Error("Object not found");
    }

    var response = {object: {
        descriptor: object.descriptor,
        identifier: object.identifier,
        from: Array.from(object.from)
    }};

    if (object.macroName) {
        response.object.macroName = macros.get(object.macroName);
    }

    if (object.macroData) {
        response.object.macroData = {};

        Object.keys(object.macroData).forEach(
            k => response.object.macroData[k] = object.macroData[k]
        );
    }

    res.json(response);
});

router.get('/modules', function (req, res) {
    var modules = [];

    app.locals.modules.forEach(v => modules.push(v));

    res.json({modules});
});

module.exports = router;