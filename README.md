# Trice
A wrapper for [Tracery] (by @[galaxykate]) for [Twine] _(2.x [Sugar Cube] format)_.
This project was heavily inspired by [Twincery] (a Twine 1.x wrapper for Tracery) by @[mrfb].
If you have any problems or questions about Trice, let me know here or at @[incobalt].

There is an excelent [Tracery tutorial] that you can use to learn more about using Tracery. You can also check out the [Twine 2 Guide] for information about getting started with Twine.

The purpose of Trice is the same as Twinecery:

1. Make it easy to author and use Tracery grammars using the Twine 2 interface
2. Use Tracery to generate text within Twine 2 passages

## Table of Contents

- [Setting up Trice](#setting-up-trice)
- [Authoring Grammars](#authoring-grammars)
	- [A Brief Explanation of Tracery Grammars](#a-brief-explanation-of-tracery-grammars)
	- [Building a Grammar with Twine Passages](#building-a-grammar-with-twine-passages)
	- [Outputting Grammars](#outputting-grammars)
	- [Compiling the Grammar](#compiling-the-grammar)
- [Generating Text in Passages](#generating-text-in-passages)
	- [The <\<trace>> Macro](#the-trace-macro)
	- [The trace() Function](#the-trace-function)
	- [Trice Links](#trice-links)

## Setting up Trice
There are two ways to set up Trice. If you're starting a new Twine, you can simply import the provided Trice.html from the Twine 2 main menu. The other way to set up Trice is to open the Trice.js file and copy its contents. Then open a story or create a new one. With the story open, click on the arrow menu in the lower left and select Edit Story JavaScript from the menu that appears. Go to the end of the file and paste the text you copied earlier.
In order to test files published with Trice, you will need to place the files for Tracery in a subfolder named "tracery". This folder needs to be in the same location as the published file. As of this version, Trice needs to find the following files: tracery.js, mods-end-basic.js,  and vendor/seedrandom.js. You can adjust what files get loaded in the section of the script prefaced by "Load your external scripts here."
**Note:** Due to the nature of the Twine 2 browser, you won't be able to play or test your story from inside the Twine interface. You will always need to publish to a file. 

## Authoring Grammars
### A Brief Explanation of Tracery Grammars
A Tracery grammar is a JSON object that has string keys (**symbols**) and an array of potential results (**rules**). For example:
```
{  
	"origin": ["The #animal# #action.ed# with #style#."],  
	"animal": ["cat", "dog", "bird", "octopus", "camel"],  
	"action": ["walk", "shuffle", "waffle", "climb"],  
	"style": ["fervor", "denial", "flair", "cheer", "melancholy", "pizazz"]  
}
```
which would provide results like:
```
The camel walked with fervor.
The dog walked with denial.
The bird climbed with flair.
The cat walked with cheer.
The octopus shuffled with pizazz.
```
An important part about grammars is that the rules can just be plain text (like the rules in the animal symbol) or they can tell Tracery to generate text. #animal# in the origin symbol's only rule asks Tracery to choose a rule from the animal symbol. Tracery can also put modifiers on these (#action.ed# to properly add past tense 'ed' to the result of #action#). Tracery has a lot more to offer, so take a look at the [Tracery tutorial] to find out more.
### Building a Grammar with Twine Passages
One of the features of Trice is to allow you to build a Tracery grammar entirely using Twine passages. This grammar can then be used within the story to generate text, or exported to be used in another implementation of Tracery.
Each Twine passage with the **"grammar" tag** represents a symbol and a list of rules. The title of the passage becomes the symbol (e.g., animal). The text of the passage becomes a list of rules, with each new rule on a new line. For example the animal passage would look like this:
```
cat
dog
bird
octopus
camel 
```
Tracery rules can link to other rules (e.g., "The #animal# "). In Trice, you use regular Twine link syntax to do this. So the origin passage would look like this:
```
The [[animal]] [[action<-ed]] with [[style]].
```
This will cause Twine to show a link arrow from the origin passage to the animal, action, and style passages. If you have a lot of interconnected rules, it might get messy, so you can still use the regular Tracery style instead, like so:
```
The #animal# #action.ed# with #style#.
```
Notice that in the Trice style, you use an arrow (<-) to start a list of modifiers. This makes passage linking work nicely in Twine. Only the first arrow is used, the rest use periods to separate them, so you would write "[[action<-ed.a.capitalize]]" if you wanted to add all three modifiers.
### Outputting Grammars
Sometimes you just want to use Twine's interface to build a grammar, but don't actually want to use Tracery to generate text in a Twine story. If this is the case, then you can use the <\<printGrammar>> macro in any passage **except the starting passage** to output a string of JSON that you can then copy into another implementation of Tracery.
### Compiling the Grammar
By default, Trice will grab any passage tagged "grammar" and compile these into a grammar, but there are other ways of compiling a grammar for Trice. You can instead paste a JSON string into a single passage and tell Trice to parse that string into a grammar, or you can load a grammar from a JSON file. To change how Trice loads grammars, go to the section of the script titled "Load your external scripts here." and find the place where it says "load your grammar here!"
Normally, it will say "generateGrammar();" which tells Trice to search for passages tagged "grammar" and make a Tracery grammar from them. You can change this to "grammarFromPassage("PassageTitle")" to have Trice take the text of the passage with the title PassageTitle, and convert it to a grammar. "grammarFromFile("Path")" will read JSON from the file at Path and convert it to a grammar. If you use either of these methods, you don't need to tag any passages with "grammar" _unless_ you want to make use of Trice links (see the section on Trice links below).
## Generating Text in Passages
The main feature of Tracery is generating text based on rules supplied by a grammar. Trice makes this easy to do in Twine using a few macros and functions.
**Note:** Since Trice loads Tracery after the page has started loading, you cannot generate any text in the starting passage. If you want to use generative text in the first passage the player sees, use a <\<goto>> macro in the starting passage to immediately forward the player to a new passage.
### The <\<trace>> Macro
Whenever you want to generate some text and display it, use the <\<trace>> macro. <\<trace>> takes a string argument that tells Tracery to expand that argument into generated text. For example, <\<trace "animal">> will ask Tracery to generate a result from the animal symbol in the grammar. You can even build a full rule like <\<trace "The #animal# #action.s#.">> To get a result like "The cat shuffles." Note that if you want to do this, you need to use full Tracery syntax. If you're just expanding a single symbol, then you don't need the hash marks, just "animal" will do. You can also give <\<trace>> no argument. When you do this, it will expand the "origin" symbol, which is only useful if your grammar has one.
Whenever you use <\<trace>>, it stores the output in the $TrResult variable. This can be helpful for repeating it throughout a passage, but it's overwritten every time you use the macro. If you need to store the result longer, use the trace() function.
### The trace() Function
The trace() function is almost identical to the <\<trace>> macro, except that it's meant to be used in expressions like <\<set $currentAnimal to trace("animal")>>. trace() will not print anything to the current passage, and it won't store the result in a temporary variable. It simply returns the result. Trace takes the same arguments that the <\<trace>>macro does, and omitting an argument will expand the "origin" symbol.
### Trice Links
The final way you can generate text is by using Trice links. A Trice link is a Twine link that will replace the text of the link and the passage it links to with generated text. This means that every time the player visits the passage, the link will say something different and link to a different passage.
Trice links are simply regular Twine links that point to a passage that has the "grammar" tag. Thus, the "[[animal]]" link points to the animal passage which has the "grammar" tag. When the link gets displayed, though, it will show up as something like "[[cat]]" or "[[octopus]]" instead. These links will now go to the "cat" and "octopus" passages respectively. Like when building grammars, you can start a list of modifiers for the link using the left arrow (<-) symbol. Thus "[[animal<-capitalize.a]]" might result in a link like "[[A dog]]". Nevertheless, this link will still only point to the "dog" passage, so you don't have to make a different passage for every modifier you might want to include in your links.
Trice links only work when you have passages with "grammar" tags on them. If you're using another method to compile the grammar for Tracery, then you probably won't have these kinds of passages already in your story. That said, there's nothing stopping you from making passages with "grammar" tags anyway. Trice links only look at the passage titles and tags to see if they should generate a new link.

[//]: #
   [Tracery]: <http://tracery.io>
   [Tracery tutorial]: <http://www.crystalcodepalace.com/traceryTut.html>
   [Twincery]: <https://github.com/mrfb/twinecery>
   [Twine]: <http://twinery.org>
   [Twine 2 Guide]: <https://twinery.org/wiki/twine2:guide>
   [Cheap Bots Done Quick]: <http://cheapbotsdonequick.com>
   [mrfb]: <http://twitter.com/mrfb>
   [galaxykate]: <http://twitter.com/galaxykate>
   [incobalt]: <http://twitter.com/incobalt>
   [Sugar Cube]: <http://www.motoslave.net/sugarcube/>