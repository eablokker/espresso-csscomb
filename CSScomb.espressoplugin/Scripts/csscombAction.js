action.performWithContext = function(context, outError) {

	var snippetOptions = CETextOptionNormalizeIndentationLevel | CETextOptionNormalizeLineEndingCharacters | CETextOptionNormalizeIndentationCharacters;

	var selection = context.selectedRanges[0];

	var tabString = context.textPreferences.tabString;
	var lineEndingString = context.textPreferences.lineEndingString;
	var method = action.setup.method;

	var pluginsPath = '~/Library/Application\\ Support/Espresso/Plug-Ins';
	var scriptPath = '~/Library/Application\\ Support/Espresso/Plug-Ins/CSScomb.espressoplugin/Scripts/csscomb.js';

	var nodeMissingMessage = 'CSScomb was not able to find Node.js\n\nPlease install Node on your system and make sure the Node command is available in Terminal\n\nhttps://nodejs.org/en/download/';

	var scriptMissingMessage = "CSScomb was not able to find your Plug-Ins folder\n\nCSScomb.espressoplugin must be installed in\n~/Library/Application Support/Espresso/Plug-Ins/";

	var scriptErrorMessage = 'CSScomb Node script failed';

	var clearRecipe = new CETextRecipe();
	var processFile = '';
	if (selection.length === 0) {
		var numberOfLines = context.lineStorage.numberOfLines;
		var lastLineRange = context.lineStorage.lineRangeForLineNumber(numberOfLines);
		var numberOfCharacters = lastLineRange.location + lastLineRange.length;
		var documentRange = new Range(0, numberOfCharacters);

		clearRecipe.deleteRange(documentRange);

		processFile = '-f ';
	}

	// Stop script if this recipe fails
	if (!context.applyTextRecipe(clearRecipe)) return false;

	var snippet = new CETextSnippet('`if ! node -v > /dev/null; then echo "$EDITOR_SELECTION"; '+dialog(nodeMissingMessage)+'; elif ! test -d '+pluginsPath+'; then echo "$EDITOR_SELECTION"; '+dialog(scriptMissingMessage, 'caution')+'; else node '+scriptPath+' '+processFile+'-a "'+method+'" -t "'+tabString+'" -l "'+lineEndingString+'" || { '+dialog(scriptErrorMessage, 'caution')+'; echo "$EDITOR_SELECTION"; }; fi`');

	function dialog(message, icon) {
		return '{ nohup osascript -e \'tell application "Espresso" to display dialog "' + message + '" buttons "OK" default button 1 with title "CSScomb" with icon ' + ( icon ? icon : 'note' ) + '\' &> /dev/null& }';
	}
	
	// Stop script if this snippet fails
	if (!context.insertTextSnippet(snippet, snippetOptions)) return false;

	// Scroll back to where cursor was before
	var goToCursorRecipe = new CETextRecipe();
	if (selection.length === 0) {
		var range = new Range(selection.location, 1);
		var replace = context.substringWithRange(range);
		goToCursorRecipe.replaceRange(range, replace);
	}
	return context.applyTextRecipe(goToCursorRecipe);
};
