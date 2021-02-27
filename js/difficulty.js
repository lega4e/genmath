/*
 * autor:    lis
 * created:  Feb 27 01:16:37 2021
 */





/*
 * Первый параметр — это множитель объёма,
 * второй — константное дополнение
 */
const ODifficulty = {
	'ADD' :  [0.9, 0.2], // for each member
	'MUL' :  [1.4, 1.0], // for each member

	'DIV'  : [1.6, 1.5], // for each member
	'EXP'  : [2.0, 2.0], // for each member

	'POW'  : [1.0, 1.0], 
	'ROOT' : [1.0, 1.2],
	'UDIV' : [1.2, 1.3],
	'UEXP' : [1.3, 1.2],

	'SIN'  : [1.1, 1.2],
	'COS'  : [1.1, 1.2],
	'TAN'  : [1.2, 1.5],
	'CTG'  : [1.2, 1.5],
	'ASIN' : [1.3, 1.8],
	'ACOS' : [1.3, 1.8],
	'ATAN' : [1.3, 1.7],

	'LOG'  : [1.1, 1.4],

	'POL'  : [0.0, 1.5], // 0 becouse pol has no members

	'FIG1' : [1.5, 1.5],
	'FIG2' : [1.7, 2.0],
	'FIG3' : [1.0, 2.5],
	'FIG4' : [1.2, 2.0],
	'FIG5' : [1.1, 1.6],
};





// functions
function calculate_direvative_difficulty(e) // -> double
{
	if(e.isvar())
		return 0.; // or one?

	var dch, k;
	switch(e.op)
	{
	case OType.POL:	
		let notnull = 0;
		for(let i = 0; i < e.param.length; ++i)
			notnull += e.param[i] != 0 ? 1 : 0;
		return [0, 1., 1.2, 1.5, 1.6, 1.7][notnull];

	case OType.ROOT:
		dch = calculate_direvative_difficulty(e.mems[0]);
		k = (e.param[0] == 2 ? 1 : 1.1) * (e.mems[0].op == OType.POW ? 0.6 : 1.0);
		return ODifficulty[e.op][0] * dch +  k * ODifficulty[e.op][1];

	case OType.POW:
		dch = calculate_direvative_difficulty(e.mems[0]);
		k = e.mems[0].op == OType.ROOT ? 0.6 :
				e.mems[0].op == OType.UDIV ? 0.5 : 1.0;
		return ODifficulty[e.op][0] * dch + k * ODifficulty[e.op][1];

	default:
		dch = 0.;
		for(let i = 0; i < e.mems.length; ++i)
			dch += calculate_direvative_difficulty(e.mems[i]);
		return dch * ODifficulty[e.op][0] + ODifficulty[e.op][1];
	}
}


/*
 * gen   : Generator
 * n     : int                       // число необходимых выражений
 * inter : [ double, double ]        // интервал сложности
 * depth : int or [ int, int, ... ]  
 */
function generate_expression_in_interval(gen, n, dfinter, depth) // -> [ [expr, difficulty], ... ]
{
	let exprs = []
	let count = 0;
	while(exprs.length != n)
	{
		gen.sets.depth = extract_value(depth);
		let e = gen.generate();
		let d = calculate_direvative_difficulty(e);

		if(d >= dfinter[0] && d <= dfinter[1])
			exprs.push([ e, d ]);

		if(++count > n * 64)
			throw `Error: can't gen expression with difficulty in [${dfinter[0]}, ${dfinter[1]}]`;
	}

	return exprs;
}





/* END */
