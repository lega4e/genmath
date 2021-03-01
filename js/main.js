/*
 * autor:    lis
 * created:  Dec 24 23:32:35 2020
 */





let easygen = new Generator;
easygen.sets.atrig = false;
easygen.sets.exp   = false;
easygen.sets.depth = [1, 2, 3];
easygen.sets.diffy = [2.0, 4.0];

let medgen = new Generator;
medgen.sets.atrig = false;
medgen.sets.exp   = false;
medgen.sets.depth = [2, 3];
medgen.sets.diffy = [3.5, 5.5];

let hardgen = new Generator;
hardgen.sets.depth = [2, 3, 4];
hardgen.sets.diffy = [6.0, 8.0];



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

	let gexprs = gen.generate(30);
	// gexprs.sort( (a, b) => a.diffy == b.diffy ? 0 : a.diffy < b.diffy ? -1 : 1 );

	for(let i = 0; i < gexprs.length; ++i)
		exprs.push(`<div> (${gexprs[i].diffy.toFixed(2)}) $$ ${gexprs[i].expr.latex()} $$ </div>`);

	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}





/* END */
