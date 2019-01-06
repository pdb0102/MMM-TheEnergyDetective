/* 
 * MMM-TheEnergyDetective - Magic Mirror Module
 * Node Helper
 *
 * Author: Peter Dennis Bartok https://github.com/pdb0102
 *
 * MIT License
 */


var NodeHelper = require("node_helper");
var Ted = require("./ted.js");

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting module: " + this.name);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "TED_DATA_DIRECTORY") {
			this.startTedMonitor(payload.tedDataDirectory, payload.updateInterval);
			return;
		}
	},

	startTedMonitor(tedDataDirectory, updateInterval) {
		var self = this;
		var ted;

		ted = new Ted(tedDataDirectory, updateInterval);
		ted.onReceive(function(ted, panels) {
			self.sendTedData(panels);
		});

		ted.onError(function(ted, error) {
			self.sendSocketNotification("TED_ERROR", {
					error: error
			});
		});

		self.ted = ted;
		ted.startGetPanels();
	},

	sendTedData: function(panels) {
		this.sendSocketNotification("TED_DATA", panels);
	},
});
