'use strict';

/**
 * Parse the buffer.
 *
 * @param {Buffer}  buf     The buffer to parse.
 * @param {Object}  packet  The packet provides buffer.
 *
 * @return  {Object}  The parsed data.
 */
function parse(buf, packet) {
  let tlvs = [];
  for (let i = 0; i < buf.length;) {
    let type = buf[i];
    i += 1;

    let len = buf[i];
    i += 1;

    let value = buf.slice(i, i + len);
    i += len;

    tlvs.push({
      type: (type >> 1),
      stable: (type & 0x01 !== 0),
      len: len,
      value: value,
    });
  }

  return tlvs;
}

exports.parse = parse;
exports.payload = 'value';
exports.name = 'NetworkData:Tlv';
exports.nexts = [{
    id: 'thread/netdata/service',
    match: function(parsed) {
      return parsed.type === 5;
    },
}];
