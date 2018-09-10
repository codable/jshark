/**
 * This class implements the deep parser
 */
class Shark {
  /**
   * Initialize a shark.
   */
  constructor() {
  }

  /**
   * Deeply parse the buffer.
   *
   * @param   {Object}  parser  The parser to parse with.
   * @param   {Buffer}  buf     The buffer to parse.
   * @param   {Object}  packet  The packet which generates this buffer.
   *
   * @return  {Object}  The output Packet.
   *
   */
  deepParse(parser, buf, packet) {
    let parsed = parser.parse(buf, packet);

    if (parsed instanceof Array) {
      parsed.forEach((it) => {
        it._parent = packet;
        it._parser = parser;
        let _parsed = this.parseNext(parser, it);

        if (_parsed !== undefined)
          it._parsed = _parsed;
      });
    } else if (parsed) {
      parsed._parent = packet;
      parsed._parser = parser;
      let _parsed = this.parseNext(parser, parsed);

      if (_parsed !== undefined)
        parsed._parsed = _parsed;
    }

    return parsed;
  }

  /**
   * Call the next parse the parse the payload.
   *
   * @param   {Object}  parser  The parser to parse with.
   * @param   {parsed}  parsed  The parsed output of the current stack.
   *
   * @return  {Object}  The parsed output of next stack.
   *
   */
  parseNext(parser, parsed) {
    if (!parser.nexts)
      return;

    let next = this.findNext(parser, parsed);

    if (!next)
      return;

    let nextParser = require(`./parsers/${next}`);
    let payload = parser.getNextPayload ? parser.getNextPayload(parsed) : parsed[parser.payload || 'payload'];
    return this.deepParse(nextParser, payload, parsed);
  }

  /**
   * Find the next parse based on the context.
   *
   * @param   {Object}  parser  The parser to parse with.
   * @param   {parsed}  parsed  The parsed output of the current stack.
   *
   * @return  {Object|null}     The next parser for the next stack.
   *
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

/**
 * Parse the buffer with the given type of parser.
 *
 * @param   {Buffer}  buf   The buffer to parse.
 * @param   {String}  type  The parser id.
 *
 * @return  {Object}  Parsed data.
 */
function parse(buf, type) {
  let parser = require(`./parsers/${type}`);
  return shark.deepParse(parser, buf, {});
}

/**
 * Format parsed data by default style.
 *
 * @param   {Object}        parsed  The parsed data.
 * @param   {string}        indent  The string used to indent.
 * @param   {Array<string>} output  The array used to store the output.
 */
function defaultToString(parsed, indent, output) {
  if (parsed instanceof Array) {
    for (let p of parsed) {
      defaultToString(p, indent, output);
    }
    return;
  }

  if (parsed._parser) {
    output.push(`${indent}[${parsed._parser.name}]`);
  }

  for (let prop of Object.keys(parsed)) {
    if (prop === '_parsed') continue;
    if (prop === '_parser') continue;
    if (prop === '_parent') continue;

    let value = parsed[prop];
    if (value instanceof Buffer) {
      let str = value.toString('hex');
      output.push(`${indent}${prop}: 0x${str}`);
    } else if (value instanceof Array) {
      str = value.join(' ');
      output.push(`${indent}${prop}: ${str}`);
    } else if (value instanceof Object ||
      value instanceof Map) {
      output.push(`${indent}${prop}:`);
      defaultToString(value, indent + '  ', output);
    } else {
      output.push(`${indent}${prop}: ${value}`);
    }
  }

  if (parsed._parsed) {
    defaultToString(parsed._parsed, indent + '  ', output);
  }
}

/**
 * Format parsed data.
 *
 * @param   {Object}  parsed  The parsed data.
 *
 * @return  {string}  The formatted string.
 */
function format(parsed) {
  let output = [];
  defaultToString(parsed, '', output);
  return output.join('\n');
}

exports.parse = parse;
exports.format = format;
