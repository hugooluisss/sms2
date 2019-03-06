TCliente = function(fn){
	var self = this;
	
	this.login = function(datos){
		if (datos.before !== undefined) datos.before();
		
		$.post(server + 'cclientes', {
				"usuario": datos.usuario,
				"pass": datos.pass,
				"action": 'login',
				"movil": '1'
			}, function(resp){
				if (resp.band == 'false')
					console.log(resp.mensaje);
					
				if (datos.after !== undefined)
					datos.after(resp);
			}, "json");
	}
	
	this.registrar = function(datos){
		if (datos.before !== undefined) datos.before();
		
		$.post(server + 'cclientes', {
				"id": datos.id == undefined?"":datos.id,
				"nombre": datos.nombre,
				"sexo": datos.sexo,
				"correo": datos.correo,
				"pass": datos.pass,
				"nacimiento": datos.nacimiento,
				"action": 'add',
				"movil": 1
			}, function(data){
				if (data.band == 'false')
					console.log(data.mensaje);
					
				if (datos.after !== undefined)
					datos.after(data);
			}, "json");
	};
	
	this.recuperarPass = function(correo, fn){
		if (fn.before !== undefined) fn.before();
		
		$.post(server + 'cclientes', {
				"correo": correo,
				"action": 'recuperarPass',
				"movil": '1'
			}, function(data){
				if (data.band == 'false')
					console.log(data.mensaje);
					
				if (fn.after !== undefined)
					fn.after(data);
			}, "json");
	};
};