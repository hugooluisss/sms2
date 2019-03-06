function setMenu(){
	$("#fotoPerfil").attr("src", server + "repositorio/clientes/img_" + idCliente + ".jpg?" + Math.random());
	
	$.get("vistas/misDatos.tpl", function(html){
		$("body").find("#frmEnvio").after(html);
		$("#winDatos").on('show.bs.modal', function(){
			jsShowWindowLoad("Estamos recuperando los datos desde el servidor");
			$.post(server + "cclientes", {
				"movil": 1,
				"json": true,
				"action": "getData",
				"id": idCliente
			}, function(cliente){
				var win = $("#winDatos");
				
				win.find("#txtNombre").val(cliente.nombre);
				win.find("#txtUsuario").val(cliente.correo);
				win.find("#selSexo").val(cliente.sexo);
				win.find("#txtNacimiento").val(cliente.nacimiento);
				
				jsRemoveWindowLoad();
			}, "json");
		});
		
		$("#frmActualizarDatos").validate({
			errorClass: "validateError",
			debug: true,
			rules: {
				txtNombre: {
					required : true,
					email: false
				},
				txtNacimiento: {
					required : true
				}
			},
			wrapper: 'span', 
			messages: {
				txtNacimiento: "Indica tu fecha de nacimiento"
			},
			submitHandler: function(form){
				var obj = new TCliente;
				form = $(form);
				
				obj.registrar({
					id: idCliente,
					nombre: form.find("#txtNombre").val(), 
					sexo: form.find("#selSexo").val(), 
					correo: form.find("#txtUsuario").val(), 
					pass: form.find("#txtPass").val(), 
					nacimiento: form.find("#txtNacimiento").val(), 
					before: function(){
						form.find("[type=submit]").prop("disabled", true);
					},
					after: function(data){
						form.find("[type=submit]").prop("disabled", false);
						
						if (data.band == false){
							alertify.error("Ocurrió un error al actualizar los datos");
						}else{
							alertify.success("Tus datos se actualizaron con éxito");
							
							$("#winDatos").modal("hide");
						}
					}
				});
			}
		});
	});
	
	$(".collapse").find("[action=salir]").click(function(){
		window.localStorage.removeItem("sesion");
		window.localStorage.removeItem("tarjeta");
		location.href = "index.html";
	});
	
	$(".collapse").find("[action=misDatos]").click(function(){
		$("#navbarSupportedContent").collapse('hide');
		$("#winDatos").modal();
	});
	
	$(".collapse").find("[action=sitios]").click(function(){
		$("#navbarSupportedContent").collapse('hide');
		
		getSitios();
	});
	
	$(".collapse").find("[action=historial]").click(function(){
		$("#navbarSupportedContent").collapse('hide');
		
		getOrdenes();
	});
	
	$(".collapse").find("[action=politica]").click(function(){
		$("#navbarSupportedContent").collapse('hide');
		
		$.get("http://admin.grupodomiapp.com/politica-uso", function(resp){
			$("#winTerminos").find(".modal-body").html(resp);
			
			$("#winTerminos").find(".modal-body").find("img").remove();
			
			$("#winTerminos").modal();
		});
	});

	
	
	$("#btnCamara").click(function(){
		if (navigator.camera != undefined){
			navigator.camera.getPicture(function(imageData) {
					$("#fotoPerfil").attr("src", "data:image/jpeg;base64," + imageData);
					
					//img.attr("src", "data:image/jpeg;base64," + imageURI);
					//img.attr("src2", imageURI);
					subirFotoPerfil(imageData);
				}, function(message){
					alertify.error("Ocurrio un error al subir la imagen");
			        setTimeout(function() {
			        	$("#mensajes").fadeOut(1500).removeClass("alert-danger");
			        }, 5000);
				}, { 
					quality: 100,
					//destinationType: Camera.DestinationType.FILE_URI,
					destinationType: Camera.DestinationType.DATA_URL,
					encodingType: Camera.EncodingType.JPEG,
					targetWidth: 250,
					targetHeight: 250,
					correctOrientation: true,
					allowEdit: true
				});
		}else{
			alertify.error("No se pudo iniciar la cámara");
			console.log("No se pudo inicializar la cámara");
		}
	});
	
	
	function subirFotoPerfil(imageURI){
		var formData = new FormData();
		
		$.post(server + '?mod=cclientes2&action=uploadImagenPerfil', {
				"imagen": imageURI,
				"movil": 1,
				"identificador": idCliente
			}, function(data){
				if (data.band)
					alertify.success("La fotografía se cargó con éxito");
				else
					alertify.error("Ocurrió un error al subir la fotografía");
			}, "json");
	}
}