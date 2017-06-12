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
  let service = {};
  let i = 0;
  service.T = buf[i] >> 7;
  service.Reserved = (buf[i] >> 4 & 0x07);
  service.S_id = buf[i] & 0x0f;
  i += 1;

  if (!service.T) {
    service.S_enterprise_number = buf.slice(i, i + 4);
    i += 4;
  }

  let serviceDataLength = buf[i];
  i += 1;

  service.S_service_data = buf.slice(i, i + serviceDataLength);
  i += serviceDataLength;

  service.value = buf.slice(i);
  return service;
}

exports.parse = parse;
exports.payload = 'value';
exports.name = 'NetworkData:Service';
