/**
 * Created by Samuel on 25/12/2015.
 */
var request = require('supertest');
var expect = require('expect');
var app = require('../app.js');
var fs = require('fs');

describe('smimanager endpoint', function() {
    describe('GET /_api/smimanager', function() {
        beforeEach(function () {
            app.locals.mgr.clear();
        });

        it("should return the id of the manager", function (done) {
            request(app)
            .get('/_api/smimanager')
            .expect(function (res) {
                expect(res.body.id).toNotBe(undefined);
            })
            .end(done)
        });

        it("should create the manager in the mgr object", function (done) {
            request(app)
            .get('/_api/smimanager')
            .expect(function () {
                expect(app.locals.mgr.smiManagers.size).toEqual(1);
            })
            .end(done);
        });
    });

    describe('PUT /_api/smimanager/:id/compile', function() {
        var id;

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager()
        });

        it("should compile IF-MIB", function(done) {
            var ifMibSrc = fs.readFileSync("C:\\usr\\share\\snmp\\mibs\\IF-MIB.txt", {encoding: 'utf-8'});
            request(app)
            .put(`/_api/smimanager/${id}/compile`)
            .send({source: ifMibSrc})
            .expect(function (res) {
                expect(res.body.module).toEqual('IF-MIB');
            })
            .end(done);
        });
    });

    describe('GET /_api/smimanager/:id/rootNodes', function () {
        var id;

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager();
            var smiManager = app.locals.mgr.getSmiManager(id);
            var ifMibSrc = fs.readFileSync("C:\\usr\\share\\snmp\\mibs\\IF-MIB.txt", {encoding: 'utf-8'});
            smiManager.compileMibSourceSync(ifMibSrc);
        });

        it("should return the root nodes in IF-MIB", function (done) {
            request(app)
            .get(`/_api/smimanager/${id}/rootNodes`)
            .expect(function (res) {
                expect(res.body.rootNodes).toEqual([
                    {
                        "descriptor": "mib-2",
                        "childIdentifiers": [
                            31,
                            2
                        ],
                        "childDescriptors": [
                            "ifMIB",
                            "interfaces"
                        ]
                    },
                    {
                        "descriptor": "snmpTraps",
                        "childIdentifiers": [
                            3,
                            4
                        ],
                        "childDescriptors": [
                            "linkDown",
                            "linkUp"
                        ]
                    }
                ]);
            })
            .end(done);
        })
    });

    describe("PUT /_api/smimanager/:id/load/:module", function () {
        var id;
        var smiManager;
        var module = 'IF-MIB';

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager();
            smiManager = app.locals.mgr.getSmiManager(id);
        });

        it("should return IF-MIB as the module in the response", function (done) {
            request(app)
            .put(`/_api/smimanager/${id}/load/${module}`)
            .expect(function (res) {
                expect(res.body.module).toEqual('IF-MIB');
            })
            .end(done);
        });

        it("should load IF-MIB in the SMI manager", function (done) {
            request(app)
            .put(`/_api/smimanager/${id}/load/${module}`)
            .expect(function () {
                expect(smiManager.modules.has(module)).toBe(true)
            })
            .end(done);
        });
    });

    describe("PUT /_api/smimanager/", function () {
        var id;
        var smiManager;

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager();
            smiManager = app.locals.mgr.getSmiManager(id);
        });

        it("should return all modules in the response", function (done) {
            request(app)
            .put(`/_api/smimanager/${id}/loadAll`)
            .expect(function (res) {
                var moduleSet = new Set(res.body.modules);

                app.locals.modules.forEach(function (path, module) {
                    expect(moduleSet.has(module)).toBe(true, `${module} not loaded`);
                });
            })
            .end(done);
        });

        it("should load all modules in the smiManager", function (done) {
            request(app)
            .put(`/_api/smimanager/${id}/loadAll`)
            .expect(function () {
                app.locals.modules.forEach(function (path, module) {
                    expect(smiManager.modules.has(module)).toBe(true, `${module} not loaded`);
                });
            })
            .end(done);
        });
    });

    describe("GET /_api/smimanager/:id/objects/:oid", function () {
        var id;
        var oid = 'mib-2.ifMIB';
        var smiManager;

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager();
            smiManager = app.locals.mgr.getSmiManager(id);
            smiManager.compileMibSync(app.locals.modules.get('IF-MIB'));
        });

        it("should return the module identity (mib-2.ifMIB)", function (done) {
            request(app)
            .get(`/_api/smimanager/${id}/objects/${oid}`)
            .expect(function (res) {
                expect(res.body.object).toEqual({
                    "descriptor": "ifMIB",
                    "identifier": 31,
                    "from": [
                        "IF-MIB"
                    ],
                    "macroData": {
                        "update": "\"200006140000Z\"",
                        "organization": "\"IETF Interfaces MIB Working Group\"",
                        "contact": "\"   Keith McCloghrie\n                Cisco Systems, Inc.\n                170 West Tasman Drive\n                San Jose, CA  95134-1706\n                US\n\n                408-526-5260\n                kzm@cisco.com\"",
                        "description": "\"The MIB module to describe generic objects for network\n            interface sub-layers.  This MIB is an updated version of\n            MIB-II's ifTable, and incorporates the extensions defined in\n            RFC 1229.\"",
                        "revisions": [
                            {
                                "revision": "\"200006140000Z\"",
                                "description": "\"Clarifications agreed upon by the Interfaces MIB WG, and\n            published as RFC 2863.\""
                            },
                            {
                                "revision": "\"199602282155Z\"",
                                "description": "\"Revisions made by the Interfaces MIB WG, and published in\n            RFC 2233.\""
                            },
                            {
                                "revision": "\"199311082155Z\"",
                                "description": "\"Initial revision, published as part of RFC 1573.\""
                            }
                        ]
                    },
                    "macroName": "MODULE IDENTITY"
                });
            })
            .end(done);
        });
    });

    describe("PUT /_api/smimanager/:id/nodes/bulk", function() {
        var id;
        var oids = [
            ['mib-2', 'interfaces', 'ifTable', 'ifEntry', 'ifInOctets'],
            ['mib-2', 'interfaces', 'ifTable', 'ifEntry', 'ifOutOctets']
        ];
        var smiManager;

        beforeEach(function () {
            app.locals.mgr.clear();
            id = app.locals.mgr.newSmiManager();
            smiManager = app.locals.mgr.getSmiManager(id);
            smiManager.compileMibSync(app.locals.modules.get('IF-MIB'));
        });

        it("should return two nodes in the response body", function (done) {
            request(app)
            .put(`/_api/smimanager/${id}/nodes/bulk`)
            .send({oids})
            .expect(function (res) {
                expect(res.body.nodes.length).toEqual(2)
            })
            .end(done);
        });

        it("should return correct request body", function (done) {
            request(app)
                .put(`/_api/smimanager/${id}/nodes/bulk`)
                .send({oids})
                .expect(function (res) {
                    expect(res.body.nodes).toEqual([
                        {
                            "module": "IF-MIB",
                            "identifier": 10,
                            "descriptor": "ifInOctets",
                            "childIdentifiers": [],
                            "childDescriptors": []
                        },
                        {
                            "module": "IF-MIB",
                            "identifier": 16,
                            "descriptor": "ifOutOctets",
                            "childIdentifiers": [],
                            "childDescriptors": []
                        }
                    ])
                })
                .end(done);
        })
    })
});

describe("modules endpoint", function() {
    describe("GET /_api/modules", function () {
        it("Should return the full list of modules", function (done) {
            request(app)
                .get('/_api/modules')
                .expect(function (res) {
                    expect(res.body.modules).toExist();
                })
                .end(done);
        });
    });
});