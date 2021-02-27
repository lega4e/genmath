/*
 * autor:    lis
 * created:  Dec 24 23:32:35 2020
 */





let easygen = new Generator;
easygen.sets.atrig = false;
easygen.sets.exp   = false;
easygen.sets.depth = 2;
// easygen.sets.fig   = false;

let medgen = new Generator;
medgen.sets.atrig = false;
medgen.sets.exp   = false;
medgen.sets.depth = 3;
// medgen.sets.fig   = false;

let hardgen = new Generator;
hardgen.sets.depth = 4;
// hardgen.sets.fig   = false;



window.keypress = function()
{
	if(window.event.keyCode == 13)
		window.generate();
	return;
}

window.generate = function()
{
	let exprs = [];
	let depth = parseInt($('#depth-input').val());
	if(isNaN(depth))
		return;

	let gen;
	switch(depth)
	{
		case 1:
			gen = easygen;
			break;
		case 2:
			gen = medgen;
			break;
		case 3:
			gen = hardgen;
			break;
		default:
			alert("Unknown difficulty; type 1, 2 or 3");
			return;
	}

	let gexprs = generate_expression_in_interval(gen, 20, [4.0, 5.0], [2, 3, 4]);
	gexprs.sort( (a, b) => a[1] == b[1] ? 0 : a[1] < b[1] ? -1 : 1 );

	for(let i = 0; i < gexprs.length; ++i)
		exprs.push(`<div> (${gexprs[i][1]}) $$ ${gexprs[i][0].latex()} $$ </div>`);

	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}





/* END */
