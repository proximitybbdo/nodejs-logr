var Scoper = function() {}

Scoper.create = function(target, funct) {
  var params = [];
  var args = Array.prototype.slice.call(arguments);
  
  for(var i = 2; i < args.length; i++)
		params[i - 2] = args[i];

	var funct_prox = function() {
    var args = Array.prototype.slice.call(arguments);	  
	  var a_params = args.concat(params);

		a_params.push(arguments.callee);
		
		funct.apply(target, a_params);
	}

	return funct_prox; 
}

exports.Scoper = Scoper;
