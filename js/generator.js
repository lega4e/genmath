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
 * Создаёт структуру, содержащую
 * информацию об относительной глубине
 * и родстве выражения (из этих
 * структур состоит карта родства)
 */
function make_dpaf(depth, affinity, expr)
{
	return {
		'depth'    : depth,
		'affinity' : affinity,
		'expr'     : expr
	};
}

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
		map[expr.op].push( make_dpaf(depth, 0, expr) );

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
			map.VAR.push( make_dpaf(depth, affinity, expr) );
			return;
		}
		else
			throw '!expr.isvar but !expr.mems';
	}

	if(!map[expr.op])
		map[expr.op] = [];
	map[expr.op].push( make_dpaf(depth, affinity, expr) );

	for(let i = 0; i < expr.mems.length; ++i)
		_calculate_map_downprop(map, expr.mems[i], depth-1, affinity+1);
	return;
}





/*
 * Создаёт копию карты вероятностий
 */
function clone_probs(probs)
{
	let cp = {};
	for(let el in probs)
		cp[el] = probs[el];
	return cp;
}

/*
 * Функция, рассчитывающая карту вероятностей
 * появления определённой операции на основе
 * карты родста для генерируемой операции,
 * родительского выражения и глубины
 * требуемого выражения.
 *
 * В нескольких словах функция работает так:
 * 1. Копирует первоначальную карту вероятностей
 * 2. Обходим каждую встреченную в карте родста
 *    операцию и в соответствии с её относительной
 *    глубиной и родством понижает вероятность
 *    встречи этой операции в копии карты 
 *    вероятностей
 * 3. Возвращает таким образом созданную карту
 */
function calculate_probs(map, parexpr, depth)
{
	/*
	 * Строгие (strict) выражения — те выражения,
	 * вероятность которых от их встречи уменьшается
	 * значительней мягких (soft) — т.е. всех
	 * остальных
	 */
	function isstrict(op)
	{
		return op == OType.ADD  || op == OType.MUL  ||
		       op == OType.POW  || op == OType.ROOT ||
		       op == OType.DIV  || op == OType.UDIV ||
		       op == OType.UEXP || op == OType.EXP;
	}

	/*
	 * Вычисляет множитель, с помощью которого
	 * вероятность встречи строгого выражения
	 * уменьшается
	 */
	function calculate_strict(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - (dpaf.affinity > 1 ? dpaf.affinity/4.0 : 0.0) );

		switch(dp)
		{
			case 0: case 1: case 2:
				return 1.0 - k;
			case 2:
				return 1.0 - k*0.9;
			case 3:
				return 1.0 - k*0.8;
			default:
				return 1.0 - 4*k/dp/3;
		}
	}

	/*
	 * Соответственно — мягкого
	 */
	function calculate_soft(dpaf)
	{
		let dp = Math.abs(dpaf.depth)
		let k = max( 0.0, 1.0 - dpaf.affinity/3.0 );

		if(dp == 0)
			return 1.0 - k;
		if(dp == 1)
			return 1.0 - k*0.95;
		return 1.0 - 5*k/(dp*3);
	}



	/*
	 * Копируем первоначальную карту вероятностей
	 * и проходимся по каждой операции в ней
	 */
	let probs = clone_probs(OProbs);
	for(let pr in probs)
	{
		if(ODepthLimits[pr] >= 0 && depth > ODepthLimits[pr])
			probs[pr] = 0;
	}

	if(parexpr && parexpr.op != OType.MUL)
		probs[OType.EXP] = 0;

	let mult, selfmult;
	for(let op in map)
	for(let i = 0; i < map[op].length; ++i)
	{
		/*
		 * Вычисляем множитель в зависимости от того,
		 * является ли данная операция строгой или мягкой
		 */
		mult = isstrict(op) ?
			calculate_strict(map[op][i]) :
			calculate_soft(map[op][i]);

		/*
		 * Если данная операция является нашим
		 * родным братом, а родитель — умножение,
		 * сложение или деление, полностью запретить
		 * данную операцию
		 */
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
			/*
			 * Если наш непосредственный родитель — функция,
			 * а глубина больше единицы полностью запрещаем
			 * экспоненту и степень (иначе выражения могут
			 * получится крайне некрасивыми)
			 */
			if(map[op][i].affinity == 0 && map[op][i].depth == 1 && depth > 1)
			{
				probs[OType.POW] = 0;
				probs[OType.EXP] = 0;
			}

			/*
			 * Появление функции уменьшает вероятность 
			 * встречи всех остальных (но, конечно, меньше)
			 */
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

			/*
			 * Обратные функции расцениваются как одинаковые
			 * (предотвращает выражения аля sin arcsin x)
			 */
			if(op == OType.SIN)
				probs[OType.ASIN] *= mult;
			else if(op == OType.COS)
				probs[OType.ACOS] *= mult;
			else if(op == OType.TAN)
				probs[OType.ATAN] *= mult;
			else if(op == OType.ASIN)
				probs[OType.SIN] *= mult;
			else if(op == OType.ACOS)
				probs[OType.COS] *= mult;
			else if(op == OType.ATAN)
				probs[OType.TAN] *= mult;

			/*
			 * Также обратные тригонометрические функции
			 * уменьшают вероятность встретить все
			 * остальные
			 */
			if(istrig(op) && op[0] == 'A')
			{
				probs[OType.ASIN] *= mult;
				probs[OType.ACOS] *= mult;
				probs[OType.ATAN] *= mult;
			}
		}
		else if(isfig(op))
		{
			if(map[op][i].affinity == 0)
			{
				probs[OType.POL] = 0;
				selfmult = mult = 0;

				if(
					op == OType.FIG3 ||
					(op == OType.FIG4 || op == OType.FIG5) &&
					map[op][i].expr.param[0] == 'ROOT'
				)
				{
					probs[OType.POW]  = 0;
					probs[OType.ROOT] = 0;
					probs[OType.EXP]  = 0;
					probs[OType.UEXP] = 0;
				}
					
			}

			for(let pr in probs)
			if(isfig(pr))
			{
				probs[pr] *= pr == op ? selfmult : mult;
			}

		}
		else if(op == OType.ADD)
		{
			probs[OType.ADD] *= selfmult;
			if(map[op][i].depth == 1 && map[op][i].affinity == 0)
				probs[OType.POL] = 0;
		}
		else if(op == OType.MUL)
		{
			probs[OType.MUL]  *= selfmult;
			probs[OType.UDIV] *= mult;
			probs[OType.DIV]  *= mult;

			if(map[op][i].depth == 1 && map[op][i].affinity == 0)
			{
				for(let pr in probs)
				if(isfig(pr))
					probs[pr] = 0;
				probs[OType.POL] = 0;
			}
		}
		else if(op == OType.EXP || op == OType.UEXP)
		{
			probs[OType.EXP]  *= op == OType.EXP  ? selfmult : mult;
			probs[OType.UEXP] *= op == OType.UEXP ? selfmult : mult;
			probs[OType.POW]  *= mult;
		}
		else if(op == OType.POW)
		{
			probs[OType.POW]  *= selfmult;
			probs[OType.FIG5] *= mult;
			probs[OType.FIG4] *= mult;

			if(map[op][i].affinity == 0 && map[op][i].depth == 1)
			{
				probs[OType.EXP]  = 0;
				probs[OType.UEXP] = 0;
				probs[OType.POL]  = 0;
			}

			if(map[op][i].affinity == 1 && map[op][i].depth == 0)
				probs[OType.ROOT] = 0;
		}
		else if(op == OType.ROOT)
		{
			probs[OType.ROOT] *= selfmult;
			probs[OType.FIG3] *= mult;
			probs[OType.FIG4] *= mult;
			probs[OType.FIG5] *= mult;

			if(map[op][i].affinity == 1 && map[op][i].depth == 0)
				probs[OType.POW] = 0;
		}
		else if(op == OType.DIV || op == OType.UDIV)
		{
			probs[OType.DIV]  *= op == OType.DIV  ? selfmult : mult;
			probs[OType.UDIV] *= op == OType.UDIV ? selfmult : mult;

			if(map[op][i].affinity == 0)
				probs[OType.FIG2] = 0;
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
				probs[OType.ROOT] = 0;
			}
		}
		else
			probs[op] *= mult;
	}

	return probs;
}





/*
 * Создаёт переменную
 */
function create_variable(name)
{
	name = name || 'x';
	return new Variable(null, name);
}

/*
 * Функция, генерирующая выражение заданной
 * глубины, имеющее заданного родителя.
 * Функция в нескольких словах работает так:
 *
 * 1. Если глубина 0 или меньше — создать переменную. Конец.
 * 2. Иначе рассчитать карту родства и на её основе
 *    карту вероятностей появления операций
 * 3. Выбрать на основе карты вероятностей операцию
 * 4. Сгенерировать параметр для операции — так, чтобы
 *    не получилось Бяды
 * 5. Сгенерировать коэффициент; опять — так, чтобы
 *    не получилось Бяды
 * 6. Сгенерировать дочерние выражения в порядке неубывания
 *    их глубины (необходимо, чтобы избежать возможную Бяду)
 */
function generate_expression(depth, parexpr)
{
	/*
	 * Остановка рекурсии: глубина закончилась,
	 * возвращаем переменную
	 */
	if(depth <= 0)
	{
		let v = create_variable();
		v.coef = extract_value(OCoef.VAR, v);
		return v;
	}



	/*
	 * Выбираем операцию на основе карты родства
	 * и карты вероятностей
	 */
	let map = calculate_map(parexpr);
	let probs = calculate_probs(map, parexpr, depth);
	let expr = new Operation({ 'par' : parexpr });

	do
	{
		expr.op = choice(probs);
		expr.argc = extract_value(OArgsCount[expr.op], expr);
	}
	while(depth - expr.argc < 0);



	/*
	 * Генерируем параметр для выражения и проверяем,
	 * не получилось ли Бяды; возникла — генерируем
	 * заново, пока Бяда не исчезнет
	 */
	expr.param = extract_value(OParams[expr.op], expr);
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
			expr.param = extract_value(OParams[expr.op], expr);
			if(++c == 128)
				throw 'c == 128 while generating param';
		}
	}



	/*
	 * Генерируем коэффициент для выражения и проверяем,
	 * не получилось ли Бяды; возникла — генерируем
	 * заново, пока Бяда не исчезнет
	 */
	expr.coef = extract_value(OCoef[expr.op], expr);
	if( parexpr && parexpr.op == OType.DIV && parexpr.mems.length == 1 )
	{
		let c = 0;
		while( gcd( expr.coef, parexpr.mems[0].coef ) != 1 ||
		       expr.coef < 0 && parexpr.mems[0].coef < 0 )
		{
			expr.coef = extract_value(OCoef[expr.op], expr);
			if(++c == 128)
				throw 'c == 128 wihle generating coef';
		}
	}



	/*
	 * Генерируем дочерние выражения (если необходимы, но,
	 * кажется, они всегда нужны)
	 */
	expr.mems = [];
	if(expr.argc == 0)
		return expr;

	// Хитрое распределение глубины
	let dp = [ depth - 1 ];
	for(let i = 1; i < expr.argc; ++i)
	{
		let c = Math.random();
		dp.push( depth - 1 + ( c < 0.8 ? -1 : c < 0.5 ? 0 : -2 ) );
	}

	// В определённом случае необходимо отсортировать глубину,
	// создаваемых выражений (чтобы не возникло возможной Бяды)
	if(expr.op == OType.ADD || expr.op == OType.MUL || expr.op == OType.DIV)
		dp.sort();

	// Собственно, генерируем выражения
	for(let i = 0; i < expr.argc; ++i) 
		expr.mems.push( generate_expression(dp[i], expr) );

	// Упорядочиваем дочерние выражения, чтобы было
	// всё красиво, а также, если операция — сложение, и
	// первый элемент — отрицательный, меняем его с первым
	// положительным (если есть)
	if(expr.op == OType.MUL || expr.op == OType.ADD)
	{
		expr.mems.sort(expression_cmp);
		if(expr.op == OType.ADD && expr.mems[0].coef < 0)
		{
			let i = 1;
			for(; i < expr.mems.length; ++i)
			{
				if(expr.mems[i].coef > 0)
				{
					let tmp = expr.mems[0];
					expr.mems[0] = expr.mems[i];
					expr.mems[i] = tmp;
					break;
				}
			}
		}
	}
	// Либо обеспорядочиваем для большего разнообразия
	else
		shuffle(expr.mems);

	return expr;
}





/* END */
