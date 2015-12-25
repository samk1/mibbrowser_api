var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SmiManager = require('./lib/smimanager');

var api = require('./api');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/_api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

app.locals.mgr = (function () {
    var smiManagers = new Map();
    var smiManagerId = 0;

    return {
        newSmiManager: function () {
            var id = smiManagerId++;
            smiManagers.set(id, new SmiManager());

            return id;
        },

        getSmiManager: function (id) {
            var smiManager = smiManagers.get(id);

            if (!smiManager) {
                throw new Error("No such SMI Manager"); //whatever
            }

            return smiManager;
        },

        clear: function () {
            smiManagers.clear();
            smiManagerId = 0;
        },

        smiManagers: smiManagers
    }
})();

app.locals.modules = new Map([
    ["AGENTX-MIB", "C:\\usr\\share\\snmp\\mibs\\AGENTX-MIB.txt"],
    ["BRIDGE-MIB", "C:\\usr\\share\\snmp\\mibs\\BRIDGE-MIB.txt"],
    ["DISMAN-EVENT-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-EVENT-MIB.txt"],
    ["DISMAN-EXPRESSION-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-EXPRESSION-MIB.txt"],
    ["DISMAN-NSLOOKUP-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-NSLOOKUP-MIB.txt"],
    ["DISMAN-PING-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-PING-MIB.txt"],
    ["DISMAN-SCHEDULE-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-SCHEDULE-MIB.txt"],
    ["DISMAN-SCRIPT-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-SCRIPT-MIB.txt"],
    ["DISMAN-TRACEROUTE-MIB", "C:\\usr\\share\\snmp\\mibs\\DISMAN-TRACEROUTE-MIB.txt"],
    ["EtherLike-MIB", "C:\\usr\\share\\snmp\\mibs\\EtherLike-MIB.txt"],
    ["HCNUM-TC", "C:\\usr\\share\\snmp\\mibs\\HCNUM-TC.txt"],
    ["HOST-RESOURCES-MIB", "C:\\usr\\share\\snmp\\mibs\\HOST-RESOURCES-MIB.txt"],
    ["HOST-RESOURCES-TYPES", "C:\\usr\\share\\snmp\\mibs\\HOST-RESOURCES-TYPES.txt"],
    ["IANA-ADDRESS-FAMILY-NUMBERS-MIB", "C:\\usr\\share\\snmp\\mibs\\IANA-ADDRESS-FAMILY-NUMBERS-MIB.txt"],
    ["IANA-LANGUAGE-MIB", "C:\\usr\\share\\snmp\\mibs\\IANA-LANGUAGE-MIB.txt"],
    ["IANA-RTPROTO-MIB", "C:\\usr\\share\\snmp\\mibs\\IANA-RTPROTO-MIB.txt"],
    ["IANAifType-MIB", "C:\\usr\\share\\snmp\\mibs\\IANAifType-MIB.txt"],
    ["IF-INVERTED-STACK-MIB", "C:\\usr\\share\\snmp\\mibs\\IF-INVERTED-STACK-MIB.txt"],
    ["IF-MIB", "C:\\usr\\share\\snmp\\mibs\\IF-MIB.txt"],
    ["INET-ADDRESS-MIB", "C:\\usr\\share\\snmp\\mibs\\INET-ADDRESS-MIB.txt"],
    ["IP-FORWARD-MIB", "C:\\usr\\share\\snmp\\mibs\\IP-FORWARD-MIB.txt"],
    ["IP-MIB", "C:\\usr\\share\\snmp\\mibs\\IP-MIB.txt"],
    ["IPV6-FLOW-LABEL-MIB", "C:\\usr\\share\\snmp\\mibs\\IPV6-FLOW-LABEL-MIB.txt"],
    ["IPV6-ICMP-MIB", "C:\\usr\\share\\snmp\\mibs\\IPV6-ICMP-MIB.txt"],
    ["IPV6-MIB", "C:\\usr\\share\\snmp\\mibs\\IPV6-MIB.txt"],
    ["IPV6-TC", "C:\\usr\\share\\snmp\\mibs\\IPV6-TC.txt"],
    ["IPV6-TCP-MIB", "C:\\usr\\share\\snmp\\mibs\\IPV6-TCP-MIB.txt"],
    ["IPV6-UDP-MIB", "C:\\usr\\share\\snmp\\mibs\\IPV6-UDP-MIB.txt"],
    ["LM-SENSORS-MIB", "C:\\usr\\share\\snmp\\mibs\\LM-SENSORS-MIB.txt"],
    ["MTA-MIB", "C:\\usr\\share\\snmp\\mibs\\MTA-MIB.txt"],
    ["NET-SNMP-AGENT-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-AGENT-MIB.txt"],
    ["NET-SNMP-EXAMPLES-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-EXAMPLES-MIB.txt"],
    ["NET-SNMP-EXTEND-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-EXTEND-MIB.txt"],
    ["NET-SNMP-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-MIB.txt"],
    ["NET-SNMP-MONITOR-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-MONITOR-MIB.txt"],
    ["NET-SNMP-PASS-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-PASS-MIB.txt"],
    ["NET-SNMP-SYSTEM-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-SYSTEM-MIB.txt"],
    ["NET-SNMP-TC", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-TC.txt"],
    ["NET-SNMP-VACM-MIB", "C:\\usr\\share\\snmp\\mibs\\NET-SNMP-VACM-MIB.txt"],
    ["NETWORK-SERVICES-MIB", "C:\\usr\\share\\snmp\\mibs\\NETWORK-SERVICES-MIB.txt"],
    ["NOTIFICATION-LOG-MIB", "C:\\usr\\share\\snmp\\mibs\\NOTIFICATION-LOG-MIB.txt"],
    ["RFC-1215", "C:\\usr\\share\\snmp\\mibs\\RFC-1215.txt"],
    ["RFC1155-SMI", "C:\\usr\\share\\snmp\\mibs\\RFC1155-SMI.txt"],
    ["RFC1213-MIB", "C:\\usr\\share\\snmp\\mibs\\RFC1213-MIB.txt"],
    ["RMON-MIB", "C:\\usr\\share\\snmp\\mibs\\RMON-MIB.txt"],
    ["SCTP-MIB", "C:\\usr\\share\\snmp\\mibs\\SCTP-MIB.txt"],
    ["SMUX-MIB", "C:\\usr\\share\\snmp\\mibs\\SMUX-MIB.txt"],
    ["SNMP-COMMUNITY-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-COMMUNITY-MIB.txt"],
    ["SNMP-FRAMEWORK-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-FRAMEWORK-MIB.txt"],
    ["SNMP-MPD-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-MPD-MIB.txt"],
    ["SNMP-NOTIFICATION-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-NOTIFICATION-MIB.txt"],
    ["SNMP-PROXY-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-PROXY-MIB.txt"],
    ["SNMP-TARGET-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-TARGET-MIB.txt"],
    ["SNMP-TLS-TM-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-TLS-TM-MIB.txt"],
    ["SNMP-TSM-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-TSM-MIB.txt"],
    ["SNMP-USER-BASED-SM-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-USER-BASED-SM-MIB.txt"],
    ["SNMP-USM-AES-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-USM-AES-MIB.txt"],
    ["SNMP-USM-DH-OBJECTS-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-USM-DH-OBJECTS-MIB.txt"],
    ["SNMP-VIEW-BASED-ACM-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMP-VIEW-BASED-ACM-MIB.txt"],
    ["SNMPv2-CONF", "C:\\usr\\share\\snmp\\mibs\\SNMPv2-CONF.txt"],
    ["SNMPv2-MIB", "C:\\usr\\share\\snmp\\mibs\\SNMPv2-MIB.txt"],
    ["SNMPv2-SMI", "C:\\usr\\share\\snmp\\mibs\\SNMPv2-SMI.txt"],
    ["SNMPv2-TC", "C:\\usr\\share\\snmp\\mibs\\SNMPv2-TC.txt"],
    ["SNMPv2-TM", "C:\\usr\\share\\snmp\\mibs\\SNMPv2-TM.txt"],
    ["TCP-MIB", "C:\\usr\\share\\snmp\\mibs\\TCP-MIB.txt"],
    ["TRANSPORT-ADDRESS-MIB", "C:\\usr\\share\\snmp\\mibs\\TRANSPORT-ADDRESS-MIB.txt"],
    ["TUNNEL-MIB", "C:\\usr\\share\\snmp\\mibs\\TUNNEL-MIB.txt"],
    ["UCD-DEMO-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-DEMO-MIB.txt"],
    ["UCD-DISKIO-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-DISKIO-MIB.txt"],
    ["UCD-DLMOD-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-DLMOD-MIB.txt"],
    ["UCD-IPFILTER-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-IPFILTER-MIB.txt"],
    ["UCD-IPFWACC-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-IPFWACC-MIB.txt"],
    ["UCD-SNMP-MIB-OLD", "C:\\usr\\share\\snmp\\mibs\\UCD-SNMP-MIB-OLD.txt"],
    ["UCD-SNMP-MIB", "C:\\usr\\share\\snmp\\mibs\\UCD-SNMP-MIB.txt"],
    ["UDP-MIB", "C:\\usr\\share\\snmp\\mibs\\UDP-MIB.txt"]
]);


module.exports = app;
