action.performWithContext = function(context, outError) {

	var snippetOptions = CETextOptionNormalizeIndentationLevel | CETextOptionNormalizeLineEndingCharacters | CETextOptionNormalizeIndentationCharacters;

	var selections = context.selectedRanges;

	var pluginsPath = '~/Library/Application\\ Support/Espresso/Plug-Ins';
	var scriptPath = '~/Library/Application\\ Support/Espresso/Plug-Ins/CSScomb.espressoplugin/Scripts/settings.js';

	var nodeMissingMessage = 'CSScomb was not able to find Node.js\n\nPlease install Node on your system and make sure the Node command is available in Terminal\n\nhttps://nodejs.org/en/download/';

	var scriptMissingMessage = "CSScomb was not able to find your Plug-Ins folder\n\nCSScomb.espressoplugin must be installed in\n~/Library/Application Support/Espresso/Plug-Ins/";

	var scriptErrorMessage = 'CSScomb Node script failed';

	var snippet = new CETextSnippet('`if ! node -v > /dev/null; then '+dialog(nodeMissingMessage)+'; elif ! test -d '+pluginsPath+'; then '+dialog(scriptMissingMessage, 'caution')+'; else node '+scriptPath+' || { '+dialog(scriptErrorMessage, 'caution')+'; }; fi`$EDITOR_SELECTION');

	function dialog(message, icon) {
		return '{ nohup osascript -e \'tell application "Espresso" to display dialog "' + message + '" buttons "OK" default button 1 with title "CSScomb" with icon ' + ( icon ? icon : 'note' ) + '\' &> /dev/null& }';
	}

	if (!context.insertTextSnippet(snippet, snippetOptions)) return false;

	context.selectedRanges = selections;
	return true;
};
