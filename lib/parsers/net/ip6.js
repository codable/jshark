const ProtoType = {
  kHopOpts: 0,    // IPv6 Hop-by-Hop Option
  kTcp: 6,        // Transmission Control Protocol
  kUdp: 17,       // User Datagram
  kIp6: 41,       // IPv6 encapsulation
  kRouting: 43,   // Routing Header for IPv6
  kFragment: 44,  // Fragment Header for IPv6
  kIcmp6: 58,     // ICMP for IPv6
  kNone: 59,      // No Next Header for IPv6
  kDstOpts: 60,   // Destination Options for IPv6
};

/**
 * This class implements the functionality of IPv6 extension headers.
 */
class ExtensionHeader {
  /**
   * Initialize an IPv6 extension header.
   *
   * @param   {number}  type    The extension header type.
   * @param   {number}  length  The header length.
   * @param   {Buffer}  value   The header value.
   */
  constructor(type, length, value) {
    this.type = type;
    this.length = length;
    this.value = value;
  }
}

/**
 * Parse buffer.
 *
 * @param {Buffer}  buf     The buffer to parse.
 * @param {object}  packet  The packet provides this buffer.
 *
 * @return  {object}  The parsed data.
 */
function parse(buf, packet) {
  let header = {
    version: buf[0] >> 4,
    trafficClass: (((buf[0] & 0x0f) << 4) | (buf[1] >> 4)),
    flowLabel: ((buf[1] & 0x0f) << 16) | buf.readUInt16BE(2),
    length: buf.readUInt16BE(4),
    nextHeader: buf[6],
    hopLimit: buf[7],
    src: buf.slice(8, 8 + 16),
    dst: buf.slice(24, 40),
  };

  let offset = 40;
  let payload = null;
  let headers = [];

  for (let nextHeader = header.nextHeader; nextHeader !== false;) {
    switch (nextHeader) {
    case ProtoType.kTcp:
    case ProtoType.kUdp:
    case ProtoType.kIcmp6:
    case ProtoType.kIp6:
      payload = buf.slice(offset);
      nextHeader = false;
      break;

    default:
      length = buf[offset + 1];
      value = buf.slice(offset + 2, offset + (length + 1) * 8);
      headers.push(new ExtensionHeader(nextHeader, length, value));
      nextHeader = buf[offset];
      offset += (length + 1) * 8;
      break;
    }
  }

  return {
    header: header,
    headers: headers,
    payload: payload,
  };
}

let nexts = [{
    id: 'net/udp',
}];

exports.parse = parse;
exports.nexts = nexts;
exports.name = 'IPv6';
