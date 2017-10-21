#!/usr/bin/env node

var yargs = require('../ScriptLibraries/node_modules/yargs');
var CSScomb = require('../ScriptLibraries/node_modules/csscomb');
var spawn = require('child_process').spawn;
var fs = require('fs');

var comb = new CSScomb();

var argv = yargs
	.option('input', {
		alias: 'i',
		describe: 'The string of CSS to comb',
		type: 'string'
	})
	.option('processFile', {
		alias: 'f',
		describe: 'Process entire editorPath file',
		default: 'false',
		type: 'boolean'
	})
	.option('action', {
		alias: 'a',
		describe: 'Action to take',
		choices: ['comb', 'beautify', 'sort'],
		default: 'comb',
		type: 'string'
	})
	.option('tabString', {
		alias: 't',
		describe: 'The string to use for indentation',
		type: 'string'
	})
	.option('lineEndingString', {
		alias: 'l',
		describe: 'The string to use for line endings',
		type: 'string'
	})
	.option('editorPath', {
		alias: 'p',
		describe: 'The absolute path to the current file',
		type: 'string'
	})
	.option('editorDirectoryPath', {
		alias: 'd',
		describe: 'The absolute path to the current file\'s parent directory',
		type: 'string'
	})
	.option('editorProjectPath', {
		alias: 'r',
		describe: 'The absolute path to the project root directory',
		type: 'string'
	})
	.help('h')
	.alias('v', 'version')
	.alias('h', 'help')
	.argv;

var selection = argv.input || process.env.EDITOR_SELECTION;
var action = argv.action;
var tabString = argv.tabString || process.env.EDITOR_TAB_STRING || '\t';
var lineEndingString = argv.lineEndingString || process.env.EDITOR_LINE_ENDING_STRING || '\n';

// The absolute path to the file
var editorPath = argv.editorPath || process.env.EDITOR_PATH;

// The absolute path to the file's parent directory
var editorDirectoryPath = argv.editorDirectoryPath || process.env.EDITOR_DIRECTORY_PATH;

// The absolute path to the file's parent directory
var editorProjectPath = argv.editorProjectPath || process.env.EDITOR_PROJECT_PATH;

// Get configuration settings primarily from custom config file, secondarily from default config:
function getConfig() {
	var config = {};
	
	// Use current project's root folder as a starting point.
	// If no project is active, use current folder as a fallback:
	var configpath = editorProjectPath || editorDirectoryPath;
	
	// Search for custom config file recursively up to the home folder:
	configpath = CSScomb.getCustomConfigPath(configpath + '/.csscomb.json');
	
	try {
		// Try to load config file:
		config = require(configpath);
	} catch (error) {
		// If no config file is available, use default config:
		config = getDefaultConfig();
	}
	
	if (action == 'beautify') {
		// Remove sort order configuration:
		delete config['sort-order'];
	}
	
	if (action == 'sort') {
		// Keep only sort order configuration:
		var configSortOrder = config['sort-order'];
		config = {};
		config['sort-order'] = configSortOrder;
	}
	
	return config;
}

// Default configuration with 'zen' ordering and Espresso style markup:
function getDefaultConfig() {
	var config = {};
	
	var configZen = CSScomb.getConfig('zen');
	
	// Copy only sort-order data:
	config['sort-order'] = configZen['sort-order'];
	
	// If sort-order is separated into sections, add an empty section at top:
	if (config['sort-order'].length > 1) {
		config['sort-order'].unshift([]);
	}
	
	// Add sort-order info for SCSS, Sass and Less functions into the first section:
	config['sort-order'][0].unshift('$variable', '$include', '$import');
	
	// Add configuration that mimics most of the settings from Espresso:
	config['block-indent']                    = tabString;
	config['strip-spaces']                    = true;
	config['always-semicolon']                = true;
	config['vendor-prefix-align']             = true;
	config['unitless-zero']                   = true;
	config['leading-zero']                    = true;
	config['quotes']                          = 'double';
	config['color-case']                      = 'lower';
	config['color-shorthand']                 = false;
	config['space-before-colon']              = '';
	config['space-after-colon']               = ' ';
	config['space-before-combinator']         = ' ';
	config['space-after-combinator']          = ' ';
	config['space-before-opening-brace']      = ' ';
	config['space-after-opening-brace']       = lineEndingString;
	config['space-before-closing-brace']      = lineEndingString;
	config['space-before-selector-delimiter'] = '';
	config['space-after-selector-delimiter']  = lineEndingString;
	config['space-between-declarations']      = lineEndingString;
	
	return config;
}

// Get file type extension:
function getSyntax() {
	var filename = editorPath || '.css';
	var extension = filename.substr(filename.lastIndexOf('.') + 1);
	if ((extension == 'css') || (extension == 'scss') || (extension == 'sass') || (extension == 'less')) {
		return extension;
	} else {
		return 'css';
	}
}

// Apply configuration:
comb.configure(getConfig());

if (argv.processFile) {
	fs.readFile(editorPath, { encoding: 'utf8' }, function(err, data) {
		if (err && err.path) {
			errorDialog('Error: no such file or directory\n\n' + err.path);
			return;
		} else if (err) {
			errorDialog(err);
			return;
		}
		processCSS(data);
	});
} else {
	processCSS(selection);
}

function processCSS(string) {
	var combedCSS = comb.processString(string, { 'syntax': getSyntax() });

	combedCSS.then(function(result) {

		console.log(result);

	}, function(err) {
		errorDialog(err.toString());

		// Return selected CSS
		console.log(string);
	});
}

function escapeForShell(message) {
	return message.replace(/"/g, '\\"');
}

function errorDialog(err) {
	var osascript = spawn(
		'osascript',
		['-e', "tell application \"Espresso\" to display dialog \"" + escapeForShell(err) + "\" buttons \"OK\" default button 1 with title \"CSScomb\" with icon caution"],
		{
			detached: true,
			stdio: 'ignore'
		}
	);

	osascript.unref();
}
