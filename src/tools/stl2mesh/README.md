# Wireframe mesh format

This format represents meshes that are rendered as wireframe outlines.

Each mesh is a structure with three properties:

- `vertices`: a flat array of numbers indicating vertex coordinates, e.g. `[x0, y0, z0, x0, y0, z0, ...]`
- `triangleIndices`: a flat array of indices into `vertices`, indicating triangles, e.g. `[t0v0, t0v1, t0v2, t1v0, t1v1, v1v0, ...]`
- `lineIndices`: a flat array of indices into `vertices`, indicating line edges, e.g. `[e0v1, e0v2, e1v0, e1v2, ...]`

This is an optimized, denormalized format over a raw list of triangles. `vertices` and `triangleIndices` are derivable from triangle lists like those found in `stl` files. `lineIndices` is derivable from `triangleIndices` and `vertices`, under the assumption that interior edges of faces should be removed.

The algorithm for interior edge removal is as follows:

```
func removeInteriorEdges(triangles)
  edgesByNormal = {}
  foreach t in triangles
    if edgesByNormal[normal(t)] is empty
      edgesByNormal[normal(t)] = []
    edgesByNormal[normal(t)] += edges(t)

  allEdges = []
  foreach (planeNormal, coplanarEdges) in edgesByNormal
    foreach e in coplanarEdges
      if countInstances(coplanarEdges, e) < 2
        allEdges += e

  return uniq(allEdges)
```
