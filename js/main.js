
window.generate = function()
{
	let exprs = [];
	for(let i = 0; i < 10; ++i) 
	{
		let depth = parseInt($('#depth-input').val());
		console.log(depth);

		let expr = generate_mo(depth);
		console.log(expr);
		let latex = expr.latex();
		console.log(latex);
		
		exprs.push('<div> $$' + latex + '$$ </div>');
	}


	$('#formula').html(exprs.join(''));
	MathJax.typeset();
}
