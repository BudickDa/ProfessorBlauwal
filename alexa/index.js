'use strict';

const Wiki = require('wikijs').default;
const Alexa = require('alexa-sdk');
const FuzzySearch = require('fuzzy-search');
const _ = require('underscore');

const whaleData = require('./whaledata');
const whales = new FuzzySearch(whaleData, ['name']);

const APP_ID = 'amzn1.ask.skill.57d06fc7-f036-4f34-88c2-8ca9f86a78cb';
const wiki = Wiki({
	apiUrl: 'https://de.wikipedia.org/w/api.php'
});

function find(whale) {
	return _.first(whales.search(whale.substring(0, whale.length - 1)));
}

function dontKnow() {
	return 'Keine Ahnung.';
}

const handlers = {
	'LaunchRequest': function() {
		this.emit(':ask', 'Hallo, ich bin Professor Blauwal. Wie kann ich Dir helfen?');
	},
	'AskQuestionDefineIntent': function() {
		const slots = this.event.request.intent.slots;
		const family = slots.family.value;
		const whale = slots.whale.value;
		let item;
		if (family) {
			item = family;
		} else {
			item = whale;
			wiki.page(item)
				.then(page => page.summary())
				.then(content => {
						this.emit(':tell', content);
					}
				).catch(err => {
				this.emit(':tell', 'Ups, über diesen Wal habe ich leider nichts in meinen Unterlagen.');
			});
		}
	},
	'AskQuestionSpeedIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.speed !== '') {
			this.emit(':tell', result.speed);
		} else {
			this.emit(':tell', dontKnow());
		}
	},
	'AskQuestionWeightIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.weight !== '') {
			this.emit(':tell', result.weight);
		} else {
			this.emit(':tell', dontKnow());
		}
	},
	'AskQuestionPregnancyIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.pregnancy !== '') {
			this.emit(':tell', result.pregnancy);
		} else {
			this.emit(':tell', dontKnow());
		}
	},
	'AskQuestionMaxAgeIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.age !== '') {
			this.emit(':tell', result.age);
		} else {
			this.emit(':tell', 'Lange... Jedenfalls so lange er sich von Japan, Norwegen, Island und den Färöer-Inseln fernhält.');
		}
	},
	'AskQuestionMaxLengthIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.length !== '') {
			this.emit(':tell', result.length);
		} else {
			this.emit(':tell', dontKnow());
		}
	},
	'AskQuestionMaxDiveIntent': function() {
		const whale = this.event.request.intent.slots.whale.value;
		const result = find(whale);
		if (result && result.dive !== '') {
			this.emit(':tell', result.dive);
		} else {
			this.emit(':tell', dontKnow());
		}
	},
	'AMAZON.HelpIntent': function() {
		this.emit(':ask', 'Ich kann dir Fakten zu Walen aufzählen, was möchtest Du wissen?');
	},
	'AMAZON.CancelIntent': function() {
		this.emit(':tell', 'Tschö!');
	},
	'AMAZON.StopIntent': function() {
		this.emit(':tell', 'Frohes schwimmen!');
	},
	'SessionEndedRequest': function() {
		this.emit(':tell', 'Ich schwimme dann mal weiter.');
	},
};

exports.handler = (event, context) => {
	const alexa = Alexa.handler(event, context);
	alexa.APP_ID = APP_ID;
	// To enable string internationalization (i18n) features, set a resources object.
	//alexa.resources = languageStrings;
	alexa.registerHandlers(handlers);
	alexa.execute();
};
