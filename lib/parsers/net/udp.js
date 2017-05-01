'use strict';

const kPortCoAP = 5683; ///< default port for CoAP.
const kPortMLE = 19788; ///< default port for MLE.

function parse(buf, packet)
{
  if (buf.length < 8) {
    throw new Error('Invalid UDP packet');
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
    return (parsed.sport === kPortCoAP ||
            parsed.dport === kPortCoAP);
  }
}, {
  id: 'thread/mle',
  match: function(parsed) {
    return (parsed.sport === kPortMLE &&
            parsed.dport === kPortMLE);
  }
}];
exports.parse = parse;
exports.name = 'UDP';
