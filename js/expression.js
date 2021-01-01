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
	'TAN'  : 'TAN',
	'CTG'  : 'CTG',
	'ASIN' : 'ASIN',
	'ACOS' : 'ACOS',
	'ATAN' : 'ATAN',

	'LOG'  : 'LOG',
};

const OPriors = {
	'ADD'  : 0,
	'MUL'  : 1,

	'DIV'  : -1,
	'EXP'  : 2,

	'POW'  : 2,
	'ROOT' : -1,
	'UDIV' : 1,
	'UEXP' : 2,

	'SIN'  : -1,
	'COS'  : -1,
	'TAN'  : -1,
	'CTG'  : -1,
	'ASIN' : -1,
	'ACOS' : -1,
	'ATAN' : -1,

	'LOG'  : -1,
};

const OTypeProbs = {
	'ADD'  : 0.7,
	'MUL'  : 2.0,

	'DIV'  : 1.0,
	'EXP'  : 0.2,

	'POW'  : 1.2,
	'ROOT' : 1.2,
	'UDIV' : 0.5,
	'UEXP' : 0.2,

	'SIN'  : 0.3,
	'COS'  : 0.3,

	'TAN'  : 0.1,
	'CTG'  : 0.1,
	'ASIN' : 0.03,
	'ACOS' : 0.03,
	'ATAN' : 0.03,

	'LOG'  : 0.4,
};

const OParams = {
	'ADD'  : (o) => {
		let param = [];
		for(let i = 0; i < o.argc; ++i)
			param.push( Math.random() < 0.66 ? '+' : '-' );
		return param;
	},
	'MUL'  : null,

	'DIV'  : null,
	'EXP'  : null,

	'POW'  : [2, 3, 4, 5, 6, 7, 8, 9, 10],
	'ROOT' : () => {
		return Math.random() < 0.7 ? 2 :
			Math.random() < 0.5 ? 3 : randint(4, 9);
	},
	'UDIV' : () => {
		return Math.random() < 0.75 ? 1 : randint(2, 9);
	},
	'UEXP' : [2, 3, 4, 5, 6, 7, 8, 9, 10],

	'SIN'  : null,
	'COS'  : null,

	'TAN'  : null,
	'CTG'  : null,
	'ASIN' : null,
	'ACOS' : null,
	'ATAN' : null,

	'LOG'  : () => {
		return Math.random() < 0.7 ?
			Math.E : Math.random() < 0.5 ?
			2 : randint(3, 9);
	}
};

const OArgsCount = {
	'ADD'  : () => {
		return Math.random() < 0.66 ? 2 :
			Math.random() < 0.5 ? 3 : 4;
	},
	'MUL'  : () => {
		return Math.random() < 0.75 ? 2 : 3;
	},

	'DIV'  : 2,
	'EXP'  : 2,

	'POW'  : 1,
	'ROOT' : 1,
	'UDIV' : 1,
	'UEXP' : 1,

	'SIN'  : 1,
	'COS'  : 1,

	'TAN'  : 1,
	'CTG'  : 1,
	'ASIN' : 1,
	'ACOS' : 1,
	'ATAN' : 1,

	'LOG'  : 1,
};

const OOrder = {
	'UEXP' : 0,
	'EXP'  : 1,
	'VAR'  : 2,
	'POW'  : 3,

	'SIN'  : 4,
	'COS'  : 5,
	'TAN'  : 6,
	'CTG'  : 7,
	'ASIN' : 8,
	'ACOS' : 9,
	'ATAN' : 10,
	'LOG'  : 11,

	'ROOT' : 12,
	'ADD'  : 13,
	'UDIV' : 14,
	'DIV'  : 15,
};

function default_coef_distribution()
{
	return Math.random() < 0.66 ? 1 :
		(Math.random() < 0.8 ? 1 : -1) * randint(1, 9);
}

const OCoef = {
	'VAR'  : default_coef_distribution,
	'ADD'  : 1,
	'MUL'  : default_coef_distribution,

	'DIV'  : 1,
	'EXP'  : default_coef_distribution,

	'POW'  : default_coef_distribution,
	'ROOT' : default_coef_distribution,
	'UDIV' : 1,
	'UEXP' : 1,

	'SIN'  : default_coef_distribution,
	'COS'  : default_coef_distribution,
	'TAN'  : default_coef_distribution,
	'CTG'  : default_coef_distribution,
	'ASIN' : default_coef_distribution,
	'ACOS' : default_coef_distribution,
	'ATAN' : default_coef_distribution,

	'LOG'  : default_coef_distribution,
}



function coef2str(c)
{
	return c == 1 ? '' : c == -1 ? '-' : c.toString();
}

function latex_without_coef(o, is)
{
	if(is !== false)
	{
		let c = o.coef;
		o.coef = 1;
		let s = o.latex();
		o.coef = c;
		return s;
	}
	return o.latex();
}

const OLatex = {

	'ADD'  : (o) =>
	{
		let s = o.mems[0].latex();
		let sep;
		for(let i = 1; i < o.mems.length; ++i)
		{
			sep = o.mems[i].coef < 0 ? ' ' : ' %0 '.fmt(o.param[i]);
			s += sep + o.mems[i].latex();
		}
		return s;
	},

	'MUL'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0]);
		if(o.mems[0].op == OType.ADD)
			s = isolate(s);

		let sep;
		for(let i = 1; i < o.mems.length; ++i)
		{
			if(
				isfun(o.mems[i-1].op) || o.mems[i-1].op == OType.ROOT ||
				(o.mems[i-1].op == OType.POW && isfun(o.mems[i-1].mems[0].op))
			)
				sep = ' \\cdot '
			else
				sep = ' ';

			let ss = latex_without_coef(o.mems[i]);
			if(o.mems[i].op == OType.ADD)
				s += sep + isolate(ss);
			else
				s += sep + ss;
		}

		if(o.coef != 1 && o.mems[0].op == OType.UEXP)
			return o.coef + ' \\cdot ' + s;
		return coef2str(o.coef) + s;
	},


	'DIV'  : (o) =>
	{
		return '\\frac { %0 }{ %1 }'.fmt(
			o.mems[0].latex(), o.mems[1].latex()
		);
	},

	'EXP'  : (o) =>
	{
		return coef2str(o.coef) + '%0 ^ { %1 }'.fmt(
			o.mems[0].isvar() ?
				latex_without_coef(o.mems[0]) :
				isolate(latex_without_coef(o.mems[0])),
			latex_without_coef(o.mems[1])
		);
	},


	'POW'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0]);

		if(isfun(o.mems[0].op))
		{
			let pos = s.indexOf(' ');
			if(pos < 0)
				throw 'pos of space less then 0';
			return coef2str(o.coef) + s.slice(0, pos) + ' ^{%0} '.fmt(o.param) + s.slice(pos+1);
		}

		if(o.mems[0].isvar())
			return coef2str(o.coef) + s + ' ^{ %0 } '.fmt(o.param);

		return coef2str(o.coef) + '%0 ^ { %1 }'.fmt( isolate(s), o.param );
	},

	'ROOT' : (o) =>
	{
		return coef2str(o.coef) + (o.param == 2 ?
			'\\sqrt{ %0 }' :
			'\\sqrt[%1]{ %0 }'
		).fmt( o.mems[0].latex(), o.param );
	},

	'UDIV' : (o) =>
	{
		return '\\frac { %0 }{ %1 }'.fmt(
			o.param, o.mems[0].latex()
		);
	},

	'UEXP' : (o) =>
	{
		return '%1 ^ { %0 }'.fmt(
			o.mems[0].latex(), o.param
		);
	},


	'SIN'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\sin ' + isolate(s);
		return coef2str(o.coef) + '\\sin ' + s;
	},

	'COS'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\cos ' + isolate(s);
		return coef2str(o.coef) + '\\cos ' + s;
	},


	'TAN'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\tan ' + isolate(s);
		return coef2str(o.coef) + '\\tan ' + s;
	},

	'CTG'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\cot ' + isolate(s);
		return coef2str(o.coef) + '\\cot ' + s;
	},

	'ASIN' : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\arcsin ' + isolate(s);
		return coef2str(o.coef) + '\\arcsin ' + s;
	},

	'ACOS' : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\arccos ' + isolate(s);
		return coef2str(o.coef) + '\\arccos ' + s;
	},

	'ATAN' : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return coef2str(o.coef) + '\\arctan ' + isolate(s);
		return coef2str(o.coef) + '\\arctan ' + s;
	},


	'LOG'  : (o) =>
	{
		let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
		let f = o.param == Math.E ?
			coef2str(o.coef) + '\\ln ' :
			coef2str(o.coef) + '\\log _{ %0 }'.fmt(o.param);
		if(o.mems[0].depth() > 1 || o.mems[0].coef != 1)
			return f + ' ' + isolate(s);
		return f + ' ' + s;
	},

};

function isolate(s)
{
	return '\\left( ' + s + '\\right)';
}

function istrig(op) // is trigonometry
{
	return op == OType.SIN  || op == OType.COS  ||
		   op == OType.TAN  || op == OType.CTG  ||
		   op == OType.ASIN || op == OType.ACOS ||
		   op == OType.ATAN;
}

function isfun(op)
{
	return istrig(op) || op == OType.LOG;
}

function expression_cmp(lhs, rhs)
{
	let lhsor = lhs.isvar() ? OOrder['VAR'] : OOrder[lhs.op];
	let rhsor = rhs.isvar() ? OOrder['VAR'] : OOrder[rhs.op];

	return lhsor == rhsor ? 0 :
		lhsor < rhsor ? -1 : 1;
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
	if(obj === null)
		return null;

	if(typeof obj == 'number')
		return obj;

	if(Array.isArray(obj))
		return obj[ randint(0, obj.length-1) ];

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
	isop()  { return false; }

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
		this.coef = 1;
		this.argc = 0;
	}

	latex()
	{
		return ' ' + coef2str(this.coef) + this.name + ' ';
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
		this.coef  = 1;
		this.argc  = 0;
		return;
	}

	depth()
	{
		let m = 0;
		for(let i = 0; i < this.mems.length; ++i)
			m = max(m, this.mems[i].depth());
		return m+1;
	}

	isop() { return true; }



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
