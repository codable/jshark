'use strict';
const crc16 = require('crc16-ccitt-node');

const kCodeSync = 0x7e;
const kCodeEscape = 0x7d;
const kCodeXon = 0x11;
const kCodeXoff = 0x13;
const kCodeVendorSpecific = 0xf8;

/**
 * Parse the buffer.
 *
 * @param {Buffer}  buf     The buffer to parse.
 * @param {Object}  packet  The packet provides the packet.
 *
 * @return  {Object}  The parsed data.
 */
function parse(buf, packet) {
  let i = 0;
  let end = buf.length;

  if (buf[0] != kCodeSync || buf[end - 1] != kCodeSync)
  {
    console.warn('Invalid HDLC packet');
    return;
  }
  i += 1;

  let decoded = [];
  while (i < end) {
    switch (buf[i])
    {
    case kCodeEscape:
      decoded.push(buf[++i] ^ 0x20);
      break;
    case kCodeSync:
      break;
    case kCodeXon:
    case kCodeXoff:
    case kCodeVendorSpecific:
      console.warn('Illegal byte found in HDLC packet');
      return;
    default:
      decoded.push(buf[i]);
      break;
    }

    ++i;
  }

  let expected = (decoded[decoded.length - 2] | (decoded[decoded.length - 1] << 8));
  decoded.length -= 2;
  let payload = Buffer.from(decoded);

  let checksum = crc16.getCrc16(payload);
  console.log('checksum is %s', checksum.toString(16));
  console.log('expected is %s', expected.toString(16));

  if (checksum != expected)
  {
    console.warn('Bad CRC');
  }

  return {
    payload: payload,
  };
}

let nexts = [{
    id: 'thread/spinel',
}];

exports.nexts = nexts;
exports.parse = parse;
exports.name = 'HDLC';
