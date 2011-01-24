// TODO: eliminate these includes, blegh
var settings = {},
    Map = require('./map'),
    Format = require('./format'),
    SphericalMercator = require('./sphericalmercator');

/**
 * TileLive Tile object definition
 */

/**
 * Tile constructor
 *
 * @param {String} scheme (xyz|tms|tile (tms)).
 * @param {String} mapfile base64-encoded mapfile.
 * @param {Number} z zoom level.
 * @param {Number} x latitude.
 * @param {Number} y longitude.
 * @param {String} format
 * - Tile: (png|jpg)
 * - Data Tile: (geojson)
 * - Grid Tile: (*.grid.json).
 */
function Tile(options) {
    this.map = new Map(options.mapfile, options.mapfile_dir, true,
        {width: parseInt(options.width), height: parseInt(options.height)});
    this.scheme = options.scheme;
    if (options.bbox) {
        this.bbox = options.bbox;
    }
    else if (options.xyz) {
        this.x = parseInt(options.xyz[0]);
        this.y = parseInt(options.xyz[1]);
        this.z = parseInt(options.xyz[2]);
        // TODO: make class fns
        this.sm = new SphericalMercator({ levels: this.z + 1 });
        this.bbox = this.sm.xyz_to_envelope(this.x, this.y, this.z, false);
    }
    this.format = Format.select(options.format);
}

/**
 * Generate output and invoke callback function. Defers to
 * a sub function of render
 * @param {Function} callback the function to call when
 *  data is rendered.
 */
Tile.prototype.render = function(callback) {
    var that = this;
    this.map.localize(function(err) {
        if (err) {
            callback(err);
        }
        else {
            try {
                that.format(that, callback);
            } catch (err) {
                callback(err);
            }
        }
    });
};

module.exports = Tile;