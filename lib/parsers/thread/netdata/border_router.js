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
  let border_routers = [];

  for (let i = 0; i < buf.length; i += 4)
  {
    border_routers.push({
      border_router: buf.slice(i, i + 2),
      preference: buf[i + 2] >> 6,
      preferred: (buf[i + 2] >> 5) & 1,
      slaac: (buf[i + 2] >> 4) & 1,
      dhcp: (buf[i + 2] >> 3) & 1,
      configure: (buf[i + 2] >> 2) & 1,
      default: (buf[i + 2] >> 1) & 1,
      on_mesh: (buf[i + 2]) & 1,
      nd_dns: (buf[i + 3] >> 7) & 1,
      Reserved: buf[i + 3] & 0b01111111,
    });
  }

  return border_routers;
}

exports.parse = parse;
exports.name = 'NetworkData:BorderRouterTlv';
