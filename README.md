# CSScomb plugin for Espresso 5
This is a plugin for MacRabbit's [Espresso](http://macrabbit.com/espresso/) code editor with support for the [CSScomb](https://github.com/csscomb/csscomb.js) plugin.

This plugin is a fork of the original [CSScomb plugin for Espresso v2.1+](https://github.com/olach/espresso-csscomb) by [Ola Christensson](https://github.com/olach). It has been updated to CSScomb version 4.2.0. It no longer requires the ShellActions sugar, because it runs the shell actions through the snippet syntax capability.

## Requirements
- [Espresso v3+](http://macrabbit.com/espresso/)
- [Node.js (v6+)](http://nodejs.org/)

Note: No longer requires ShellActions.sugar

## Features
This Espresso plugin uses [CSScomb](https://github.com/csscomb/csscomb.js), a coding style formatter for CSS. Its main feature is sorting properties in a specific order. But it can also be used to beautify your style sheet.

In addition to plain CSS, the plugin also supports SCSS, Sass and Less syntax. Espresso 5 now has native support for these languages.

## Usage
Select *Text > CSScomb > Comb CSS* or choose from the *Actions* dropdown to beautify your style sheet and sort properties. If you don't want to affect the entire style sheet, you can make one or several text selections before performing the action.

It's also possible to only beautify the style sheet without affecting the sort order (and vice versa).

## Custom configuration
This plugin uses a custom made configuration that mimics the way Espresso writes CSS. It also honors your Espresso settings regarding tabs and line endings. The properties sort order is using CSScomb's [zen ordering](https://github.com/csscomb/csscomb.js/blob/master/config/zen.json) style.

To use your own custom configuration, you'll need to create a config file named ".csscomb.json" in your project's root. If you want to use the same configuration for several projects, you can place the file in a parent folder. The plugin searches for a config file in parent folders up to your home folder.

Instructions for creating this config file can be found on [csscomb.com](http://csscomb.com).

## Updates
This plugin is mostly a wrapper for the npm module [csscomb](https://www.npmjs.org/package/csscomb). That means that you can easily update the bundled csscomb package yourself if there is a new version available. The package is found in the folder *ScriptLibraries* in this plugin. I will of course try to keep this plugin updated myself.

## Installation

1. Download and extract the zip
2. Double-click the CSScomb.espressoplugin file to install
