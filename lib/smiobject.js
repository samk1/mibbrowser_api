"use strict";
/**
 * Created by Samuel on 22/11/2015.
 */

/* SmiObject lifecycle:
 * 1. created during parsing. descriptor, identifier and moduleName are set.
 * 2. object information is defined in read-only properties.
 * 3. After parsing is complete, the oid is set as a read only property during
 * OID expansion.
 * 4. The object is added to the object tree where it is accessible by public API.
 * at this point, the object is finalised (the OID is set read only) and sealed.
 *
 * An object can also be created after parsing if it is discovered as a descriptor
 * assignment.
 */
function SmiObject(spec) {
    if(spec.descriptor === undefined) {
        throw(new Error('Descriptor must be specified'));
    }
    if(spec.moduleName === undefined) {
        throw(new Error('Module name must be specified'));
    }

    if(spec.identifier === undefined) {
        throw(new Error('Identifier must be specified'));
    }

    this.descriptor = spec.descriptor;
    this.moduleName = spec.moduleName;
    this.identifier = spec.identifier;
    this.from = new Set([ spec.moduleName ]);
    this.macroData = null;
}

SmiObject.prototype.equals = function (other) {
    var self = this;

    function checkKeys(keys) {
        var key = keys.pop();

        if (!key) {
            return true;
        }

        if(!other.macroData[key]) {
            return false;
        }

        if(self.macroData[key] !== other.macroData[key]) {
            return false;
        }

        return checkKeys(keys);
    }

    if(this.descriptor !== other.descriptor) {
        return false;
    }

    if(this.macroData || other.macroData) {
        if(!this.macroData || !other.macroData) {
            return false;
        }

        var keys = Object.keys(this.macroData);
        if (!checkKeys(keys)) {
            return false;
        }
    }

    return true;
};

SmiObject.prototype.getData = function () {
    var objectData = {};

    objectData.identifier = this.identifier;
    objectData.parentDescriptor = this.parentDescriptor;
    objectData.descriptor = this.descriptor;
    objectData.typeName = this.typeName;

    if(this.macroData) {
        var macroData = this.macroData;
        Object.keys(macroData).forEach(function (macroDataKey) {
            objectData[macroDataKey] = macroData[macroDataKey];
        });
    }

    return objectData;
};

module.exports = SmiObject;