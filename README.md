# MMM-TheEnergyDetective
Magic Mirror Module to display [The Energy Detective (TED)](https://theenergydetective.com/) energy data.

The module supports different panes:

**Pane "summary"**
<img src="https://user-images.githubusercontent.com/17531356/50731541-c4d06f80-1124-11e9-9243-10ae33d2f33d.png" width="90%"></img>

**Pane "dashboard"**
<img src="https://user-images.githubusercontent.com/17531356/50731544-c5690600-1124-11e9-93fa-d82c8abed926.png" width="90%"></img> 

**Pane "spyder-htol"**
<img src="https://user-images.githubusercontent.com/17531356/50731540-c4d06f80-1124-11e9-95df-47835ff828f3.png" width="90%"></img>

**Pane "spyder-atoz"**
<img src="https://user-images.githubusercontent.com/17531356/50731542-c5690600-1124-11e9-80b9-583940aef7b9.png" width="90%"></img>

**Pane "solar-now"**
<img src="https://user-images.githubusercontent.com/17531356/50731543-c5690600-1124-11e9-9a94-1c6134601b24.png" width="90%"></img>

## Installation

To perform the following steps, first open a terminal window.

### Install Dependencies
The module relies on the .Net application 'TedMonitor.exe' (provided in the `native` directory) to obtain the data from the TED ECC. You'll need [Mono](https://www.mono-project.com/) on your system if you're not running Windows.

On Raspbian, run
````
sudo apt-get install mono-complete
````
This will install a working mono runtime for you.


### Obtain the Module
In terminal, go to your MagicMirror's modules folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/pdb0102/MMM-TheEnergyDetective.git
````

### Configure the TED Monitor to be started automatically
The monitor needs to be running for the module to have current data. You should start the monitor as part of your system startup (or on Windows, it can be configured to run as a service)

On Raspbian, you can do this by first editing the `TedMonitor.service` file and setting (at a minimum) the hostname or IP address of your ECC.

````
nano ~/MagicMirror/modules/MMM-TheEnergyDetective/native/TedMonitor.service
````
Look for the `/h=&lt;your ecc address&gt;` part and replace the bracketed part with your ECC's address or dns name.

**Command-line options for TedMonitor:**

|Option|Description|
|------|-----------|
|/h=&lt;hostname&gt;|The hostname or IP address of your TED ECC|
|/i=&lt;refresh-int&gt;|The interval, in seconds, to wait between refreshing TED data and updating output files|
|/o=&lt;out-dir&gt;|The directory the output files are written to|
|/f=&lt;fade-start&gt;|If specified, the percentage at which spyder list should fade to black. If not specified, no fade is applied.|
|/s=&lt;max_solar_w&gt;|The maximum output, in watts, of the solar/generation system, if a Generation MTU is exists in the system. Required to generate the 'solar-now' output|
|/d|Enable debug output|

Next, copy the `TedMonitor.service` file to your systemd directory and configure `systemd` to start it automatically.
````
sudo cp ~/MagicMirror/modules/MMM-TheEnergyDetective/native/TedMonitor.service /etc/systemd/system
sudo systemctl enable TedMonitor
sudo systemctl start TedMonitor
````

### Configure MagicMirror to display your module 

Configure the module in your `config.js` file:
````javascript
{
    module: "MMM-TheEnergyDetective",
    position: "bottom_left",
    config: {	// See 'Configuration options' for more information
        panels: ["dashboard","summary","dashboard","spyder-htol"],
        tedDataDirectory: "data",
        updateInterval: 10000,
        fadeSpeed: 0,
    }
}
		
````

## Configuration options
|Option|Description|
|---|---|
|`panels`|Can be one or more of the following values: `spyder-htol`, `spyder-atoz`, `dashboard`, `summary` and `solar-now`. If more than one panel is specified, the module will cycle through all of them in the given order.<BR>(see Panel Description below)|
|`tedDataDirectory`|Points to the directory used by `TedMonitor` to output the data files.|
|`updateInterval`|The time, in ms, to wait before refreshing the displayed data, and, if more than one panel is displayed, before switching to the next panel in the list.|
|`fadeSpeed`|The time, in ms, for a fade out/fade in between panels and/or refreshed data|

|Panel|Description|
|---|---|
|spyder-htol|Lists *Present* and *Today* values for all Spyder groups, sorted from highest to lowest *Present* value. Ignores any group with no data for *Today*
|spyder-atoz|Lists *Present* and *Today* values for all Spyder groups, sorted alphabetically by group name. Ignores any group with no data for *Today*
|solar-now|Generates a CSS dial showing the current output of the 'Generation MTU'.<BR>**Requires /s= parameter to be specified for `TedMonitor`**
|dashboard|Generates 'Energy Overview' of all MTUs in the system.|
|summary|Generates 'Energy Summary' table showing *Present*, *Today*, *This Month* and *Projected* kWh values from the ECC|

The module can be configured more than once in your MagicMirror `config.js` file. For example, to display the current solar production permanently in the top center, and to alternatingly display the MTU summary and Spyder data sorted by consumption in the bottom left, you could use the following:
````javascript
{
	module: "MMM-TheEnergyDetective",
	position: "top_center",
	config: {
		panels: ["solar-now"],
		tedDataDirectory: "data",
		updateInterval: 5000,
		fadeSpeed: 0,
	}
},
{
	module: "MMM-TheEnergyDetective",
	position: "bottom_left",
	config: {
		panels: ["dashboard", "spyder-htol"],
		tedDataDirectory: "data",
		updateInterval: 10000,
		fadeSpeed: 500,
	}
}
````

## Dependencies
* [Mono](https://www.mono-project.com/) (installed via `apt-get install mono-complete`)
