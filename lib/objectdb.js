 "use strict";
/**
 * Created by Samuel on 13/12/2015.
 */
var SmiObject = require('./smiobject.js');

function ObjectDb() {
    var nodeCount = 0;
    var nodes = {};
    var rootNodes = new Map();

    function getNode(moduleName, descriptor, identifier) {
        var nodeId = `${moduleName}.${descriptor}`;
        var node = nodes[nodeId];

        if (!node) {
            node = new Node(moduleName, descriptor, identifier);
            nodes[nodeId] = node;
        }

        return node;
    }

    function Node(moduleName, descriptor, identifier) {
        var parent;
        var nodeId = nodeCount++;
        var nodeName = `${moduleName}.${descriptor}`;

        rootNodes.set(nodeId, this);

        this.descriptor = descriptor;
        this.identifier = identifier;
        this.moduleName = moduleName;
        this.childIdentifiers = new Map();
        this.childDescriptors = new Map();

        Object.defineProperty(this, 'parent', {
            set: function (node) {
                parent = node;
                rootNodes.delete(nodeId);
            },
            get: function () {
                return parent;
            }
        });

        Object.defineProperty(this, 'id', {
            value: nodeId
        });

        Object.defineProperty(this, 'name', {
            value: nodeName
        });
    }

    Node.prototype.addChild = function (object) {
        var childNode = getNode(object.moduleName, object.descriptor, object.identifier);
        childNode.parent = this;

        if(childNode.object) {
            //console.log(`redefined object ${object.moduleName}::${object.descriptor}`);
        }

        childNode.object = object;

        this.childDescriptors.set(object.descriptor, childNode);
        this.childIdentifiers.set(object.identifier, childNode);

        object.getOid = () => childNode.getOid();

        return childNode;
    };

    Node.prototype.getOid = function () {
        var oid = [];
        oid.unshift(this.object.identifier);

        var parentNode = this.parent;
        while(parentNode && parentNode.object) {
            oid.unshift(parentNode.object.identifier);
            parentNode = parentNode.parent;
        }

        return oid;
    };

    Node.prototype.getObject = function (oid) {
        oid = oid.slice();
        var lastNode = null;
        var nextNode = this;
        var subId;

        (function getLastNode(oid) {
            subId = oid.shift();
            lastNode = nextNode;

            if (typeof subId === 'number') {
                nextNode = lastNode.childIdentifiers.get(subId);
            } else
            if (typeof subId === 'string') {
                nextNode = lastNode.childDescriptors.get(subId);
            }

            if (!subId) {
                return;
            }

            if(nextNode) {
                getLastNode(oid);
            }
        })(oid);

        if(!nextNode) {
            return {
                lastObject: lastNode.object,
                oidRemaining: oid
            };
        }

        return nextNode.object;
    };
    
    Node.prototype.mergeDescriptorsWith = function (other) {
        //console.log(`merging child descriptors of ${this.name} with ${other.name}`);
        var self = this;
        
        // merge the other nodes child descriptors with ours
        this.childDescriptors.forEach(function (node, descriptor) {
            if (other.childDescriptors.has(descriptor)) {
                node.mergeDescriptorsWith(other.childDescriptors.get(descriptor));
                other.childDescriptors.delete(descriptor);
            }
        });
        


        // add the child descriptors from the other to our child descriptors
        other.childDescriptors.forEach(function (node, descriptor) {
            self.childDescriptors.set(descriptor, node);
            other.childDescriptors.delete(descriptor);
        });

        // record the other module that defined the node
        this.object.from.add(other.moduleName);
    };

    Node.prototype.mergeIdentifiersWith = function (other) {
        var self = this;
        //  console.log(`merging child identifiers of ${this.name} with ${other.name}`);

        // merge the other nodes child identifiers with ours
        this.childIdentifiers.forEach(function (node, identifier) {
            if (other.childIdentifiers.has(identifier)) {
                node.mergeIdentifiersWith(other.childIdentifiers.get(identifier));
                other.childIdentifiers.delete(identifier);
            }
        });

        // add the child identifiers from the other to our child descriptors
        other.childIdentifiers.forEach(function (node, identifier) {
            self.childIdentifiers.set(identifier, node);
            other.childIdentifiers.delete(identifier);
        });

        // record the other module that defined the node
        this.object.from.add(other.moduleName);
    };

    var root = new Node();
    rootNodes.delete(root.id);

    this.nodeExists = function (moduleName, descriptor) {
        return !!nodes[`${moduleName}.${descriptor}`];
    };

    this.getObject = function(oid) {
        return root.getObject(oid);
    };

    this.getNode = getNode;
    
    this.updateRoot = function () {
        var anonRoot = 0;
        root.childDescriptors.clear();
        root.childIdentifiers.clear();
        for(let rootNode of rootNodes.values()) {
            if (rootNode.descriptor === 'iso' && rootNode.moduleName === 'SNMPv2-SMI') {
                rootNode.object = new SmiObject({
                    moduleName: 'SNMPv2-SMI',
                    identifier: 1,
                    descriptor: 'iso'
                });
                rootNode.identifier = 1;
            } else
            if (rootNode.descriptor === 'iso' && rootNode.moduleName === 'RFC1155-SMI') {
                rootNode.object = new SmiObject({
                    moduleName: 'RFC1155-SMI',
                    identifier: 1,
                    descriptor: 'iso'
                });
                rootNode.identifier = 1;
            } else
            if (rootNode.identifier === 0 && rootNode.moduleName === 'SNMPv2-SMI') {
                rootNode.object = new SmiObject({
                    moduleName: 'SNMPv2-SMI',
                    identifier: 0,
                    descriptor: 'ccitt'
                });
                rootNode.descriptor = 'ccitt';
            } else {
                rootNode.object = new SmiObject({
                    moduleName: rootNode.moduleName || '#0',
                    identifier: rootNode.identifier || 0,
                    descriptor: rootNode.descriptor || `#root${anonRoot++}`
                });
            }
            rootNode.object.getOid = () => rootNode.getOid();

            if(rootNode.descriptor) {
                if(root.childDescriptors.has(rootNode.descriptor)) {
                    rootNode.mergeDescriptorsWith(root.childDescriptors.get(rootNode.descriptor));
                }
                root.childDescriptors.set(rootNode.descriptor, rootNode);
            }

            if(rootNode.identifier) {
                if(root.childIdentifiers.has(rootNode.identifier)) {
                    rootNode.mergeIdentifiersWith(root.childIdentifiers.get(rootNode.identifier));
                }
                root.childIdentifiers.set(rootNode.identifier, rootNode);
            }
        }
    };

    Object.defineProperty(this, 'rootNodes', {
        value: rootNodes
    })
}

module.exports = ObjectDb;