'use strict';

var isObject = require('lodash/isObject');

var PcRequest = require('./private/pc-request.js');

/**
 * @class
 * @classdesc Fetches an array of datasources from PC.
 * @alias datasources
 */
module.exports = class Datasources {
  /**
   * Initialises datasources and makes a request to PC server fetching datasource data. Chainable.
   * @constructor
   * @returns {this}
   */
  constructor() {
    this.request = new PcRequest("metadata/datasources", false);
    this.data = this.fetch();
  }

  /**
   * Makes a fetch request to PC requesting data sources. If called after class initialization, purges existing data source cache and makes a call to PC to re-fetch data sources.
   * @method datasources#fetch
   * @returns {Promise<object>} - Returns promise containing either the data source array or null if data source is not available
   */
  fetch() {
    var dataPromise = this.request.fetch().then((response) => {
      var output = {};
      if (isObject(response)) {
        response
          .filter(source => source.notPathwayData == false)
          .map((ds) => {
            var name = (ds.name.length > 1) ? ds.name[1] : ds.name[0];
            output[ds.uri] = {
              id: ds.identifier,
              uri: ds.uri,
              name: name,
              description: ds.description,
              type: ds.type,
              iconUrl: ds.iconUrl
            };
          });
      } else {
        output = null;
      }
      return output;
    }).catch(() => {
      return null;
    });

    this.data = dataPromise;
    return dataPromise;
  }

  /**
   * Returns promise containing data sources from PC.
   * @method datasources#get
   * @returns {Promise<object>} - Returns cached promise from the fetch method
   */
  get(callback) {
    return this.data;
  }

  /**
   * Fetches the logo for the datasource using either datasources URI or name. Intended to be used to generate image tags for thumbnails.
   * @method datasources#lookupIcon
   * @param {string} dsUriOrName - Either URI or name of the data source
   * @return {Promise<string>} logoUrl - Promise containing URL of datasource in question, else undefined if datasource not found
   */
  lookupIcon(dsUriOrName) {
    dsUriOrName = dsUriOrName || "";
    return this.data.then((dataSources) => {
      for (var key in dataSources) {
        var ds = dataSources[key];
        if (ds.uri == dsUriOrName || ds.name.toLowerCase() == dsUriOrName.toLowerCase()) {
          return ds.iconUrl;
        }
      }
    });
  }
}
