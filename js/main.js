/*
 * autor:    lis
 * created:  Dec 24 23:32:35 2020
 */





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

	for(let i = 0; i < 100; ++i) 
	{
		let expr = generate_expression(depth);
		let latex = expr.latex();
		console.log(latex);
		console.log(expr);
		exprs.push('<div> $$' + latex + '$$ </div>');
	}

	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}





/* END */
