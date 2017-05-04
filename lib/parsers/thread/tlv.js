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
    if (len === 0xff) {
      // three byte
      len = buf.readUInt16BE(i);
      i += 2;
    }

    let value = buf.toString('hex', i, i + len);
    i += len;

    tlvs.push({
      type: type,
      len: len,
      value: value,
    });
  }

  return tlvs;
}

exports.parse = parse;
exports.payload = 'value';
exports.name = 'Tlv';
