import * as _ from 'lodash'; // tslint:disable-line

import * as array from './array';
import * as binaryParser from 'binary-parser';
import * as edgeFilter from './edge_filter';
import * as math from './math';
import { Mesh } from './mesh';
import * as transform from './transform';

enum State {
  Start,
  Solid,
  Facet,
  Loop,
  FullLoop,
  FullFacet,
  FullSolid,
}

function isWhitespace(c: number): boolean {
  switch (c) {
    case 9: // tab
    case 10: // line feed
    case 11: // vtab
    case 12: // form feed
    case 13: // cr
    case 32: // space
      return true;

    default:
      return false;
  }
}

export function isAscii(buf: Buffer): boolean {
  let i = 0;
  while (i < buf.length) {
    if (!isWhitespace(buf[i])) {
      break;
    }
    i += 1;
  }

  return buf.slice(i, i + 'solid'.length).toString() === 'solid';
}

export function parseAscii(buf: Buffer): number[][] {
  let state = State.Start;
  let facet: number[] = [];
  const triangles: number[][] = [];

  buf
    .toString()
    .split(/\r?\n/)
    .forEach(raw => {
      const line = raw.trim();
      if (line.length === 0) {
        return;
      }

      switch (state) {
        case State.Start:
          if (_.startsWith(line, 'solid')) {
            state = State.Solid;
            break;
          }

          throw new Error(`expecting "solid", got: ${line}`);

        case State.Solid:
          if (_.startsWith(line, 'facet')) {
            state = State.Facet;
            break;
          }

          if (line === 'endsolid') {
            state = State.FullSolid;
            break;
          }

          throw new Error(`expecting "facet" or "endsolid", got: ${line}`);

        case State.Facet:
          if (line === 'outer loop') {
            state = State.Loop;
            break;
          }

          throw new Error(`expecting "outer loop", got: ${line}`);

        case State.Loop:
          if (_.startsWith(line, 'vertex')) {
            const toks = line.split(/\s+/);
            if (toks.length !== 4) {
              throw new Error(`invalid vertex: ${line}`);
            }

            facet.push(
              parseFloat(toks[1]),
              parseFloat(toks[2]),
              parseFloat(toks[3]),
            );

            if (facet.length === 3 * 3) {
              state = State.FullLoop;
            }

            break;
          }

          throw new Error(`expecting "vertex", got: ${line}`);

        case State.FullLoop:
          if (line === 'endloop') {
            state = State.FullFacet;
            break;
          }

          throw new Error(`expecting "endloop", got: ${line}`);

        case State.FullFacet:
          if (line === 'endfacet') {
            state = State.Solid;
            triangles.push(facet);
            facet = [];
            break;
          }

          throw new Error(`expecting "endfacet", got: ${line}`);

        case State.FullSolid:
          throw new Error(`unexpected content after endsolid: ${line}`);
      }
    });

  return triangles;
}

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

export function parse(buf: Buffer): number[][] {
  return isAscii(buf) ? parseAscii(buf) : parseBinary(buf);
}

export interface ConvertOpts {
  epsilon?: number;
  scale?: number;
}

export function convert(tris: number[][], opts: ConvertOpts = {}): Mesh {
  const epsilon = opts.epsilon || math.defaultEpsilon;
  const scale = opts.scale || 1;

  const chunked = _.chunk(_.flatten(tris), 3);
  const dict = array.makeDict(chunked, (a, b) => math.compare3(a, b, epsilon));

  const flattenedDict = _.flatten(dict);
  const centered = transform.center(flattenedDict);
  const vertices = transform.scale(centered, scale, scale, scale);

  const triangleIndices = chunked.map(v =>
    array.search(dict, vert => math.compare3(v, vert, epsilon)),
  );
  const lineIndices = edgeFilter.filter(dict, triangleIndices);

  return { vertices, triangleIndices, lineIndices };
}
