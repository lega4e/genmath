/*
 * autor:    lis
 * created:  Dec 21 21:06:39 2020
 *
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

	'POL'  : 'POL',

	'FIG1' : 'FIG1',
	/*
	 * Formula: 
	 *   (C - f(x))*(C + k*f(x))
	 * Params:
	 *   [ C, k, '-' | '+' ]
	 * Limits:
	 *   depth <= 2
	 */

	'FIG2' : 'FIG2',
	/*
	 * Formula:
	 *   (C + f(x))/(C - f(x))
	 * Params:
	 *   [ C, '+' | '-', 'F' | 'C' ]
	 *   (второй параметр отвечает за расстановку
	 *    знаков функции; третий — будет ли менять знак
	 *    функция или константа)
	 * Limits:
	 *   depth <= 2
	 */

	'FIG3' : 'FIG3',
	/*
	 * Formula:
	 *   root[a]( f(x) + root[b](g(x)) )
	 * Params:
	 *   [ a, b, '+' | '-' ]
	 * Limits:
	 *   depth <= 3
	 */

	'FIG4' : 'FIG4',
	/*
	 * Formula:
	 *   ( f(x) + C )^a - ( f(x) - C )^a // (root)
	 * Params:
	 *   [ 'POW' | 'ROOT', C, a, '+' | '-', '-' | '+', 'F' | 'C' ]
	 * Limits:
	 *   depth <= 2
	 */

	'FIG5' : 'FIG5',
	/*
	 * Formula:
	 *   C + (B + f(x))^a // (root) 
	 * Params:
	 *   [ 'POW' | 'ROOT', C, B, a, '+' | '-', '+' | '-' ]
	 * Limits:
	 *   depth <= 3
	 */
};

/*
 * Число показывает, сколько уровней глубины
 * должно остаться, чтобы операцию можно было
 * использовать (т.е., если число — 2, то
 * операцию можно использовать, только если
 * текущая глубина не больше двух; -1
 * означает любую глубину)
 */
const ODepthLimits = {
	'ADD'  : -1,
	'MUL'  : -1,

	'DIV'  : -1,
	'EXP'  : -1,

	'POW'  : -1,
	'ROOT' : -1,
	'UDIV' : -1,
	'UEXP' : -1,

	'SIN'  : -1,
	'COS'  : -1,
	'TAN'  : -1,
	'CTG'  : -1,
	'ASIN' : -1,
	'ACOS' : -1,
	'ATAN' : -1,

	'LOG'  : -1,

	'POL'  : 2,

	'FIG1' : 2,
	'FIG2' : 2,
	'FIG3' : 3,
	'FIG4' : 2,
	'FIG5' : 3,
};

/*
 * Карта вероятностей появления
 * разных операций
 */
const OProbs = {
	'ADD'  : 0.7,
	'MUL'  : 1.0,

	'DIV'  : 1.0,
	'EXP'  : 1.0,

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

	'POL'  : 2.0,

	'FIG1' : 0.2,
	'FIG2' : 0.2,
	'FIG3' : 0.2,
	'FIG4' : 0.2,
	'FIG5' : 0.2,
};

/*
 * Генерация параметров для операций;
 * предполагает использование функции
 * extract_value
 */
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
	'UDIV' : 1,
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
	},

	'POL'  : () => {
		let maxpower = randint(3, 8);
		let count    = choice( {
			2 : 0.7,
			3 : 0.3
		} );

		let elements = [];
		let param    = [];
		for(let i = 0; i < maxpower; ++i)
		{
			elements.push(i);
			param.push(0);
		}
		shuffle(elements);

		let gcdres;
		for(let i = 0; i < count; ++i)
		{
			do
			{
				param[ elements[i] ] = 
					( Math.random() < 0.66 ? 1 : -1 ) * randint(1, 9);
				
				gcdres = Math.abs(param[ elements[0] ]);
				for(let j = 1; j <= i; ++j)
					gcdres = gcd(gcdres, Math.abs(param[elements[j]]));
			}
			while(gcdres != 1 && i != 0);
		}

		return param;
	},

	'FIG1' : () => {
		let p = [];
		p.push( Math.random() < 0.8 ? 1 : randint(2, 9) );
		p.push( randint(2, 9) );
		p.push( Math.random() < 0.5 ? '-' : '+' );
		return p;
	},
	'FIG2' : () => {
		let p = [];
		p.push( Math.random() < 0.8 ? 1   : randint(2, 9) );
		p.push( Math.random() < 0.5 ? '-' : '+'           );
		p.push( Math.random() < 0.5 ? 'F' : 'C'           );
		return p;
	},
	'FIG3' : () => {
		let p = [];
		p.push( Math.random() < 0.75 ? 2   : randint(3, 9) );
		p.push( Math.random() < 0.75 ? 2   : randint(3, 9) );
		p.push( Math.random() < 0.5  ? '-' : '+'           );
		return p;
	},
	'FIG4' : () => {
		let p = [];
		p.push( Math.random() < 0.66 ? 'POW' : 'ROOT'        );
		p.push( Math.random() < 0.8  ? 1     : randint(2, 9) );
		p.push( Math.random() < 0.75 ? 2     : randint(3, 9) );
		p.push( Math.random() < 0.5  ? '-'   : '+'           );
		p.push( Math.random() < 0.5  ? '-'   : '+'           );
		p.push( Math.random() < 0.5  ? 'F'   : 'C'           );
		return p;
	},
	'FIG5' : () => {
		let p = [];
		p.push( Math.random() < 0.5  ? 'POW' : 'ROOT'        );
		p.push( Math.random() < 0.5  ? 0     : randint(1, 9) );
		p.push( Math.random() < 0.8  ? 1     : randint(2, 9) );
		p.push( Math.random() < 0.75 ? 2     : randint(3, 9) );
		p.push( Math.random() < 0.5  ? '-'   : '+'           );
		p.push( Math.random() < 0.5  ? '-'   : '+'           );
		return p;
	},
};

/*
 * Сопоставление каждой операции числу
 * аргументов, которая она должна принимать;
 * операции сложения и умножения имеют переменное
 * число аргументов
 */
const OArgsCount = {
	'ADD'  : () => {
		return Math.random() < 0.66 ? 2 : 3;
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

	'POL'  : 0,

	'FIG1' : 1,
	'FIG2' : 1,
	'FIG3' : 2,
	'FIG4' : 1,
	'FIG5' : 1,
};

/*
 * Упорядочивание операций, когда они
 * являются слагаемыми или множителями
 */
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

	'FIG1' : 16,
	'FIG2' : 17,
	'FIG3' : 18,
	'FIG4' : 19,
	'FIG5' : 20,

	'POL'  : 21,
};

/*
 * Стандартная функция для генерации
 * коэффициента выражения
 */
function default_coef_distribution()
{
	return Math.random() < 0.66 ? 1 :
		(Math.random() < 0.8 ? 1 : -1) * randint(1, 9);
}

/*
 * Ассоциация операций и генерации для них
 * коэффициентов (предполагается использование
 * функции extract_value)
 */
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

	'POL'  : 1,

	'FIG1' : 1,
	'FIG2' : 1,
	'FIG3' : 1,
	'FIG4' : 1,
	'FIG5' : 1,

};



/*
 * Функция для преобразование коэффициента в
 * latex-строку 
 */
function coef2str(c)
{
	return c == 1 ? '' : c == -1 ? '-' : c.toString();
}

/*
 * Возвращает latex-строку, полученную из
 * операции o без коэффициента (при этом он
 * сохраняется в операции, и она не изменяется);
 * второй аргумент может выключить эффект 
 * функции: если передано значение false, то
 * возвращается latex-строка, сгенерированная
 * с коэффициентом
 */
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

function latex_with_abs_coef(o, is)
{
	if(is !== false)
	{
		let c = o.coef;
		o.coef = Math.abs(c);
		let s = o.latex();
		o.coef = c;
		return s;
	}
	return o.latex();
}

function default_function_to_latex(o, funname)
{
	let s = latex_without_coef(o.mems[0], isfun(o.mems[0].op))
	if(
		o.mems[0].depth() > 1     || o.mems[0].coef != 1 ||
		o.mems[0].isop() && (
			o.mems[0].op == OType.ADD || o.mems[0].op == OType.MUL ||
			o.mems[0].op == OType.POL || isfig(o.mems[0].op)
		)
	)
		return coef2str(o.coef) + funname + ' ' + isolate(s);
	return coef2str(o.coef) + funname + ' ' + s;
}

/*
 * Сопоставление каждой операции функции,
 * генерирующей latex-строку
 */
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
		if(o.mems[0].op == OType.ADD || o.mems[0].op == OType.POL)
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
			if(o.mems[i].op == OType.ADD || o.mems[0].op == OType.POL)
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
		).fmt( latex_without_coef(o.mems[0]), o.param );
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
		return default_function_to_latex(o, '\\sin');
	},

	'COS'  : (o) =>
	{
		return default_function_to_latex(o, '\\cos');
	},


	'TAN'  : (o) =>
	{
		return default_function_to_latex(o, '\\tan');
	},

	'CTG'  : (o) =>
	{
		return default_function_to_latex(o, '\\cot');
	},

	'ASIN' : (o) =>
	{
		return default_function_to_latex(o, '\\arcsin');
	},

	'ACOS' : (o) =>
	{
		return default_function_to_latex(o, '\\arccos');
	},

	'ATAN' : (o) =>
	{
		return default_function_to_latex(o, '\\arctan');
	},


	'LOG'  : (o) =>
	{
		return default_function_to_latex(
			o, o.param == Math.E ? '\\ln' : '\\log_{%0}'.fmt(o.param)
		);
	},


	'POL'  : (o) =>
	{
		let s = null;
		let add;
		for(let i = o.param.length-1; i >= 0; --i)
		{
			if(o.param[i] == 0)
				continue;

			add = ( i == 0 ? o.param[i].toString() : coef2str(o.param[i]) ) +
			      ( i == 0 ? '' : i == 1 ? 'x' : 'x^{ %0 }'.fmt(i) );
			if(s === null)
				s = add;
			else
				s += (o.param[i] > 0 ? ' + ' : '') + add;
		}
		return s;
	},


	'FIG1' : (o) =>
	{
		return (
			isolate(
				o.param[0] + ' ' +
				o.param[2] + ' ' +
				latex_without_coef(o.mems[0])
			) +
			isolate(
				o.param[0] + ' ' +
				(o.param[2] == '-' ? '+' : '-') + ' ' +
				o.param[1] + ' ' + (o.mems[0].op == OType.UEXP ? '\\cdot' : '') +
				latex_without_coef(o.mems[0])
			)
		);
	},

	'FIG2' : (o) =>
	{
		return o.param[2] == 'F' ?
			'\\frac{ %0 }{ %1 }'.fmt(
				o.param[0] + ' ' +
				o.param[1] + ' ' +
				latex_with_abs_coef(o.mems[0]),
				o.param[0] + ' ' +
				(o.param[1] == '-' ? '+' : '-') + ' ' +
				latex_with_abs_coef(o.mems[0])
			) :
			'\\frac{ %0 }{ %1 }'.fmt(
				latex_with_abs_coef(o.mems[0]) +
				o.param[1] + ' ' +
				o.param[0] + ' ',
				latex_with_abs_coef(o.mems[0]) +
				(o.param[1] == '-' ? '+' : '-') + ' ' +
				o.param[0] + ' '
			);
	},

	'FIG3' : (o) =>
	{
		return '\\sqrt%0{ %1 %2 %5\\sqrt%3{ %4 } }'.fmt(
			o.param[0] == 2 ? '' : '[%0]'.fmt(o.param[0]),
			o.mems[0].latex(),
			o.param[2],
			o.param[1] == 2 ? '' : '[%0]'.fmt(o.param[1]),
			latex_without_coef(o.mems[1]),
			coef2str(Math.abs(o.mems[1].coef))
		);
	},

	'FIG4' : (o) =>
	{
		return o.param[0] == 'POW' ?
			(o.param[5] == 'F' ?
				isolate('%0 %1 %2') + '^{ %3 } %4 ' + isolate('%0 %5 %2') + '^{ %3 }' :
				isolate('%2 %1 %0') + '^{ %3 } %4 ' + isolate('%2 %5 %0') + '^{ %3 }'
			).fmt(
				latex_with_abs_coef(o.mems[0]),
				o.param[3],
				o.param[1],
				o.param[2],
				o.param[4],
				o.param[3] == '-' ? '+' : '-'
			) :
			(o.param[5] == 'F' ?
				'\\sqrt%3{ %0 %1 %2 } %4 \\sqrt%3{ %0 %5 %2 }' :
				'\\sqrt%3{ %2 %1 %0 } %4 \\sqrt%3{ %2 %5 %0 }'
			).fmt(
				latex_with_abs_coef(o.mems[0]),
				o.param[3],
				o.param[1],
				o.param[2] == 2 ? '' : '[%0]'.fmt(o.param[2]),
				o.param[4],
				o.param[3] == '-' ? '+' : '-'
			);
	},

	'FIG5' : (o) =>
	{
		return o.param[0] == 'ROOT' ?
			(
				(o.param[1] == 0 ? '' : '%4 %5 ') +
				isolate('%0 %1 %2') + '^{%3}'
			).fmt(
				o.param[2],
				o.param[4],
				latex_with_abs_coef(o.mems[0]),
				o.param[3],
				o.param[1],
				o.param[5]
			) :
			(
				(o.param[1] == 0 ? '' : '%4 %5 ') +
				'\\sqrt%3{ %0 %1 %2 }'
			).fmt(
				o.param[2],
				o.param[4],
				latex_with_abs_coef(o.mems[0]),
				o.param[3] == 2 ? '' : '[%0]'.fmt(o.param[3]),
				o.param[1],
				o.param[5]
			);
	},
};

/*
 * Вспомогательная функция, которая заключает
 * latex-строку в скобки
 */
function isolate(s)
{
	return '\\left( ' + s + '\\right)';
}

/*
 * Проверяет, является ли операция op
 * тригонометрической функцией
 */
function istrig(op) // is trigonometry
{
	return op == OType.SIN  || op == OType.COS  ||
		   op == OType.TAN  || op == OType.CTG  ||
		   op == OType.ASIN || op == OType.ACOS ||
		   op == OType.ATAN;
}

/*
 * Проверяет, является ли операция op функцией
 */
function isfun(op)
{
	return istrig(op) || op == OType.LOG;
}

function isfig(op)
{
	return op.slice(0, 3) == 'FIG';
}

/*
 * Сравнивает операции lhs и rhs согласно
 * порядку из OOrder
 */
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
 *    случайно выбранный элемент массива
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





/*
 * Абстракный класс для переменной и операции
 */
class Expression
{
	/*
	 * par  : Expression
	 * coef : Number
	 * argc : Number
	 */
	costructor(par, coef, argc)
	{
		this.par  = par  || null;
		this.coef = coef || 1;
		this.argc = argc || 0;
		return;
	}


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
	 * par    : Expression
	 * coef   : Number
	 * argc   : Number
	 * name   : String
	 */

	constructor(par, name)
	{
		super();
		this.par  = par  || null;
		this.coef = 1;
		this.argc = 0;
		this.name = name || 'x';
		return;
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
	 * par    : Expression
	 * coef   : Number
	 * argc   : Number
	 * op     : UnaryOperationType
	 * mems   : Array of exprs
	 * param  : Number or Array
	 */

	/*
	 * Конструктор на вход принимает словарь арументов:
	 * par, coef, argc, op, mems, param
	 */
	constructor(a)
	{
		super();
		a = a || {};
		this.par   = a.par   || null;
		this.coef  = a.coef  || 1;
		this.argc  = a.argc  || 0;
		this.op    = a.op    || null;
		this.mems  = a.mems  || null;
		this.param = a.param || null;
		return;
	}

	latex()
	{
		return OLatex[this.op](this);
	}

	depth()
	{
		let m = 0;
		for(let i = 0; i < this.mems.length; ++i)
			m = max(m, this.mems[i].depth());
		return m+1;
	}

	isop() { return true; }
};





/* END */
