/* 
 * MMM-TheEnergyDetective - Magic Mirror Module
 * Displays "The Energy Detective" electricity monitor information 
 * see: https://www.theenergydetective.com
 *
 * Author: Peter Dennis Bartok https://github.com/pdb0102
 *
 * MIT License
 */

Module.register("MMM-TheEnergyDetective", {
	defaults: {
		fadeSpeed: 2000,			// fade speed for cycling between panels
		panels: [					// panel names to display, in desired order
			"dashboard",
			"solar-now",
			"spyder-htol",
			"summary"
		],
		tedDataDirectory: "data",	// location of the TED data files
		updateInterval: 10 * 1000,	// update interval for the backend to load new TED data
	},

	getScripts: function() {
		return ["ted.css"];
	},

	getTranslations: function() {
		return false;
	},

	start: function() {
		var self = this;

		Log.info("Starting module: " + this.name);
		this.loaded = false;
		this.tedPanels = [];
		this.activePanel = 0;
		this.registerTedService();
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "TED_DATA") {
			this.tedPanels = payload;
		} else if (notification === "TED_ERROR") {
			Log.error(this.name + " received an error: " + JSON.stringify(payload, null, 2));
			this.tedPanels = [{
				name: "Error",
				data: "Failed to load TED data: " + payload.error.path + "; error: " + payload.error.code
			}];
		}
		if (!this.loaded) {
			this.scheduleUpdateInterval();
		}
		this.loaded = true;
	},

	scheduleUpdateInterval: function() {
		var self = this;

		self.updateDom(self.config.fadeSpeed);

		timer = setInterval(function() {
			self.activePanel++;
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	createElementFromHTML: function(html) {
		var div = document.createElement('div');
		div.innerHTML = html.trim();
		return div.firstChild;
	},

	getDom: function() {
		if (this.activePanel >= this.config.panels.length) {
			this.activePanel = 0;
		}

		// Handle errors
		if (this.tedPanels.length <= 1) {
			if (this.tedPanels.length == 0) {
				return this.createElementFromHTML("<div></div>");
			}
			if (this.tedPanels[0].name === "Error") {
				return this.createElementFromHTML(this.tedPanels[0].data);
			}
		}

		// find our panel
		for (i = 0; i < this.tedPanels.length; i++) {
			if (this.tedPanels[i].name === this.config.panels[this.activePanel]) {
				return this.createElementFromHTML(this.tedPanels[i].data);
			}
		}

		// Handle non-existent panels
		return this.createElementFromHTML("<div class=\"bright\">Panel " + this.config.panels[this.activePanel] + " not provided by TED monitor</div>");
	},

	registerTedService: function() {
		this.sendSocketNotification("TED_DATA_DIRECTORY", {
			tedDataDirectory: this.file(this.config.tedDataDirectory),
			updateInterval: this.config.updateInterval
		});
	},
});
