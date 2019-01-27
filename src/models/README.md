# Model format

This format represents models that are rendered as wireframe outlines.

A **models** is an array of **faces**.

A **face** is an array of numbers. Every three values represents a single **vertex** in 3D space.

The vertices on a face should be chosen and ordered so they render properly in the following modes:

- `LINE_LOOP`, for an outline of the entire face
- `TRIANGLE_FAN`, for an opaque area (for depth buffering)
