/*
 * autor:    lis
 * created:  Dec 24 23:32:35 2020
 */





let easygen = new Generator;
easygen.sets.atrig = false;
easygen.sets.exp   = false;
easygen.sets.depth = 2;

let medgen = new Generator;
medgen.sets.atrig = false;
medgen.sets.exp   = false;
medgen.sets.depth = 2;

let hardgen = new Generator;
hardgen.sets.depth = 3



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

	for(let i = 0; i < 10; ++i) 
	{
		let expr = gen.generate();
		let latex = expr.latex();
		exprs.push('<div> $$' + latex + '$$ </div>');
	}

	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}





/* END */
