#!/usr/bin/env node

var CSScomb = require('../ScriptLibraries/node_modules/csscomb');

// Use current project's root folder as a starting point.
// If no project is active, use current folder as a fallback:
var configpath = process.env.EDITOR_PROJECT_PATH || process.env.EDITOR_DIRECTORY_PATH;

// Search for custom config file recursively up to the home folder:
configpath = CSScomb.getCustomConfigPath(configpath + '/.csscomb.json');

var message;

if (configpath !== null) {
	// Config file found:
	message = 'Config file found:\n';
	message += configpath + '\n\n';
} else {
	// Error, no config file found:
	message = 'No config file found.\n\n';
	message += 'CSScomb first looks for a config file called ".csscomb.json" in your project\'s root folder, and then in parent folders up to your home folder.\n\n';
}

message += 'See csscomb.com for available config options.';

process.stderr.write(message);
process.exit();
