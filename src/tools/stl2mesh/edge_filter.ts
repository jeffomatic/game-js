import * as _ from 'lodash';

import { search } from './compress';
import * as math from './math';

function removeDupes<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length < 2) {
    return items;
  }

  const res = [];
  const sorted = items.sort(compare);

  if (compare(sorted[0], sorted[1]) !== 0) {
    res.push(sorted[0]);
  }

  for (let i = 1; i < sorted.length - 1; i += 1) {
    if (
      compare(sorted[i - 1], sorted[i]) !== 0 &&
      compare(sorted[i], sorted[i + 1]) !== 0
    ) {
      res.push(sorted[i]);
    }
  }

  if (compare(sorted[sorted.length - 2], sorted[sorted.length - 1]) !== 0) {
    res.push(sorted[sorted.length - 1]);
  }

  return res;
}

export function filter(dict: number[][], triangleIndices: number[]): number[] {
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
    return math.normalize3(math.triangleNormal(verts));
  });

  // Group edge sets by normal
  const groups: { normal: number[]; edges: number[][] }[] = [];
  for (let i = 0; i < chunkedTris.length; i += 1) {
    const edges = chunkedEdges[i];
    const normal = normals[i];
    const groupId = search(groups, group =>
      math.compare3(normal, group.normal),
    );
    if (groupId < 0) {
      groups.push({
        normal,
        edges,
      });
      groups.sort((a, b) => math.compare3(a.normal, b.normal));
    } else {
      groups[groupId].edges = groups[groupId].edges.concat(edges);
    }
  }

  const groupEdges = groups.reduce((accum, group) => {
    const noDupes = removeDupes(group.edges, (a, b) => {
      const diff = a[0] - b[0];
      if (diff !== 0) {
        return diff;
      }
      return a[1] - b[1];
    });
    return accum.concat(noDupes);
  }, []);

  return _.flatten(
    _.uniqWith(groupEdges, (a, b) => a[0] === b[0] && a[1] === b[1]),
  );
}
