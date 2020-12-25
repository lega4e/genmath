/*
 * autor:    lis
 * created:  Dec 21 21:06:39 2020
 *
 * CAO — Commutative and Associative Operation
 * O — Operation
 */

'use strict'





const OType = {
	'ADD' : 'ADD',
	'MUL' : 'MUL',

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

const OPriors = {
	'ADD'  : 0,
	'MUL'  : 1,

	'DIV'  : 1,
	'EXP'  : 2,

	'POW'  : 2,
	'ROOT' : -1,
	'UDIV' : 1,
	'UEXP' : 2,
	'SIN'  : -1,
	'COS'  : -1,
};

const OTypeProbs = {
	'ADD'  : 0.7,
	'MUL'  : 2.5,

	'DIV'  : 1.0,
	'EXP'  : 0.3,

	'POW'  : 1.2,
	'ROOT' : 1.2,
	'UDIV' : 0.5,
	'UEXP' : 0.3,
	'SIN'  : 0.8,
	'COS'  : 0.8,
};

const OParams = {
	'ADD'  : null,
	'MUL'  : null,

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
	'ADD'  : 2,
	'MUL'  : 2,

	'DIV'  : 2,
	'EXP'  : 2,

	'POW'  : 1,
	'ROOT' : 1,
	'UDIV' : 1,
	'UEXP' : 1,
	'SIN'  : 1,
	'COS'  : 1,
};



function _priorless(o)
{
	if(o.par && OPriors[o.op] < OPriors[o.par.op])
		return true;
	return false;
}

function _ispower(o)
{
	return o.par && (
		o.par.op == OType.UEXP ||
		o.par.op == OType.EXP && o == o.par.mems[1]
	);
}

function _isbase(o)
{
	return o.par && (
		o.par.op == OType.POW ||
		o.par.op == OType.EXP && o == o.par.mems[0]
	);
}

const OLatex = {

	'ADD'  : (o) =>
	{
		let s = '%0 + %1'.fmt(
			o.mems[0].latex(), o.mems[1].latex()
		);
		return _priorless(o) && !_ispower(o) ? isolate(s) : s;
	},

	'MUL'  : (o) =>
	{
		let s = '%0 %1'.fmt(
			o.mems[0].latex(), o.mems[1].latex()
		);
		return _priorless(o) && !_ispower(o) ? isolate(s) : s;
	},


	'DIV'  : (o) =>
	{
		let s = '\\frac { %0 }{ %1 }'.fmt(
			o.mems[0].latex(), o.mems[1].latex()
		);
		return _priorless(o) && !_ispower(o) ? isolate(s) : s;
	},

	'EXP'  : (o) =>
	{
		let s = '%0 ^ { %1 }'.fmt(
			o.mems[0].latex(), o.mems[1].latex()
		);
		return _isbase(o) ? isolate(s) : s;
	},


	'POW'  : (o) =>
	{
		let s = '%0 ^ { %1 }'.fmt(
			o.mems[0].latex(), o.param
		);
		return _isbase(o) ? isolate(s) : s;
	},

	'ROOT' : (o) =>
	{
		let s = (o.param == 2 ?
			'\\sqrt{ %0 }' :
			'\\sqrt[%1]{ %0 }'
		).fmt( o.mems[0].latex(), o.param );
		return _isbase(o) ? isolate(s) : s;
	},

	'UDIV' : (o) =>
	{
		let s = '\\frac { %0 }{ %1 }'.fmt(
			o.param, o.mems[0].latex()
		);
		return _priorless(o) && !_ispower(o) ?  isolate(s) : s;
	},

	'UEXP' : (o) =>
	{
		let s = '%1 ^ { %0 }'.fmt(
			o.mems[0].latex(), o.param
		);
		return _isbase(o) ? isolate(s) : s;
	},

	'SIN'  : (o) =>
	{
		let s = o.mems[0].latex();
		if(o.mems[0].depth() > 1)
			return '\\sin ' + isolate(s);
		return _isbase(o) ? isolate('\\sin ' + s) : '\\sin ' + s;
	},

	'COS'  : (o) =>
	{
		let s = o.mems[0].latex();
		if(o.mems[0].depth() > 1)
			return '\\cos ' + isolate(s);
		return _isbase(o) ? isolate('\\cos ' + s) : '\\cos ' + s;
	},

};

function isolate(s)
{
	return '\\left( ' + s + '\\right)';
}

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

	depth()
	{
		throw 'Expression::depth() method is abstruct';
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

	depth()
	{
		return 0;
	}

	isvar() { return true; }
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

	depth()
	{
		let m = 0;
		for(let i = 0; i < this.mems.length; ++i)
			m = max(m, this.mems[i].depth());
		return m+1;
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





/* END */
