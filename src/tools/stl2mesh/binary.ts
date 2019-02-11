import * as binaryParser from 'binary-parser';

export function parseBinary(buf: Buffer): number[][] {
  const parser = new binaryParser.Parser()
    .array('header', { type: 'uint8', length: 80 })
    .uint32le('size')
    .array('triangles', {
      type: new binaryParser.Parser()
        .array('normal', { type: 'floatle', length: 3 })
        .array('vertices', { type: 'floatle', length: 9 })
        .uint16le('attrib'),
      length: 'size',
    });

  return parser.parse(buf).triangles.map(tri => tri.vertices);
}
