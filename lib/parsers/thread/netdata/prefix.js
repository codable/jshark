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
    let prefix = buf.slice(2, 2 + (buf[1] + 7) / 8);
    let tlv = {
      domain_id: buf[0],
      prefix_length: buf[1],
      prefix: prefix,
    };
    let subtlv_start = 2 + prefix.length;
    if (buf.length > subtlv_start)
    {
        tlv.value = buf.slice(subtlv_start);
    }

  return tlv;
}

exports.parse = parse;
exports.payload = 'value';
exports.name = 'NetworkData:PrefixTlv';
exports.nexts = [{
    id: 'thread/netdata/tlv',
    match: function(parsed) {
      return parsed.value !== undefined;
    },
}];

