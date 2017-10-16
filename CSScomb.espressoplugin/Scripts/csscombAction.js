action.performWithContext = function(context, outError) {

	var snippetOptions = CETextOptionNormalizeIndentationLevel | CETextOptionNormalizeLineEndingCharacters | CETextOptionNormalizeIndentationCharacters;

	var selections = context.selectedRanges;
	var selection = context.selectedRanges[0];

	var tabString = context.textPreferences.tabString;
	var lineEndingString = context.textPreferences.lineEndingString;
	var method = action.setup.method;

	var pluginsPath = '~/Library/Application\\ Support/Espresso/Plug-Ins';
	var scriptPath = '~/Library/Application\\ Support/Espresso/Plug-Ins/CSScomb.espressoplugin/Scripts/csscomb.js';

	var nodeMissingMessage = 'CSScomb was not able to find Node.js\n\nPlease install Node on your system and make sure the Node command is available in Terminal\n\nhttps://nodejs.org/en/download/';

	var scriptMissingMessage = "CSScomb was not able to find your Plug-Ins folder\n\nCSScomb.espressoplugin must be installed in\n~/Library/Application Support/Espresso/Plug-Ins/";

	var scriptErrorMessage = 'CSScomb Node script failed';

	// Comb entire file if no selection
	var processFile = '';
	if (selection.length === 0) {
		var documentRange = new Range(0, context.string.length);

		var clearRecipe = new CETextRecipe();
		clearRecipe.deleteRange(documentRange);
		// Stop script if this recipe fails
		if (!context.applyTextRecipe(clearRecipe)) return false;

		processFile = '-f ';
	}

	var firstSnippet = new CETextSnippet('`if ! node -v > /dev/null; then echo "$EDITOR_SELECTION"; '+dialog(nodeMissingMessage)+'; elif ! test -d '+pluginsPath+'; then echo "$EDITOR_SELECTION"; '+dialog(scriptMissingMessage, 'caution')+'; else node '+scriptPath+' '+processFile+'-a "'+method+'" -t "'+tabString+'" -l "'+lineEndingString+'" || { '+dialog(scriptErrorMessage, 'caution')+'; echo "$EDITOR_SELECTION"; }; fi`');

	var snippet = new CETextSnippet('`node '+scriptPath+' '+processFile+'-a "'+method+'" -t "'+tabString+'" -l "'+lineEndingString+'" || { '+dialog(scriptErrorMessage, 'caution')+'; echo "$EDITOR_SELECTION"; }`');

	function dialog(message, icon) {
		return '{ nohup osascript -e \'tell application "Espresso" to display dialog "' + message + '" buttons "OK" default button 1 with title "CSScomb" with icon ' + ( icon ? icon : 'note' ) + '\' &> /dev/null& }';
	}

	var newSelections = [];
	var insertedOffset = 0;
	var insertSnippets = selections.every(function(selection, index, array) {
		var offsetLocation = selection.location + insertedOffset;
		context.selectedRanges = [new Range(offsetLocation, selection.length)];

		if (index === 0) {
			if (!context.insertTextSnippet(firstSnippet, snippetOptions)) return false;
		} else {
			if (!context.insertTextSnippet(snippet, snippetOptions)) return false;
		}

		insertedOffset = context.selectedRanges[0].location - (selection.location + selection.length);
		newSelections[index] = new Range(offsetLocation, context.selectedRanges[0].location - offsetLocation);
		return true;
	});

	if (!insertSnippets) return false;

	// Scroll back to where cursor was before
	if (selection.length === 0) {
		context.selectedRanges = [selection];
	} else {
		context.selectedRanges = newSelections;
	}
	return true;
};
