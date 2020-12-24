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
	for(let i = 0; i < 10; ++i) 
	{
		let depth = parseInt($('#depth-input').val());

		let expr = generate_expression(depth);
		console.log('\nmain');
		console.log(expr);
		let latex = expr.latex();
		console.log(latex);
		
		exprs.push('<div> $$' + latex + '$$ </div>');
	}


	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}





/* END */
