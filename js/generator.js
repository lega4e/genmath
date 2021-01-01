/*
 * autor:    lis
 * created:  Dec 21 21:20:03 2020
 */

'use strict'





/*
 * Карта, которая содержит информацию о том,
 * какие есть узлы в выражении и в каких
 * отношениях они находятся к добавляемому
 * дочернему узлу установленного
 *
 * 1. Установленный узел всегда имеет глубину
 *    1 и сродство 0 (так как является родителем для
 *    добавляемого)
 * 2. Узел, дочерний к установленному, но не
 *    являющийся добавляемым (т.е. брат добав-
 *    ляемого) имеет всегда глубину 0 (так как
 *    находится на том же уровне, что и добав-
 *    ляемый) и сродство 1 (так как у них
 *    один отец)
 * 3. С постепенным углублением сродство
 *    добавляемого элемента с братьями
 *    предыдущих добавляемых падает на единицу
 *    за каждый уровень глубины; но предки
 *    добавляемого всегда имеют сродство 0
 */
class DAMap
{
	constructor() {}
};

/*
 * Вычисляет карту родста для выражения,
 * которое будет дочерним для expr
 */
function calculate_map(expr)
{
	if(!expr)
		return null;

	let depth = 1;
	let map = new DAMap;
	while(expr)
	{
		if(!map[expr.op])
			map[expr.op] = [];
		map[expr.op].push( make_dpaf(depth, 0) );

		for(let i = 0; i < expr.mems.length; ++i)
			_calculate_map_downprop(map, expr.mems[i], depth-1, 1);
		
		expr = expr.par;
		++depth;
	}

	return map;
}

function _calculate_map_downprop(map, expr, depth, affinity)
{
	if(!expr.mems || !expr.op)
	{
		if(expr.isvar())
		{
			if(!map.VAR)
				map.VAR = [];
			map.VAR.push( make_dpaf(depth, affinity) );
			return;
		}
		else
			throw '!expr.isvar but !expr.mems';
	}

	if(!map[expr.op])
		map[expr.op] = [];
	map[expr.op].push( make_dpaf(depth, affinity) );

	for(let i = 0; i < expr.mems.length; ++i)
		_calculate_map_downprop(map, expr.mems[i], depth-1, affinity+1);
	return;
}





function create_variable(name)
{
	name = name || 'x';
	return new Variable(name);
}

function make_dpaf(depth, affinity)
{
	return {
		'depth'    : depth,
		'affinity' : affinity
	};
}

function _clone_probs(probs)
{
	let cp = {};
	for(let el in probs)
		cp[el] = probs[el];
	return cp;
}

function calculate_probs(map, parexpr, depth)
{
	function isstrict(op)
	{
		return (
			op == OType.ADD  || op == OType.MUL  ||
			op == OType.POW  || op == OType.ROOT ||
			op == OType.DIV  || op == OType.UDIV ||
			op == OType.UEXP || op == OType.EXP
		);
	}

	function calculate_strict(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - dpaf.affinity/10.0 );

		switch(dp)
		{
			case 0: case 1:
				return 1.0 - k;
			case 2:
				return 1.0 - k*0.9;
			case 3:
				return 1.0 - k*0.8;
			default:
				return 1.0 - 4*k/dp/3;
		}
	}

	function calculate_soft(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - dpaf.affinity/10.0 );

		if(dp == 0)
			return 1.0 - k;
		if(dp == 1)
			return 1.0 - k*0.95;
		return 1.0 - 5*k/(dp*3);
	}

	let probs = _clone_probs(OTypeProbs);
	let mult, selfmult;
	for(let op in map)
	for(let i = 0; i < map[op].length; ++i)
	{
		mult = isstrict(op) ?
			calculate_strict(map[op][i]) :
			calculate_soft(map[op][i]);

		if(
			map[op][i].affinity == 1 &&
			map[op][i].depth == 0 && parexpr &&
			( parexpr.op == OType.MUL ||
			  parexpr.op == OType.ADD ||
			  parexpr.op == OType.DIV )
		)
			selfmult = 0;
		else
			selfmult = mult;
				


		if(isfun(op))
		{
			for(let pr in probs)
			{
				if(isfun(pr))
				{
					if(pr == op)
						probs[pr] *= selfmult;
					else
						probs[pr] *= mult + (1 - mult)*2/3;
				}
			}

			if(op == OType.SIN)
				probs[OType.ASIN] *= mult;
			else if(op == OType.COS)
				probs[OType.ACOS] *= mult;
			else if(op == OType.TAN)
				probs[OType.ATAN] *= mult;

			if(op[0] == 'A')
			{
				probs[OType.ASIN] *= mult;
				probs[OType.ACOS] *= mult;
				probs[OType.ATAN] *= mult;
			}
		}
		else if(op == OType.MUL)
		{
			probs[OType.MUL]  *= selfmult;
			probs[OType.UDIV] *= mult;
			probs[OType.DIV]  *= mult;
		}
		else if(op == OType.EXP || op == OType.UEXP)
		{
			probs[OType.EXP]  *= op == OType.EXP  ? selfmult : mult;
			probs[OType.UEXP] *= op == OType.UEXP ? selfmult : mult;
			probs[OType.POW]  *= mult;
		}
		else if(op == OType.DIV || op == OType.UDIV)
		{
			probs[OType.DIV]  *= op == OType.DIV  ? selfmult : mult;
			probs[OType.UDIV] *= op == OType.UDIV ? selfmult : mult;
		}
		else if(op == 'VAR')
		{
			if(map[op][i].affinity == 1 && depth <= 2)
			{
				probs[OType.ADD]  = 0;
				probs[OType.MUL]  = 0;
				probs[OType.DIV]  = 0;
				probs[OType.UDIV] = 0;
				probs[OType.POW]  = 0;
				probs[OType.EXP]  = 0;
			}
		}
		else
			probs[op] *= mult;
	}

	return probs;
}





function generate_expression(depth, parexpr)
{
	if(depth <= 0)
		return create_variable();

	let map = calculate_map(parexpr);
	let expr = new Operation;
	let probs = calculate_probs(map, parexpr, depth);

	let argc;
	do
	{
		expr.op = choice(probs);
		argc = extract_value(OArgsCount[expr.op]);
	}
	while(depth - argc < 0);
	expr.par = parexpr || null;

	expr.param = extract_value(OParams[expr.op]);
	let grand = false;
	if(
		parexpr &&
		(
			(
				parexpr.op == OType.ROOT && expr.op == OType.POW ||
				parexpr.op == OType.POW  && expr.op == OType.ROOT
			) ||
			( 
				(grand = true) &&
				( parexpr.op == OType.ADD  ||
				  parexpr.op == OType.MUL  ||
				  parexpr.op == OType.DIV  ||
				  parexpr.op == OType.UDIV ) &&
				parexpr.par &&
				( parexpr.par.op == OType.ROOT && expr.op == OType.POW ||
				  parexpr.par.op == OType.POW  && expr.op == OType.ROOT )
			)
		)
	)
	{
		let c = 0;
		while( gcd(grand ? parexpr.par.param : parexpr.param, expr.param) != 1 )
		{
			expr.param = extract_value(OParams[expr.op]);
			if(++c == 64)
				throw 'c == 64 while generating param';
		}
	}

	expr.mems = [];
	if(argc == 0)
		return expr;

	let dp = [ depth - 1 ];
	for(let i = 1; i < argc; ++i)
	{
		let c = Math.random();
		dp.push( depth - 1 + ( c < 0.2 ? 0 : c < 0.9 ? -1 : -2 ) );
	}

	if(expr.op == OType.ADD || expr.op == OType.MUL || expr.op == OType.DIV)
		dp.sort();

	for(let i = 0; i < argc; ++i) 
		expr.mems.push( generate_expression(dp[i], expr) );

	if(expr.op == OType.MUL || expr.op == OType.ADD)
		expr.mems.sort(expression_cmp);
	else
		shuffle(expr.mems);

	return expr;
}





/* END */
