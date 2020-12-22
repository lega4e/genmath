/*
 * autor:    lis
 * created:  Dec 21 21:20:03 2020
 */





function create_variable(name)
{
	name = name || 'x';
	return new Variable(name);
}



function generate_mo(depth)
{
	if(depth <= 1)
	{
		return create_variable();
	}

	let op = choice(MOTypeProbs);
	let len = extract_value(MOIntervals[op]);

	let expr = new MultipleOperation;
	expr.op = op;
	expr.mems = [];

	let dp = [];
	for(let i = 0; i < len; ++i)
		dp.push(depth-1-i);
	shuffle(dp);

	for(let i = 0; i < len; ++i)
	{
		expr.mems.push(generate_uo(dp[i]));
	}

	return expr;
}



function generate_uo(depth)
{
	if(depth <= 0)
	{
		return create_variable();
	}

	let expr = new UnaryOperation;
	expr.op = choice(UOTypeProbs);
	expr.expr = generate_mo(depth-1);
	expr.param = extract_value(UOParams[expr.op]);

	return expr;
}
