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

	var scriptMissingMessage = 'CSScomb was not able to find your Plug-Ins folder\n\nCSScomb.espressoplugin must be installed in\n~/Library/Application Support/Espresso/Plug-Ins/';

	var scriptErrorMessage = 'CSScomb Node script failed';

	var firstSnippet = new CETextSnippet('`if ! node -v > /dev/null; then echo "$EDITOR_SELECTION"; '+dialog(nodeMissingMessage)+'; elif ! test -d '+pluginsPath+'; then echo "$EDITOR_SELECTION"; '+dialog(scriptMissingMessage, 'caution')+'; else node '+scriptPath+' -a "'+method+'" -t "'+tabString+'" -l "'+lineEndingString+'" || { '+dialog(scriptErrorMessage, 'caution')+'; echo "$EDITOR_SELECTION"; }; fi`');

	var snippet = new CETextSnippet('`node '+scriptPath+' -a "'+method+'" -t "'+tabString+'" -l "'+lineEndingString+'" || { '+dialog(scriptErrorMessage, 'caution')+'; echo "$EDITOR_SELECTION"; }`');

	function dialog(message, icon) {
		return '{ nohup osascript -e \'tell application "Espresso" to display dialog "' + message + '" buttons "OK" default button 1 with title "CSScomb" with icon ' + ( icon ? icon : 'note' ) + '\' &> /dev/null& }';
	}

	var newSelections = [];
	function insertSnippets(selections) {
		
		var insertedOffset = 0;
		var insertSnippets = selections.every(function(sel, index, array) {
			var offsetLocation = sel.location + insertedOffset;
			context.selectedRanges = [new Range(offsetLocation, sel.length)];

			if (index === 0) {
				if (!context.insertTextSnippet(firstSnippet, snippetOptions)) return false;
			} else {
				if (!context.insertTextSnippet(snippet, snippetOptions)) return false;
			}

			var insertedSnippetEnd = context.selectedRanges[0].location;

			insertedOffset = insertedSnippetEnd - (sel.location + sel.length);
			newSelections[index] = new Range(offsetLocation, insertedSnippetEnd - offsetLocation);
			return true;
		});

		return insertSnippets;
	}

	// Comb entire file if no selection
	if (selections.length <= 1 && selection.length === 0) {
		var documentRange = new Range(0, context.string.length);
		context.selectedRanges = [documentRange];

		if (!insertSnippets(context.selectedRanges)) return false;
		context.selectedRanges = [selection];
		return true;
	} else {
		if (!insertSnippets(context.selectedRanges)) return false;
		context.selectedRanges = newSelections;
		return true;
	}
};
