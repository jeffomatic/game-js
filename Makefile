mesh_sample_names = $(shell find src/tools/stl2mesh/samples -name '*.stl' | xargs -n1 basename -s .stl)

.PHONY: default devserver test

default: devserver

devserver:
	parcel index.html

test:
	npx jest src/

$(mesh_sample_names):
	npx ts-node src/tools/stl2mesh -v src/tools/stl2mesh/samples/$@.stl > src/meshes/$@.json5
