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
  return {
    Reserved: buf[0] >> 5,
    cid_compress: (buf[0] >> 4) & 1,
    cid: buf[1] & 0xf,
    context_length: buf[1],
  };
}

exports.parse = parse;
exports.name = 'NetworkData:6LoWPANTlv';
