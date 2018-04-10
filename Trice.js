/*
	Tracery by Kate Compton (@galaxykate)
	Wrapped to SugarCube by Michael Thomét (@incobalt)
    Please see README.md for setup and usage
*/
(function () {
	/*
		script loader with onLoad Listener via TheMadExile
	*/
	window.requestScriptLoad = function (options) {
		if (options == null || typeof options !== 'object' || !options.src) {
			return;
		}

		var
			opts   = Object.assign({ parent : document.head }, options),
			script = document.createElement('script');

		function onLoadOnce(evt) {
			opts.onload.call(evt.target, evt);
			script.removeEventListener('load', onLoadOnce);
		}

		script.id   = opts.id;
		script.src  = opts.src;
		script.type = 'text/javascript';

		if (typeof opts.onload === 'function') {
			script.addEventListener('load', onLoadOnce, false);
		}

		opts.parent.appendChild(script);
	};
	
	//create the grammar object
	window.grammar = {};
	
	/*
		Generates a grammar from grammar-tagged passages.
		Pass true for merge to merge with the existing grammar.
		Pass nothing for merge and it will overwrite the grammar.
	*/
	window.generateGrammar = function(merge){
		
		var grammarPassages = Story.lookup("tags", "grammar");

		if(grammarPassages.length == 0){
				grammar = tracery.createGrammar({"origin": [""]});
		}else{
			grammarString = "{";
			for(var i = 0; i < grammarPassages.length; i++){
				var splitPassage = grammarPassages[i].text.replace(/\[\[/g, "#");
				splitPassage = splitPassage.replace(/\]\]/g, "#");
				splitPassage = splitPassage.replace(/<-/g, ".");
				var splitPassageArray = splitPassage.split(/\n/);
				var grammarString = grammarString + "\"" + grammarPassages[i].title + "\": [";
				for(var j = 0; j < splitPassageArray.length; j++){
					grammarString = grammarString + "\"";
					grammarString = grammarString + splitPassageArray[j];
					grammarString = grammarString + "\"";
					if(j != splitPassageArray.length - 1){
						grammarString = grammarString + ", ";
					}
				}
				grammarString += "]";
				if(i != grammarPassages.length - 1){
					grammarString = grammarString + ", ";
				}
			}

			grammarString = grammarString + "}"
			var parseObj = JSON.parse(grammarString);
			if(merge != undefined && grammar.symbols != undefined){
				var origGrammar = JSON.parse(grammar.toJSON());
				$.extend(true, parseObj, origGrammar);
			}
			grammar = tracery.createGrammar(parseObj);
			grammar.addModifiers(baseEngModifiers);
		}
	}
	
	/*
		Loading from a passage. Pass true for merge to merge with the existing grammar.
		Pass nothing for merge and it will overwrite the grammar.
	*/
	window.grammarFromPassage = function(passageName, merge){
		var parseObj = JSON.parse(Story.get(passageName).text);
		
		if(merge != undefined && grammar.symbols != undefined){
				var origGrammar = JSON.parse(grammar.toJSON());
				$.extend(true, parseObj, origGrammar);
			}
			grammar = tracery.createGrammar(parseObj);
			grammar.addModifiers(baseEngModifiers);
	}
	
	/*
		Loading (asynchronously) from a file. Pass true for merge to merge with the existing grammar.
		Pass nothing for merge and it will overwrite the grammar.
	*/
	window.grammarFromFile = function(filePath, merge){
		var parseObj = $.getJSON(filePath, function(){
			if(merge != undefined && grammar.symbols != undefined){
				var origGrammar = JSON.parse(grammar.toJSON());
				$.extend(true, parseObj, origGrammar);
			}
			grammar = tracery.createGrammar(parseObj);
			grammar.addModifiers(baseEngModifiers);
		});
	}
	
	
	/*
		Load your external scripts here.
	*/
	requestScriptLoad({
		id     : 'seedrandom',
		src    : './tracery/vendor/seedrandom.js',
		onload : function (evt){
			requestScriptLoad({
				id     : 'mods-eng-basic',
				src    : './tracery/mods-eng-basic.js',
				onload : function (evt){
					requestScriptLoad({
						id     : 'tracery',
						src    : './tracery/tracery.js',
						onload : function (evt){
							//load your grammar here!
							//Use generateGrammar, grammarFromPassage, or grammarFromFile
							generateGrammar();
						}
					});
				}
			});
		}
	});
	
	/*
		Expand the tracery symbols in source, and return the final text result.
	*/
	window.trace = function(source){
		return traceFull(source).finishedText;
	}
	
	/*
		Expand the tracery symbols in source, and return the full expansion.
	*/
	window.traceFull = function(source){
		if(source === undefined || source == ""){
			return trine.grammar.expand("#origin#");
		}else{
			if(!source.includes("#")){
				return grammar.expand("#" + source + "#");
			}else{
				return grammar.expand(source);
			}
		}
	}
	
	/*
		This callback attaches to SugarCube's :passagerender and re-renders any links to grammar passages,
		tracing the link text. The result is a link that goes to the unmodified trace, with the finished
		trace as the text for the link.
	*/
	$(document).on(':passagerender', function (ev) {
		$(ev.content).find(".link-internal").each(function(){
			var elem = $(this)
			var pTitle = elem.attr("data-passage");
			if(pTitle != undefined){
				if(Story.get(pTitle).tags.includes("grammar")){
					var pText = elem.text();
					if(pTitle != pText){
						pTitle = pTitle + "." + pText;
					}
					var newText = traceFull(pTitle);
					var linkText = "";
					var unmodifiedRecurse = function(item){
						if(item.children != undefined){
							item.children.forEach(unmodifiedRecurse);
						}
						if(item.modifiers === undefined){
							linkText = linkText + item.finishedText;
						}
					}
					if(newText.children != undefined){
						newText.children.forEach(unmodifiedRecurse);
					}
					
					if(linkText == newText.finishedText){
						elem.empty().wiki("[[" + newText.finishedText + "]]");
					}else{
						elem.empty().wiki("[[" + newText.finishedText + "->" + linkText + "]]");
					}
				}
			}
		});
	});
	
	/*
		Macro for <<trace>>
	*/
	Macro.add("trace", {
    handler  : function () {
        try {
					var result = "";
					if(this.args === undefined || this.args[0] === undefined){
						result = trace("#origin#");
					}else{
						if(this.args[0].includes("#")){
							result = trace(this.args[0]);
						}else{
							result = trace("#" + this.args[0] + "#");
						}
					}
					State.variables.TrResult = result;
					
					$(this.output).append(result);
					
        }
        catch (ex) {
            return this.error("bad trace: " + ex.message);
        }
    }
	});
	
	/*
		Macro for <<printGrammar>>
	*/
	Macro.add("printGrammar", {
    handler  : function () {
        try {
					var result = grammar.toJSON();
					$(this.output).append(result);
					
        }
        catch (ex) {
            return this.error("error: " + ex.message);
        }
    }
	});
})();
