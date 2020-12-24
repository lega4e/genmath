/*
 * autor:    lis
 * created:  Dec 21 21:06:39 2020
 *
 * CAO — Commutative and Associative Operation
 * O — Operation
 */

'use strict'





const CAOType = {
	'ADD' : 'ADD',
	'SUB' : 'SUB',
	'MUL' : 'MUL',
};

const CAOTypeProbs = {
	'ADD' : 1.0,
	'SUB' : 1.0,
	'MUL' : 1.0,
};

const CAOIntervals = {
	'ADD' : [2, 3],
	'SUB' : 2,
	'MUL' : [2, 3],
};

const CAOLatex = {
	'ADD' : '%0 + %1',
	'SUB' : '%0 - %1',
	'MUL' : '%0 %1',
};



const OType = {
	'DIV'  : 'DIV',
	'EXP'  : 'EXP',

	'POW'  : 'POW',
	'ROOT' : 'ROOT',
	'UDIV' : 'UDIV',
	'UEXP' : 'UEXP',
	'SIN'  : 'SIN',
	'COS'  : 'COS',
	// 'TAN'  : 4,
	// 'CTG'  : 5,
	// 'ASIN' : 6,
	// 'ACOS' : 7,
	// 'ATAN' : 8,
	// 'ACTG' : 9,
};

const OTypeProbs = {
	'DIV'  : 1.0,
	'EXP'  : 0.5,

	'POW'  : 1.2,
	'ROOT' : 1.2,
	'UDIV' : 0.75,
	'UEXP' : 0.2,
	'SIN'  : 1.0,
	'COS'  : 1.0,
};

const OParams = {
	'DIV'  : null,
	'EXP'  : null,

	'POW'  : [2, 10],
	'ROOT' : [2, 3],
	'UDIV' : 1,
	'UEXP' : [2, 10],
	'SIN'  : null,
	'COS'  : null,
};

const OArgsCount = {
	'DIV'  : 2,
	'EXP'  : 2,

	'POW'  : 1,
	'ROOT' : 1,
	'UDIV' : 1,
	'UEXP' : 1,
	'SIN'  : 1,
	'COS'  : 1,
}

const OLatex = {
	'DIV'  : (o) => '\\frac { %0 }{ %1 }'.fmt(
		o.mems[0].latex(), o.mems[1].latex()
	),
	'EXP'  : (o) => '%0 ^ { %1 }'.fmt(
		o.mems[0].latex(), o.mems[1].latex()
	),

	'POW'  : (o) => '%0 ^ { %1 }'.fmt(
		o.mems[0].latex(), o.param
	),
	'ROOT' : (o) => {
		return (o.param == 2 ?
			'\\sqrt{ %0 }' :
			'\\sqrt[%1]{ %0 }'
		).fmt( o.mems[0].latex(), o.param );
	},
	'UDIV' : (o) => '\\frac{ %1 }{ %0 }'.fmt(
		o.mems[0].latex(), o.param
	),
	'UEXP' : (o) => '%1 ^ { %0 }'.fmt(
		o.mems[0].latex(), o.param
	),
	'SIN'  : (o) => '\\sin ( %0 )'.fmt(
		o.mems[0].latex(), o.param
	),
	'COS'  : (o) => '\\cos ( %0 )'.fmt(
		o.mems[0].latex(), o.param
	),
};

function istrig(op) // is trigonometry
{
	return op == OType.SIN || op == OType.COS;
}


/*
 * Функции передаётся четыре возможных
 * набора значений:
 *
 * 1. null — в этом случае функция
 *    возвращает null
 * 2. Number — функция возвращает это
 *    число
 * 3. Array — тогда функция возвращает
 *    случайное целое число от ar[0] до
 *    ar[1] включительно
 * 4. function, args... — вызывается
 *    функция, переданное первым аргу-
 *    ментом, с аргументами args...
 */
function extract_value(obj)
{
	if(!obj)
		return null;

	if(typeof obj == 'number')
		return obj;

	if(Array.isArray(obj))
		return randint(obj[0], obj[1]);

	let args = [];
	for(let i = 1; i < arguments.length; ++i) 
		args.push(arguments[i]);

	return obj.apply(obj, args);
}

/*
 * В функцию подаётся карта весов, где каждому
 * ключу сопоставлен вес; вероятность выпадения
 * определённого ключа равна его весу,
 * делённому на сумму всех весов в карте;
 * функция возвращает выпавший ключ
 */
function choice(wmap)
{
	console.log(wmap);
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
	/*
	 * par : Expression (abstruct)
	 */

	costructor() {}


	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		throw 'Expression::latex() method is abstruct';
	}



	isvar() { return false; }
	iscao() { return false; }
	iso()   { return false; }

};





class Variable extends Expression
{
	/*
	 * name   : String
	 * par    : Expression
	 */

	constructor(name, par)
	{
		super();
		this.name = name || 'x';
		this.par  = par  || null;
	}

	latex()
	{
		return ' ' + this.name + ' ';
	}

	isvar() { return true; }
};





class CAOperation extends Expression
{
	/*
	 * op     : MultipleOperationType
	 * mems   : Array of Expression
	 * par    : Expression
	 */

	constructor(op, mems, par)
	{
		super();
		this.op   = op   || null;
		this.mems = mems || null;
		this.par  = par  || null;
		return;
	}

	iscao() { return true; }



	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		if(this.mems.length < 2)
			return this.mems[0].latex();

		let res = CAOLatex[this.op].fmt(this.mems[0].latex(), this.mems[1].latex());
		for(let i = 2; i < this.mems.length; ++i) 
			res = CAOLatex[this.op].fmt(res, this.mems[i].latex());
		return '\\left( ' + res + ' \\right)';
	}
};





class Operation extends Expression
{
	/*
	 * op     : UnaryOperationType
	 * mems   : Array of exprs
	 * param  : Number
	 * par    : Expression
	 */

	constructor(op, mems, param, par)
	{
		super();
		this.op    = op    || null;
		this.mems  = mems  || null;
		this.param = param || null;
		this.par   = par   || null;
		return;
	}

	iso() { return true; }



	/* transformation */
	/*
	 * Возвращает представление выражения в
	 * формате latex
	 */
	latex()
	{
		return OLatex[this.op](this);
	}
}
