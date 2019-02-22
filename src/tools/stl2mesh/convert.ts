import * as _ from 'lodash';

import * as compress from './compress';
import * as edgeFilter from './edge_filter';
import * as math from './math';
import * as transform from './transform';

export interface Mesh {
  vertices: number[];
  triangleIndices: number[];
  lineIndices: number[];
}

export interface ConvertOpts {
  epsilon?: number;
  scale?: number;
}

export function convert(tris: number[][], opts: ConvertOpts = {}): Mesh {
  const epsilon = opts.epsilon || math.defaultEpsilon;
  const scale = opts.scale || 1;

  const chunked = _.chunk(_.flatten(tris), 3);
  const dict = compress.makeDict(chunked, (a, b) =>
    math.compare3(a, b, epsilon),
  );

  const flattenedDict = _.flatten(dict);
  const centered = transform.center(flattenedDict);
  const vertices = transform.scale(centered, scale, scale, scale);

  const triangleIndices = chunked.map(v =>
    compress.search(dict, vert => math.compare3(v, vert, epsilon)),
  );
  const lineIndices = edgeFilter.filter(dict, triangleIndices);

  return { vertices, triangleIndices, lineIndices };
}
