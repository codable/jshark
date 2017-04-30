const kProtoHopOpts  = 0;   ///< IPv6 Hop-by-Hop Option
const kProtoTcp      = 6;   ///< Transmission Control Protocol
const kProtoUdp      = 17;  ///< User Datagram
const kProtoIp6      = 41;  ///< IPv6 encapsulation
const kProtoRouting  = 43;  ///< Routing Header for IPv6
const kProtoFragment = 44;  ///< Fragment Header for IPv6
const kProtoIcmp6    = 58;  ///< ICMP for IPv6
const kProtoNone     = 59;  ///< No Next Header for IPv6
const kProtoDstOpts  = 60;  ///< Destination Options for IPv6

class ExtensionHeader {
  constructor(type, length, value) {
    this.type = type;
    this.length = length;
    this.value = value;
  }
}

function parse(buf, packet)
{
  let header = {
    version: buf[0] >> 4,
    trafficClass: (((buf[0] & 0x0f) << 4) | (buf[1] >> 4)),
    flowLabel: ((buf[1] & 0x0f) << 16) | buf.readUInt16BE(2),
    length: buf.readUInt16BE(4),
    nextHeader: buf[6],
    hopLimit: buf[7],
    src: buf.slice(8, 8 + 16),
    dst: buf.slice(24, 40)
  };

  let offset = 40;
  let payload = null;
  let headers = [];

  for (let nextHeader = header.nextHeader; nextHeader !== false;) {
    switch (nextHeader) {
    case kProtoTcp:
    case kProtoUdp:
    case kProtoIcmp6:
    case kProtoIp6:
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
    payload: payload
  };
}

let nexts = [{
    id: 'net/udp',
}];

exports.parse = parse;
exports.nexts = nexts;
