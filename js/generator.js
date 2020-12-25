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

function choice_otype(map, depth)
{
	function isstrict(op)
	{
		return (
			op == OType.POW  || op == OType.ROOT ||
			op == OType.UDIV || op == OType.UEXP ||
			op == OType.EXP
		);
	}

	function calculate_strict(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - dpaf.affinity/10.0 );

		switch(dp)
		{
			case 0: case 1: case 2:
				return 1.0 - k;
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

		if(dp == 0 || dp == 1)
			return 1.0 - k*0.85;
		else
			return 1.0 - 3*k/dp/2;
	}

	function calculate_very_soft(dpaf)
	{
		let dp = Math.abs(dpaf.depth);
		let k = max( 0.0, 1.0 - dpaf.affinity/5.0 );

		if(dp == 0 || dp == 1)
			return 1.0 - k*0.7;
		else
			return 1.0 - k/dp;
	}

	let probs = _clone_probs(OTypeProbs);
	let mult;
	for(let op in map)
	for(let i = 0; i < map[op].length; ++i)
	{
		if(isstrict(op))
		{
			mult = calculate_strict(map[op][i]);
			if(op == OType.EXP || op == OType.UEXP)
			{
				probs[OType.EXP]  *= mult;
				probs[OType.UEXP] *= mult;
				probs[OType.POW]  *= 1 - 2*(1 - mult)/3;
			}
			else if(op == OType.UDIV)
			{
				probs[OType.UDIV] *= mult;
				probs[OType.DIV]  *= mult;
			}
			else
			{
				probs[op] *= mult;
			}
		}
		else
		{
			mult = op == OType.ADD || op == OType.MUL ?
				calculate_very_soft(map[op][i]) :
				calculate_soft(map[op][i]);

			if(istrig(op))
			{
				for(let pr in probs)
				{
					if(istrig(pr))
					{
						if(pr == op)
							probs[pr] *= mult;
						else
							probs[pr] *= 1 - (1 - mult)/2; // TODO: set to trig count
					}
				}
			}
			if(op == OType.DIV)
			{
				probs[OType.DIV]  *= mult;
				probs[OType.UDIV] *= calculate_strict(map[op][i]);
			}
			else if(op == 'VAR')
			{
				if(depth == 1)
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
	}

	let res = choice(probs);
	return res;
}





function generate_expression(depth, parexpr)
{
	if(depth <= 0)
		return create_variable();

	let map = calculate_map(parexpr);
	let expr = new Operation;

	do
	{
		expr.op = choice_otype(map, depth);
	}
	while(depth - OArgsCount[expr.op] < 0)
	expr.par = parexpr || null;

	let argc = OArgsCount[expr.op];
	expr.mems = [];

	let dp = [];
	for(let i = 0; i < argc; ++i)
		dp.push(depth-(argc-i));
	if(expr.op != OType.ADD && expr.op != OType.MUL && expr.op != OType.DIV)
		shuffle(dp);

	for(let i = 0; i < argc; ++i) 
		expr.mems.push( generate_expression(dp[i], expr) );

	if(expr.op == OType.DIV && Math.random() > 0.5)
	{
		let tmp = expr.mems[0];
		expr.mems[0] = expr.mems[1];
		expr.mems[1] = tmp;
	}

	expr.param = extract_value(OParams[expr.op]);

	return expr;
}





/* END */
