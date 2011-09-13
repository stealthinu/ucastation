all: ucastation.js admin.ejs view.ejs

ucastation.js: src/ucastation.coffee
	coffee -cb src/ucastation.coffee
	cp src/ucastation.js ./

admin.ejs: src/admin.ejs.coffee
	coffee -cb src/admin.ejs.coffee
	cp src/admin.ejs.js views/admin.js.ejs

view.ejs: src/view.ejs.coffee
	coffee -cb src/view.ejs.coffee
	cp src/view.ejs.js views/view.js.ejs
