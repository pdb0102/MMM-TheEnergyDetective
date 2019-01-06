/*
 * MMM-TheEnergyDetective - Magic Mirror Module
 * TedMonitor data file loading
 *
 * Author: Peter Dennis Bartok https://github.com/pdb0102
 *
 * MIT License
 */

var fs = require("fs");
var glob = require("glob");
var Ted = function(tedDataDirectory, reloadInterval) {
	var self = this;
	var panel_names = ["dashboard","solar-now","spyder-htol","spyder-atoz","summary"];

	console.log("Starting TED data file monitor");

	if (reloadInterval < 1000) {
		reloadInterval = 1000;
	}

	var reloadTimer = null;
	var panels = [];

	var dataReceivedCallback = function() {};
	var dataFailureCallback = function() {};

	var getPanels = function() {
		var content;

		clearTimeout(reloadTimer);
		reloadTimer = null;

		panels = [];

		for (var panel in panel_names) {
			//console.log("Loading TED data file " + panel_names[panel] + ".ted");
			try {
				data = fs.readFileSync(tedDataDirectory +"/" + panel_names[panel] + ".ted", 'utf8');
			} catch (error) {
				console.log("ERROR reading data file " + error.path + "; error code: " + error.code);
				dataFailureCallback(self, error);
				scheduleTimer();
				return;
			}
			//console.log("successfully read panel " + panel_names[panel] + ":" + data);
			panels.push({
				name: panel_names[panel],
				data: data
			});
		}
		self.sendItems();
		scheduleTimer();
	};

	var scheduleTimer = function() {
		clearTimeout(reloadTimer);
		reloadTime = setTimeout(function() {
			getPanels();
		}, reloadInterval);
	};

	this.sendItems = function() {
		dataReceivedCallback(self, panels);
	};

	this.startGetPanels = function() {
		getPanels();
	};

	this.onReceive = function(callback) {
		dataReceivedCallback = callback;
	};

	this.onError = function(callback) {
		dataFailureCallback = callback;
	};

	this.tedDataDirectory = function() {
		return tedDataDirectory;
	};
};

module.exports = Ted;
