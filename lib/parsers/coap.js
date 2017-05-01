const coapPacket = require('coap-packet');

const kUriPath = 'Uri-Path';

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

        let options = new Map();
        if (p.options) {
            for (let opt of p.options) {
                if (options.has(opt.name)) {
                    options.get(opt.name).push(opt.value);
                } else {
                    options.set(opt.name, [opt.value]);
                }
            }
        }

        // uri-path
        if (options.has(kUriPath)) {
            let uriPath = options.get(kUriPath);
            options.set(kUriPath, uriPath.map(it => it.toString()).join('/'));
        }

        return {
            header: {
                code: p.code,
                type: p.confirmable && 'CON' || p.reset && 'RST' || p.ack && 'ACK' || 'NON',
                messageId: p.messageId,
                token: p.token,
                options: options,
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
exports.name = 'CoAP';
