#!/usr/bin/env node

var CSScomb = require('../ScriptLibraries/node_modules/csscomb');
var comb = new CSScomb();

// Make sure the data is returned as strings:
process.stdin.setEncoding('utf8');

// Read data:
var input = '';
process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		input += chunk;
	}
});

// All data is read:
process.stdin.on('end', function() {
	combCSS();
});

// Parse the css:
function combCSS() {
	// Apply configuration:
	comb.configure(getConfig());
	
	// Parse css:
	try {
		var combedCSS = comb.processString(input, {'syntax': getSyntax()});
	} catch (error) {
		// On error, output original css:
		process.stdout.write(input);
		// Show error message:
		process.stderr.write(error.message);
		process.exit(1);
	}
	
	// On success, output parsed css:
	process.stdout.write(combedCSS);
	process.exit();	
}

// Get configuration settings primarily from custom config file, secondarily from default config:
function getConfig() {
	var config = {};
	
	// Use current project's root folder as a starting point.
	// If no project is active, use current folder as a fallback:
	var configpath = process.env.EDITOR_PROJECT_PATH || process.env.EDITOR_DIRECTORY_PATH;
	
	// Search for custom config file recursively up to the home folder:
	configpath = CSScomb.getCustomConfigPath(configpath + '/.csscomb.json');
	
	try {
		// Try to load config file:
		config = require(configpath);
	} catch (error) {
		// If no config file is available, use default config:
		config = getDefaultConfig();
	}
	
	if (process.env.CONFIG_ACTION == 'beautify') {
		// Remove sort order configuration:
		delete config['sort-order'];
	}
	
	if (process.env.CONFIG_ACTION == 'sort') {
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
	config['block-indent']                    = process.env.EDITOR_TAB_STRING;
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
	config['space-after-opening-brace']       = process.env.EDITOR_LINE_ENDING_STRING;
	config['space-before-closing-brace']      = process.env.EDITOR_LINE_ENDING_STRING;
	config['space-before-selector-delimiter'] = '';
	config['space-after-selector-delimiter']  = process.env.EDITOR_LINE_ENDING_STRING;
	config['space-between-declarations']      = process.env.EDITOR_LINE_ENDING_STRING;
	
	return config;
}

// Get file type extension:
function getSyntax() {
	var filename = process.env.EDITOR_FILENAME;
	var extension = filename.substr(filename.lastIndexOf('.') + 1);
	if ((extension == 'css') || (extension == 'scss') || (extension == 'sass') || (extension == 'less')) {
		return extension;
	} else {
		return 'css';
	}
}
