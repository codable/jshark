'use strict';

const DefaultPort = {
  kCoAP: 5683, // default port for CoAP.
  kMLE: 19788, // default port for MLE.
};

/**
 * Parse the buffer.
 *
 * @param {Buffer}  buf     The buffer to parse.
 * @param {Object}  packet  The packet provides the buffer.
 *
 * @return  {object}  The parsed data.
 */
function parse(buf, packet) {
  if (buf.length < 8) {
    return;
  }

  return {
    sport: buf.readUInt16BE(0),
    dport: buf.readUInt16BE(2),
    length: buf.readUInt16BE(4),
    chksum: buf.readUInt16BE(6),
    payload: buf.slice(8),
  };
}

exports.nexts = [{
  id: 'net/coap',
  match: function(parsed) {
    return (parsed.sport === DefaultPort.kCoAP ||
            parsed.dport === DefaultPort.kCoAP);
  },
}, {
  id: 'thread/mle',
  match: function(parsed) {
    return (parsed.sport === DefaultPort.kMLE &&
            parsed.dport === DefaultPort.kMLE);
  },
}];
exports.parse = parse;
exports.name = 'UDP';
