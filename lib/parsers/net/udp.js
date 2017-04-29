function parse(buf, packet)
{
  return {
    sport: buf.readUInt16BE(0),
    dport: buf.readUInt16BE(2),
    length: buf.readUInt16BE(4),
    chksum: buf.readUInt16BE(6),
    payload: buf.slice(8),
  };
}

exports.parse = parse;
