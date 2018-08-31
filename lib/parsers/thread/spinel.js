'use strict';
let defines = require('./spinel-defines');

function parseChanged(key, buf, i)
{
  switch (key) {
  case defines.kProperty.SPINEL_PROP_LAST_STATUS:
    let ret = {};
    [ret.status, i] = parseInteger(buf, i);

    if (i < buf.length) {
      ret.metadata = buf.slice(i);
    }
    return ret;
  default:
    return buf.slice(i);
  }
}

function parseInteger(buf, i)
{
  let val = buf[i];

  if (val >= 0x80) {
    val &= 0x7f;
    i += 1;

    if (buf[i] >= 0x80) {
        val += (buf[i] & 0x7f) << 7;
        i += 1;

        val += buf[i] << 14;
    } else {
        val += buf[i] << 7;
    }
  }
  i += 1;

  return [val, i];
}

function parseStreamRaw(buf)
{
  let i = 0;
  let frame = {};

  frame.length = buf.readUInt16LE(i);
  i += 2;

  frame.payload = buf.slice(i, i + frame.length);
  i += frame.length;

  frame.channel = buf.readUInt8(i);
  i += 1;

  frame.linkQualityIndex = buf.readUInt8(i);
  i += 1;

  return frame;
}

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
  let header = {
    flag: buf[0] >> 6,
    iid: (buf[0] >> 4) & 0x3,
    tid: buf[0] & 0x0f,
  };
  i += 1;

  let cmd;
  [cmd, i] = parseInteger(buf, i);

  let frame = {
    header: header,
  };

  switch (cmd) {
  case 0: cmd = 'noop'; break;
  case 1: cmd = 'reset'; break;
  case 2:
    cmd = 'get';
    [frame.property, i] = parseInteger(buf, i);
    break;
  case 3:
    cmd = 'set';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = buf.slice(i);
    break;
  case 4:
    cmd = 'insert';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = buf.slice(i);
    break;
  case 5:
    cmd = 'remove';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = buf.slice(i);
    break;
  case 6:
    cmd = 'changed';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = parseChanged(frame.property, buf, i);
    break;
  case 7:
    cmd = 'inserted';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = buf.slice(i);
    break;
  case 8:
    cmd = 'removed';
    [frame.property, i] = parseInteger(buf, i);
    frame.value = buf.slice(i);
    break;
  default: console.warn('Unknown command!'); break;
  }

  switch (frame.property)
  {
    case defines.kProperty.SPINEL_PROP_STREAM_RAW:
      frame.value = parseStreamRaw(frame.value);
      break;
    default:
      break;
  }

  if (frame.property !== undefined)
  {
    frame.property = defines.getPropertyName(frame.property);
  }
  frame.command = cmd;
  return frame;
}

exports.parse = parse;
exports.name = 'Spinel';
