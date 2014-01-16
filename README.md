TM2 (development)
-----------------
Experimental version of TileMill powered by vector tiles. There are currently no supported releases of this software.

[![Build Status](https://secure.travis-ci.org/mapbox/tm2.png)](http://travis-ci.org/mapbox/tm2)


### What are vector tiles?

Vector tiles are the vector data equivalent of image tiles for web mapping. They apply the strengths of tiling -- developed for caching, scaling and serving map imagery rapidly -- to vector data. Consider an image tile at the zxy coordinate 14/4823/6160. This image is a PNG that depicts the corner of lower Manhattan with roads, building footprints, and parks:

    http://a.tiles.mapbox.com/v3/examples.map-zr0njcqy/14/4823/6160.png

A vector tile at 14/4823/6160 would contain all the corresponding geometries and metadata -- like road names, area types, building heights -- in a compact, parsable format. Vector tiles are a highly performant format that provide greater flexibility in terms of styling, output format, and interactivity.

                   +----------+   +----------+
                   |          |   |          |
                   |  vector  |   | cartocss |
                   |   tile   +-+-+  styles  |
                   |          | | |          |
                   +----------+ | +----------+
                                v
                         +-------------+
                         |             |
                         |  renderer   |
                         |             |
                         +------+------+
                                |
         +---------------+------+------+---------------+
         |               |             |               |
    +----v-----+   +-----v----+   +----v-----+   +-----v----+
    |          |   |          |   |          |   |          |
    | geojson  |   | png tile |   | utf tile |   |  ??????  |
    |          |   |          |   |          |   |          |
    +----------+   +----------+   +----------+   +----------+


Vector tiles are designed to use the same tiling and coordinate scheme used by image tiles and take full advantage of HTTP. CDN caching, high scalability and efficient distribution make vector tiles a much more attractive solution than running, say, a enormous cluster of database and application servers that respond to queries on demand.

Here are some rough details of our implementation at time of writing:

- Vector tiles are [Protocol Buffers](http://code.google.com/p/protobuf/), a compact binary format for transferring messages.
- Vector tiles store a serialized version of the internal data that [Mapnik](http://mapnik.org/) uses when rendering maps.
- Vector tiles are organized into layers (e.g. roads, water, areas), which contain individual features each with a geometry and variable number of attributes per layer(e.g. name, type, etc.).

### TM2 architecture

TM2 ships with an example vector tile source: MapBox Streets. When you create your first project you will have full access to style curated data from OpenStreetMap without setting up PostGIS, downloading and importing a large planet database file, or any of the other steps usually taken to work with OpenStreetMap data. If you have been working on styles for streets in London and want to check how well your styles apply to data in Paris, TM2 will download the vector tiles on-the-fly as you pan over to France. TM2 caches downloaded vector tiles to an MBTiles database on disk so that you can take your work offline in a limited fashion.

Unlike TileMill, TM2 makes a hard split between two types of packages:

- **Styles** contain stylesheets, basic thin metadata (name, description, attribution, etc.), and a *reference* to a datasource.
- **Sources** describe a source for vector tiles, for example a URL endpoint from which to download tiles. We also have an API for generating vector tiles on the fly from traditional Mapnik datasources (shapefiles, postgis, etc) -- see [tilelive-bridge](http://github.com/mapbox/tilelive-bridge) for more info.

TM2 focuses on editing **Styles,** but there is also an early UI for working with **Sources**.

Building TM2
------------

Dependencies are:

 - Mapnik v2.2.0
 - Node.js v0.8.x or v0.10.x
 - Protobuf compiler and libprotobuf-lite

### Mac OS X

### Binary

Bleeding edge binary builds are available for OS X at <http://tilemill.s3.amazonaws.com/index.html?path=dev/>.
Follow the instructions below to install from source if you are interested in developing on TM2.

### Source install

First update your homebrew to ensure that the recently released Mapnik v2.2.0 is available:

    brew update

Then install/upgrade mapnik, node, and libprotobuf with homebrew:

    brew install mapnik || brew upgrade mapnik
    brew install node || brew upgrade node
    brew install protobuf || brew upgrade protobuf

Note: you can also install node via the easy installer available at <http://nodejs.org/download>.

Finally install and run TileMill 2:

    git clone https://github.com/mapbox/tm2.git
    cd tm2
    npm install
    node index.js

### Ubuntu Linux

Warning: TM2 depends on a Mapnik version that is not compatible with the existing Mapnik that will have been installed by the TileMill 0.10.x package. It is not recommended to try to run both TileMill and TM2 on the same linux machine.

    sudo apt-get install python-software-properties
    echo 'Yes' | sudo apt-add-repository ppa:chris-lea/node.js
    echo 'Yes' | sudo add-apt-repository ppa:mapnik/v2.2.0
    sudo apt-get update -y
    sudo apt-get install -y nodejs protobuf-compiler libprotobuf-lite7 libprotobuf-dev libmapnik libmapnik-dev make

    git clone https://github.com/mapbox/tm2.git
    cd tm2
    npm install
    node index.js

Creating a style with TM2
-------------------------

### Organization of a style project

A valid TM2 project is a folder that contains at minimum a valid `project.yml` file and at least one CartoCSS `.mss` file that is referenced by the YML file. The folder should also contain any images that are directly referenced by the style as patterns, icons, etc.

If you have any source files (Photoshop/Gimp/Illustrator/Inkscape documents, mockups, reference files, etc) that are not directly required to render the style, they should be named beginning with an underscore or kept in a subdirectory beginning with an underscore. TM2 will ignore such files & folders when creating packages to deploy for rendering.

### Generating a style package

TM2 styles are packaged into 'tm2z' files for deployment to a rendering server. The package contains:

- `project.xml` - the Mapnik-ready XML style definition automatically built by TM2 from the project's CartoCSS files and project.yml
- no MSS files
- any additional files or folders that were added to the TM2 project folder, except any beginning with `_`

<!-- TODO:
Creating a source with TM2
--------------------------
-->
