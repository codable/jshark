const coapPacket = require('coap-packet');

let nexts = [{
    id: 'thread/tlv',
}];

class Parser
{
    constructor() {
        this.id = 'CoAP';
        this.payload = 'payload';
        this.nexts = nexts;
    }

    parse(buf, packet) {
        let p = coapPacket.parse(buf);
        return {
            header: {
                code: p.code,
                type: p.confirmable && 'CON' || p.reset && 'RST' || p.ack && 'ACK' || 'NON',
                messageId: p.messageId,
                token: p.token.toString('hex'),
                options: p.options,
            },
            payload: p.payload
        };
    }
}

let defaultParser = new Parser();

exports.parse = function(buf, packet) {
    return defaultParser.parse(buf, packet);
}
exports.nexts = nexts;
exports.payload = 'payload';
