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
	if(!map[expr.op])
		map[expr.op] = [];
	map[expr.op].push( make_dpaf(depth, affinity) );

	if(!expr.mems)
		return;

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

function choice_otype(map)
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
		let k = max( 0.0, 1.0 - dp/10.0 );

		switch(dp)
		{
			case 0: case 1:
				return 1.0 - k;
			case 2:
				return 1.0 - k*0.85;
			case 3:
				return 1.0 - k*0.7;
			default:
				return 1.0 - 4*k/dp/3;
		}
	}

	function calculate_soft(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - dp/10.0 );

		if(dp == 0 || dp == 1)
			return 1.0 - k*0.85;
		else
			return 1.0 - 3*k/dp/2;
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
			}
			else
				probs[op] *= mult;
		}
		else
		{
			mult = calculate_soft(map[op][i]);
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
			else if(probs[op])
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
		expr.op = choice_otype(map);
	}
	while(depth - OArgsCount[expr.op] < 0)
	expr.par = parexpr || null;

	let argc = OArgsCount[expr.op];
	expr.mems = [];

	let dp = [];
	for(let i = 0; i < argc; ++i)
		dp.push(depth-1-i);
	shuffle(dp);

	for(let i = 0; i < argc; ++i) 
	{
		expr.mems.push( generate_expression( dp[i], expr) );
	}

	expr.param = extract_value(OParams[expr.op]);

	return expr;
}





/* END */
