/*
 * autor:    lis
 * created:  Dec 21 21:06:39 2020
 *
 * MO — MultipleOperation
 * UO — UnaryOperation
 */

'use strict'





const MOType = {
	'ADD' : 'ADD',
	'MUL' : 'MUL',
	'EXP' : 'EXP',
	'DIV' : 'DIV',
};

const MOTypeProbs = {
	'ADD' : 1.0,
	'MUL' : 1.0,
	'EXP' : 0.1,
	'DIV' : 0.5,
};

const MOIntervals = {
	'ADD' : [2, 3],
	'MUL' : [1, 3],
	'EXP' : [2, 2],
	'DIV' : [2, 2],
};

const MOLatex = {
	'ADD' : '%0 + %1',
	'MUL' : '%0 %1',
	'EXP' : '%0 ^ {%1}',
	'DIV' : '\\frac{ %0 }{ %1 }',
};


const UOType = {
	'DIV'  : 'DIV',
	'POW'  : 'POW',
	'ROOT' : 'ROOT',
	'EXP'  : 'EXP',
	'SIN'  : 'SIN',
	'COS'  : 'COS',
	// 'TAN'  : 4,
	// 'CTG'  : 5,
	// 'ASIN' : 6,
	// 'ACOS' : 7,
	// 'ATAN' : 8,
	// 'ACTG' : 9,
};

const UOTypeProbs = {
	'DIV'  : 1.0,
	'POW'  : 2.0,
	'ROOT' : 2.0,
	'EXP'  : 0.5,
	'SIN'  : 1.0,
	'COS'  : 1.0,
	// 4 : 1.0,
	// 5 : 1.0,
	// 6 : 1.0,
	// 7 : 1.0,
	// 8 : 1.0,
	// 9 : 1.0,
};

const UOParams = {
	'DIV'  : [1, 1],
	'POW'  : [2, 10],
	'ROOT' : [2, 3],
	'EXP'  : [2, 10],
	'SIN'  : null,
	'COS'  : null,
};

// zero — expr, first — param
const UOLatex = {
	'DIV'  : '\\frac{ %1 }{ %0 }',
	'POW'  : '%0 ^ {%1}',
	'ROOT' : '\\sqrt[%1]{ %0 }',
	'EXP'  : '%1 ^ {%0}',
	'SIN'  : '\\sin ( %0 )',
	'COS'  : '\\cos ( %0 )',
};

/*
 * В функцию подаётся карта весов, где каждому
 * ключу сопоставлен вес; вероятность выпадения
 * определённого ключа равна его весу,
 * делённому на сумму всех весов в карте;
 * функция возвращает выпавший ключ
 */
function choice(wmap)
{
	let sum = 0;
	for(let el in wmap)
	{
		sum += wmap[el];
	}

	let res = (Math.random() - 0.00000001) * sum;

	for(let el in wmap)
	{
		if(wmap[el] > res)
			return el;
		res -= wmap[el];
	}

	throw 'choice(wmap): random number get out of sum';
}





class Expression
{
	costructor()
	{
		
	}


	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		throw 'Expression::latex() method is abstruct';
	}

	isvar()   { return false; }
	ismult()  { return false; }
	isunary() { return false; }

};





class Variable extends Expression
{
	/*
	 * name : String
	 */

	constructor(name)
	{
		super();
		this.name = name || 'x';
	}

	latex()
	{
		return ' ' + this.name + ' ';
	}

	isvar() { return true; }
};





class MultipleOperation extends Expression
{
	/*
	 * op   : MultipleOperationType
	 * mems : Array of Expression
	 */

	constructor(op, mems)
	{
		super();
		this.op   = op   || null;
		this.mems = mems || null;
		return;
	}

	ismult() { return true; }



	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		if(this.mems.length < 2)
			return this.mems[0].latex();

		let res = MOLatex[this.op].fmt(this.mems[0].latex(), this.mems[1].latex());
		for(let i = 2; i < this.mems.length; ++i) 
			res = MOLatex[this.op].fmt(res, this.mems[i].latex());
		return '\\left( ' + res + ' \\right)';
	}
};





class UnaryOperation extends Expression
{
	/*
	 * op    : UnaryOperationType
	 * expr  : Expression
	 * param : Number
	 */

	constructor(op, expr, param)
	{
		super();
		this.op    = op    || null;
		this.expr  = expr  || null;
		this.param = param || null;
		return;
	}

	isunary() { return true; }



	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		return UOLatex[this.op].fmt(this.expr.latex(), this.param);
	}
}
