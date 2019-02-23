import * as _ from 'lodash';

import * as array from './array';
import * as math from './math';

function compareIndexEdges(a: [number, number], b: [number, number]): number {
  const d = a[0] - b[0];
  if (d !== 0) {
    return d;
  }
  return a[1] - b[1];
}

export function filter(
  dict: number[][],
  triangleIndices: number[],
  epsilon = math.defaultEpsilon,
): number[] {
  const chunkedTris = _.chunk(triangleIndices, 3);
  const chunkedEdges = chunkedTris.map(vertIds => {
    return [
      [vertIds[0], vertIds[1]].sort((a, b) => a - b),
      [vertIds[1], vertIds[2]].sort((a, b) => a - b),
      [vertIds[2], vertIds[0]].sort((a, b) => a - b),
    ];
  });
  const normals = chunkedTris.map(vertIds => {
    const verts = vertIds.map(id => dict[id]);
    return math.normalize(math.triangleNormal(verts));
  });

  // Group edge sets by normal
  const groups: { normal: number[]; edges: number[][] }[] = [];
  for (let i = 0; i < chunkedTris.length; i += 1) {
    const edges = chunkedEdges[i];
    const normal = normals[i];
    const groupId = array.search(groups, group =>
      math.compare3(normal, group.normal, epsilon),
    );
    if (groupId < 0) {
      array.pushSorted(
        groups,
        {
          normal,
          edges,
        },
        (a, b) => math.compare3(a.normal, b.normal, epsilon),
      );
    } else {
      groups[groupId].edges.push(...edges);
    }
  }

  const withoutDupes = [];
  for (const group of groups) {
    const noDupes = array.removeDupes(group.edges, (a, b) => {
      return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
    });
    withoutDupes.push(...noDupes);
  }

  const sorted = withoutDupes.sort(compareIndexEdges);
  const deduped = array.uniqSorted(sorted, compareIndexEdges);
  return _.flatten(deduped);
}
