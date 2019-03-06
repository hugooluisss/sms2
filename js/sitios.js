function getSitios(){
	$.get("vistas/sitios.tpl", function(html){
		$(".modulo").html(html);
		
		$.post(server + "listaSitios", {
			"movil": 1,
			"json": true,
			"cliente": idCliente
		}, function(resp){
			if (resp.length == 0)
				addSitio();
				
			$("#btnAddSitio").click(function(){
				addSitio();
			});
			
			function addSitio(){
				$("#winAddSitio").modal();
				
				$("#winAddSitio").find("#latitud").val("");
				$("#winAddSitio").find("#longitud").val("");
				$("#winAddSitio").find("#txtTitulo").val("");
				$("#winAddSitio").find("#txtDireccion").val("");
				$("#winAddSitio").find("#idSitio").val("");
				setTimeout(function(){
					navigator.geolocation.getCurrentPosition(function(position){
						if (mapSitio == null){
							mapSitio = new google.maps.Map(document.getElementById('mapaSitio'), {
								center: {lat: position.coords.latitude, lng: position.coords.longitude},
								scrollwheel: true,
								fullscreenControl: true,
								zoom: 12,
								zoomControl: true
							});
							
							google.maps.event.addListener(mapSitio, 'click', function(event){
								var LatLng = event.latLng;
								marcaSitios.setPosition(LatLng);
								marcaSitios.setMap(mapSitio);
								console.info(event.latLng.lat(), event.latLng.lng());
								
								$("#winAddSitio").find("#latitud").val(event.latLng.lat());
								$("#winAddSitio").find("#longitud").val(event.latLng.lng());
							});
							
							var LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
							mapSitio.setCenter(LatLng);
							marcaSitios.setPosition(LatLng);
							marcaSitios.setMap(mapSitio);
						}else{
							var LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
							mapSitio.setCenter(LatLng);
							marcaSitios.setPosition(LatLng);
							marcaSitios.setMap(mapSitio);
						}
					}, function(){
						alertify.error("No se pudo obtener tu localización");
					});
				}, 1000);
			}
			
			$.each(resp, function(i, sitio){
				var el = $('<li class="list-group-item" datos=\'' + sitio.json + '\'>' + sitio.titulo + '</li>');
				$("#tplSitios").append(el);
				
				el.click(function(){
					$("#winAddSitio").modal();
					
					var sitio = jQuery.parseJSON(el.attr("datos"));
					$("#winAddSitio").find("#latitud").val(sitio.lat);
					$("#winAddSitio").find("#longitud").val(sitio.lng);
					$("#winAddSitio").find("#txtTitulo").val(sitio.titulo);
					$("#winAddSitio").find("#txtDireccion").val(sitio.direccion);
					$("#winAddSitio").find("#idSitio").val(sitio.idSitio);
					$("#winAddSitio").find("#eliminar").show();
					
					setTimeout(function(){
						if (mapSitio == null){
							
							mapSitio = new google.maps.Map(document.getElementById('mapaSitio'), {
								center: {lat: sitio.lat, lng: sitio.lng},
								scrollwheel: true,
								fullscreenControl: true,
								zoom: 12,
								zoomControl: true
							});
							
							google.maps.event.addListener(mapSitio, 'click', function(event){
								var LatLng = event.latLng;
								//var LatLng = mapSitio.getCenter();
								//mapSitio.setCenter(LatLng);
								marcaSitios.setPosition(LatLng);
								marcaSitios.setMap(mapSitio);
								console.info(event.latLng.lat(), event.latLng.lng());
								
								$("#winAddSitio").find("#latitud").val(event.latLng.lat());
								$("#winAddSitio").find("#longitud").val(event.latLng.lng());
							});
							
							var LatLng = new google.maps.LatLng(sitio.lat, sitio.lng);
							mapSitio.setCenter(LatLng);
							marcaSitios.setPosition(LatLng);
							marcaSitios.setMap(mapSitio);
						}else{
							var LatLng = new google.maps.LatLng(sitio.lat, sitio.lng);
							mapSitio.setCenter(LatLng);
							marcaSitios.setPosition(LatLng);
							marcaSitios.setMap(mapSitio);
						}
						
						if (sitio.lat == null){
							navigator.geolocation.getCurrentPosition(function(position){
								$("#winAddSitio").find("#latitud").val(position.coords.latitude);
								$("#winAddSitio").find("#longitud").val(position.coords.longitude);
							}, function(){
								alertify.error("No se pudo determinar tu ubicación")
							});
						}
					}, 1000);
				});
			});
		}, "json")
	})
}