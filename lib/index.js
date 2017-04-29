/**
 * This class implements the deep parser
 */
class Shark {
  /**
   * The constructor to initialize a shark.
   */
  constructor() {
  }

  /**
   * This method deeply parse the buffer.
   *
   * @param[in]   buf     The buffer to parse.
   * @param[in]   packet  The packet which generates this buffer.
   *
   * @returns The output Packet.
   *
   */
  deepParse(parser, buf, packet) {
    let parsed = parser.parse(buf, packet);

    if (parser.nexts) {
      if (parsed instanceof Array) {
        parsed.forEach(it => {
          it._parent = packet;
          it._parsed = this.parseNext(parser, it);
        });
      } else {
        parsed._parent = packet;
        parsed._parsed = this.parseNext(parser, parsed);
      }
    }

    return parsed;
  }

  /**
   * This method calls the next parse the parse the payload.
   */
  parseNext(parser, parsed) {
    let next = this.findNext(parser, parsed);

    if (!next)
      return null;

    let nextParser = require(`./parsers/${next}`);
    return this.deepParse(nextParser, parsed[parser.payload], parsed);
  }

  /**
   * This method finds the next parse based on the context.
   */
  findNext(parser, parsed) {
    for (let next of parser.nexts) {
      if (!next.match || next.match(parsed))
        return next.id;
    }

    return null;
  }
};

let shark = new Shark();
function parse(buf, type)
{
  let parser = require(`./parsers/${type}`);
  return shark.deepParse(parser, buf, {});
}

exports.parse = parse;
