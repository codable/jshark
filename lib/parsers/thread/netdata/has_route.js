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
  let has_routes = [];

  for (let i = 0; i < buf.length; i += 3)
  {
    has_routes.push({
      border_router: buf.slice(i, i + 2),
      preference: buf[i + 2] >> 6,
      Reserved: buf[i + 2] & (1 << 6 - 1),
    });
  }

  return has_routes;
}

exports.parse = parse;
exports.name = 'NetworkData:HasRouteTlv';
