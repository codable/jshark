'use strict';

function parse(buf)
{
  let tlvs = [];
  for (let i = 0; i < buf.length;)
  {
    let type = buf[i];
    i += 1;

    let len = buf[i];
    i += 1;
    if (len === 0xff)
    {
      // three byte
      len = buf.readUInt16BE(i);
      i += 2;
    }

    let value = buf.toString('hex', i, i + len);
    i += len;

    tlvs.push({
      type: type,
      len: len,
      value: value
    });
  }

  return tlvs;
}

exports.parse = parse;
exports.payload = 'value';
