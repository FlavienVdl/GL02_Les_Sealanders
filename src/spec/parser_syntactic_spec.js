describe("Program Syntactic testing of GiftParser", function(){
	
	beforeAll(function() {

		const Quiz = require('../Quiz');
		const GiftParser = require('../GiftParser');
		this.analyzer = new GiftParser();
		

	});	
	
	it("can read a question from a simulated input", function(){
		let input=[":: This is a question ?","Suite"];
		expect(this.analyzer.checkQuestion(input)).toBeTrue();

	});

	it("cannot read a non-question from a simulated input", function(){
		let input=["This is a question ?","Suite"];
		expect(this.analyzer.checkQuestion(input)).toBeFalse();

	});

	it("can read a reponse from a simulated input", function(){
		
		let input="{ This is an answer ";
		expect(this.analyzer.isReponse(input)).toBeTrue();

	});

	it("cannot read a non-reponse from a simulated input", function(){
		
		let input="This is an answer ";
		expect(this.analyzer.isReponse(input)).toBeFalse();

	});

	it("can read a Category from a simulated input", function(){
		
		let input=["$CATEGORY: This is category ","Suite"];
		expect(this.analyzer.checkCategory(input)).toBeTrue();

	});

	it("cannot read a non-Category from a simulated input", function(){
		
		let input=["[ This is category ","Suite"];
		expect(this.analyzer.checkCategory(input)).toBeFalse();

	});

	it("can read a Comment from a simulated input", function(){
		
		let input=["// This is a comment ","Suite"];
		expect(this.analyzer.checkComment(input)).toBeTrue();

	});

	it("cannot read a non-Comment from a simulated input", function(){
		
		let input=["/ This is a comment ","Suite"];
		expect(this.analyzer.checkComment(input)).toBeFalse();

	});

	
});