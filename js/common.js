/*
 * autor:    lis
 * created:  Sep 23 22:18:43 2020
 */





/* COMMON LIBRARY FUNCTIONS */
String.prototype.fmt = function()
{
	var args = arguments;
	return this.replace( /%(\d+)/g, function(m) {
		let num = Number.parseInt(m.substr(1));
		return args[num] !== undefined ? args[num] : m;
	} );
};

function shuffle(array)
{
	let a, b, tmp;
	let len = array.length;
	for(let i = 0; i < len; ++i)
	{
		a = randint(0, len-1);
		b = randint(0, len-1);

		tmp = array[a];
		array[a] = array[b];
		array[b] = tmp;
	}
	return;
}

function randint(min, max)
{
	return Math.round( min - 0.5 + Math.random() * (max - min + 1) );
}

function mod(a, b)
{
	return (a % b + b) % b;
}

function min(a, b)
{
	return b < a ? b : a;
}

function max(a, b)
{
	return b > a ? b : a;
}

function log(s)
{
	return console.log(s);
}

function to_string(obj, newline)
{
	if(newline == undefined)
			newline = '\n';
	let s = '';
	s += "------ " + typeof obj + " ------" + newline;
	for(let mem in obj)
			s += mem + ": " + obj[mem] + newline;
	return s;
}

function gcd(a, b)
{
	while(a)
	{
		b %= a;
		let tmp = a;
		a = b;
		b = tmp;
	}
	return b;
}

/*
 * Повторяет строку s count раз
 * (так должен работать s*count
 */
function repeat(s, count)
{
	res = '';
	for(let i = 0; i < count; ++i)
		res += s;
	return res;
}

function make_array(length, val)
{
	let ar = [];
	for(let i = 0; i < length; ++i)
		ar.push(val);
	return;
}

function make_tenzor(idxarr, val, offset)
{
	if(offset == undefined)
		offset = 0;

	if(offset == idxarr.length)
		return val;

	let ar = [];

	for(let i = 0; i < idxarr[offset]; ++i) 
	{
		ar[i] = make_array(idxarr, val, offset+1);
	}

	return ar;
}

function dpcopy(array)
{
	if(typeof(array) != typeof([]))
		return array;

	let ret = [];
	for(let i = 0; i < array.length; ++i)
		ret[i] = dpcopy(array[i]);

	return ret;
}





// document
function write(text)
{
	document.write(text);
}

function writep(text)
{
	return write("<p>" + text + "</p>");
}

function generate_html_table( tab, sets )
{
	sets = sets || {
		'horhead' : false,
		'verhead' : false,
		'table'   : '',
		'tr'      : '',
		'td'      : '',
		'thhor'   : '',
		'thver'   : '',
	};

	res = `<table ${sets.table || ''}>\n`;
	for(let row = 0; row < tab.length; ++row)
	{
		res += `\t<tr ${sets.tr || ''}>\n`;
		for(let col = 0; col < tab[row].length; ++col)
		{
			if(sets.horhead && row == 0)
				res += `\t\t<th ${sets.thhor || ''}>` + tab[row][col] + '</th>\n';
			else if(sets.verhead && col == 0)
				res += `\t\t<th ${sets.thver || ''}>` + tab[row][col] + '</th>\n';
			else
				res += `\t\t<td ${sets.td || ''}>` + tab[row][col] + '</td>\n';
		}
		res += '\t</tr>\n';
	}

	res += '</table>\n';
	return res;
}





// prompt
function gets(invmes)
{
	if(invmes == undefined)
		invmes = "Enter value";

	let val;
	while(!val)
		val = prompt(invmes);
	return val;
}

function getint(invmes)
{
	if(invmes == undefined)
		invmes = "Enter value";

	let val;
	while(!val && val != 0)
		val = parseInt(prompt(invmes));
	return val;
}

function getfloat(invmes)
{
	if(invmes == undefined)
		invmes = "Enter value";

	let val;
	while(!val && val != 0)
		val = parseFloat(prompt(invmes));
	return val;
}





/* END */
