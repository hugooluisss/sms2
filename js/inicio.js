/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var db = null;
var idCliente;
var map = null;
var markerDestino = null;
var markerOrigen = null;
var conektaPublic = "key_bqFat52tN6nohmtcU7AFYwg";
var telefono = "4498953316";
//var telefono = "9515705278";

var mapSitio = null;

var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		document.addEventListener("backbutton", function(){
			return false;
		}, true);
		//window.localStorage.removeItem("sesion");
		idCliente = window.localStorage.getItem("sesion");
		if (idCliente == null || idCliente == undefined || idCliente == '')
			location.href = "index.html";
		
		getOrdenes();
		
		setMenu();
		
		$.get("vistas/pago.tpl", function(resp){
			$("#winPago").find(".modal-body").html(resp);
			
			var fecha = new Date();
			var ano = fecha.getFullYear();
			
			for(var i = 0 ; i  < 10 ; i++, ++ano)
				$("#winPago").find(".exp_year").append('<option value="' + ano + '">' + ano + '</option>');
				
			var tarjeta = window.localStorage.getItem("tarjeta");
			
			if (tarjeta != null && tarjeta != undefined && tarjeta != ''){
				tarjeta = JSON.parse(tarjeta);
				
				$(".name").val(tarjeta.nombre);
				$(".number").val(tarjeta.number);
				$(".exp_month").val(tarjeta.month);
				$(".exp_year").val(tarjeta.year);
			}
				
			$("#submitPago").click(function(){
				jsShowWindowLoad("Espere mientras procesamos el pago");
				Conekta.setPublicKey(conektaPublic);
				//Conekta.setPublishableKey(conektaPublic);
				var $form = $("#frmEnvio");
				
				/*
				$(".name").val("hugo Santiago");
				$(".number").val("4242424242424242");
				$(".cvc").val("121");
				$(".exp_month").val("11");
				$(".exp_year").val("2018");
				*/
				
				// Previene hacer submit más de una vez
				$form.find("#submitPago").prop("disabled", true);
				Conekta.Token.create($form, function(token) {
					var $form = $("#frmEnvio");
					
					/* Inserta el token_id en la forma para que se envíe al servidor */
					$("#conektaTokenId").val(token.id);
					
					/* and submit */
					//$form.get(0).submit();
					$.post(server + 'cpagos', {
						"token": token.id,
						"cliente": idCliente,
						//"calle": $(".calle").val(),
						//"colonia": $(".colonia").val(),
						//"ciudad": $(".ciudad").val(),
						//"estado": $(".estado").val(),
						//"codigoPostal": $(".codigoPostal").val(),
						"movil": 1,
						"monto": $("#monto").html(),
						"action": "cobroTarjeta"
					}, function(resp) {
						$form.find("button").prop("disabled", false);
						
						if (resp.band == true){
							alertify.success("Muchas gracias por su pago");
							var producto = jQuery.parseJSON($("#winDatosEnvio").attr("datos"));
							var origen = $("#selOrigen").find("option:selected");
							var destino = $("#selDestino").find("option:selected");
							
							datosTarjeta = {};
							
							datosTarjeta.nombre = $(".name").val();
							datosTarjeta.number = $(".number").val();
							datosTarjeta.month = $(".exp_month").val();
							datosTarjeta.year = $(".exp_year").val();

							
							window.localStorage.removeItem("tarjeta");
							window.localStorage.setItem("tarjeta", JSON.stringify(datosTarjeta));
							
							$.post(server + "cordenes", {
								"cliente": idCliente,
								"servicio": producto.idServicio,
								"latitud": destino.attr("latitude"),
								"longitud": destino.attr("longitude"),
								"latitud2": producto.precio > 0?'':origen.attr("latitude"),
								"longitud2": producto.precio > 0?'':origen.attr("longitude"),
								"notas": $("#txtNotas").val(),
								"conekta_id": resp.idPago,
								"action": "add",
								"movil": 1
							}, function(resp){
								if (resp.band){
									alertify.success("Estamos trabajando en su orden, estamos en camino");
									jsShowWindowLoad("Todo listo... muchas gracias por su pago");
									
									setTimeout(function(){
										location.reload();
									}, 2000);
									$(".modulo").html("");
								}else
									alertify.error("Ocurrió un error");
							}, "json");
							
						}else
							alertify.error(resp.mensaje);
							
						jsRemoveWindowLoad();
					}, "json");
				
				
				}, function(response) {
					var $form = $("#frmEnvio");
					
					/* Muestra los errores en la forma */
					alertify.error(response.message_to_purchaser);
					$form.find("button").prop("disabled", false);
					
					jsRemoveWindowLoad();
				});
				return false;
			});
		});
	
		$.post(server + "listaCategoriaServicios", {
			"movil": 1,
			"json": true
		}, function(resp){
			$.each(resp, function(i, el){
				var btnMenu = tplBotonMenu;
				btnMenu = $(btnMenu);
				btnMenu.find("img").attr("src", server + "img/cat" + el.idCategoria + ".png");
				btnMenu.find("[campo=nombre]").html(el.nombre);
				btnMenu.attr("datos", el.json);
				
				btnMenu.click(function(){
					$.get("vistas/categoria.tpl", function(pCategoria){
						pCategoria = $(pCategoria);
						
						var el = jQuery.parseJSON(btnMenu.attr("datos"));
						
						$.each(el, function(campo, valor){
							pCategoria.find("[campo=" + campo + "]").html(valor);
							
							$(".modulo").html(pCategoria);
						});
						
						$.post(server + "listaServicios", {
							"movil": 1,
							"json": true,
							"categoria": el.idCategoria
						}, function(productos){
							$.get("vistas/producto.tpl", function(viewProducto){
								$.each(productos, function(i, producto){
									var pProducto = viewProducto;
									pProducto = $(pProducto);
									
									pProducto.find("img").attr("src", server + "repositorio/servicios/img" + producto.idServicio + ".jpg");
									
									$.each(producto, function(campo, valor){
										pProducto.find("[campo=" + campo + "]").html(valor);
									});
									pProducto.attr("json", producto.json);
									
									pProducto.find(".solicitar").click(function(){
										$("#winDatosEnvio").attr("datos", pProducto.attr("json"));
										$("#winDatosEnvio").modal();
									});
									
									if (producto.precio == 0)
										pProducto.find("[campo=precio]").parent().hide();
									
									$(".productos").append(pProducto);
								});
							});
						}, "json");
					});
				});
				
				$("#menu").append(btnMenu);
			});
			
			$("#winDatosEnvio").on('show.bs.modal', function () {
				var win = $("#winDatosEnvio");
				var producto = jQuery.parseJSON(win.attr("datos"));
				win.find(".modal-title").find(".titulo").html(producto.nombre);
				win.find(".img-rounded").attr("src", server + "repositorio/servicios/img" + producto.idServicio + ".jpg");
				
				win.find("#groupOrigen").show();
				if (producto.precio > 0)
					win.find("#groupOrigen").hide();
			});
			
			$("#winDatosEnvio").on('shown.bs.modal', function () {
				jsShowWindowLoad("Espere mientras obtenemos su ubicación");
				$.post(server + "listaSitios", {
					"movil": 1,
					"json": true,
					"cliente": idCliente
				}, function(sitios){
					markerDestino.setMap(null);
					markerOrigen.setMap(null);
					$("#selOrigen").find("option").remove().end().append('<option value="">Seleccionar</option>');
					$("#selDestino").find("option").remove().end().append('<option value="">Seleccionar</option>');
					
					$("#selOrigen").find("option").remove().end().append('<option value="-">Otro lugar</option>');
					$("#selDestino").find("option").remove().end().append('<option value="-">Otro lugar</option>');
					
					alertify.log("Estamos obteniendo tu ubicación");
					navigator.geolocation.getCurrentPosition(function(position){
						$("#selOrigen").prepend('<option value="posicion" latitude="' + position.coords.latitude + '" longitude="' + position.coords.longitude + '">Mi posición</option>').val('posicion');
						$("#selDestino").prepend('<option value="posicion" latitude="' + position.coords.latitude + '" longitude="' + position.coords.longitude + '">Mi posición</option>').val('posicion');
						
						if (map == null){
							map = new google.maps.Map(document.getElementById('mapa'), {
								center: {lat: -34.397, lng: 150.644},
								scrollwheel: true,
								zoom: 12
							});
						}
						
						var win = $("#winDatosEnvio");
						var producto = jQuery.parseJSON(win.attr("datos"));
				
						map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
						if (producto.precio == 0){
							markerOrigen.setMap(map);
							markerOrigen.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
							console.info("Agregando la posición de origen");
						}
						
						markerDestino.setMap(map);
						markerDestino.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
						jsRemoveWindowLoad();
					}, function(){
						alertify.error("No se pudo obtener tu ubicación");
						jsRemoveWindowLoad();
					});
					
					$.each(sitios, function(i, sitio){
						$("#selOrigen").append('<option value="' + sitio.idSitio + '" latitude="' + sitio.lat + '" longitude="' + sitio.lng + '">' + sitio.titulo + '</option>');
						$("#selDestino").append('<option value="' + sitio.idSitio + '" latitude="' + sitio.lat + '" longitude="' + sitio.lng + '">' + sitio.titulo + '</option>');
					});
				}, "json");
			});
		}, "json");
		
		$("#sendWinPago").click(function(){
			var producto = jQuery.parseJSON($("#winDatosEnvio").attr("datos"));
			var origen = $("#selOrigen").find("option:selected");
			var destino = $("#selDestino").find("option:selected");
			jsShowWindowLoad("Estamos calculando el costo del servicio de entrega");
			
			$.post(server + "cordenes", {
				"action": "getDistancia",
				"json": true,
				"movil": 1,
				"servicio": producto.idServicio,
				"latitud": destino.attr("latitude"),
				"longitud": destino.attr("longitude"),
				"latitud2": origen.attr("latitude"),
				"longitud2": origen.attr("longitude")
			}, function(resp){
				if (resp.distancia > 0 && resp.distancia <= 18){
					$("#winPago").find("#monto").html((parseFloat(resp.monto) + parseFloat(producto.precio)).toFixed(2));
					if (producto.precio > 0)
						alertify.success("El recorrido de " + resp.distancia + "km <br />Costo de envío $ " + resp.monto + "<br /> Producto a enviar: " + producto.precio);
					else
						alertify.success("El recorrido de " + resp.distancia + "km tiene un costo de $ " + resp.monto);
						
					$("#winPago").modal();
				}else
					alertify.error("La distancia debe ser mayor a un kilómetro y menor a 18");
					
				jsRemoveWindowLoad();
			}, "json");
		});
		
		$("#selDestino").change(function(){
			if ($("#selDestino").val() == '-'){//Otro lugar
				mostrarMapaSitio();
			}else{
				var el = $("#selDestino").find("option:selected");
				var latitude = el.attr("latitude");
				var longitude = el.attr("longitude");
				
				var LatLng = new google.maps.LatLng(latitude, longitude);
				map.setCenter(LatLng);
				markerDestino.setPosition(LatLng);
				markerDestino.setMap(map);
			}
		});
		
		$("#selOrigen").change(function(){
			if ($("#selOrigen").val() == '-'){//Otro lugar
				mostrarMapaSitio();
			}else{
				var el = $("#selOrigen").find("option:selected");
				var latitude = el.attr("latitude");
				var longitude = el.attr("longitude");
				
				var LatLng = new google.maps.LatLng(latitude, longitude);
				map.setCenter(LatLng);
				markerOrigen.setPosition(LatLng);
				markerOrigen.setMap(map);
			}
		});
		
		function mostrarMapaSitio(){
			$("#winAddSitio").modal();
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
		}
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
	//reposition($("#centrarLogo"), $("#centrarLogo").find(".logo"));
	
	$("body").css("height", $(window).height());
	$(".modulo").css("height", $(window).height() - ($(window).height() * 5 / 100));
	
	markerDestino = new google.maps.Marker({});
	markerOrigen = new google.maps.Marker({});
	marcaSitios = new google.maps.Marker({});
	
	$.get("vistas/addSitio.tpl", function(resp){
		$("body").find("#frmEnvio").after(resp);
		
		$("#winAddSitio").find("#agregar").click(function(){
			if ($("#txtTitulo").val() == ''){
				alertify.error("Escribe el título del sitio");
				$("#txtTitulo").select();
			}else if($("#txtDireccion").val() == ''){
				alertify.error("Indica la dirección");
				$("#txtDireccion").select();
			}else if($("#latitud").val() == ''){
				alertify.error("Es necesario indicar un punto en el mapa... escribe una dirección y después presiona el ícono buscar");
				$("#txtDireccion").select();
			}else{
				$.post(server + "cclientes", {
					"movil": 1,
					"json": true,
					"action": "addSitio",
					"cliente": idCliente,
					"lat": $("#latitud").val(),
					"lng": $("#longitud").val(),
					"titulo": $("#txtTitulo").val(),
					"direccion": $("#txtDireccion").val(),
					"id": $("#idSitio").val()
				}, function(resp){
					if (resp.band){
						if($("#winAddSitio").attr("datos") == '' || $("#winAddSitio").attr("datos") == undefined){
							getSitios();
						}
						
						$("#selOrigen").append('<option value="' + resp.id + '" latitude="' + $("#latitud").val() + '" longitude="' + $("#longitud").val() + '">' + $("#txtTitulo").val() + '</option>');
						$("#selDestino").append('<option value="' + resp.id + '" latitude="' + $("#latitud").val() + '" longitude="' + $("#longitud").val() + '">' + $("#txtTitulo").val() + '</option>');
						
						alertify.success("Sitio agregado");
						$("#winAddSitio").modal("hide");
					}else
						alertify.error("No se pudo agregar");
				}, "json");
			}
		});
		
		$("#winAddSitio").find("#eliminar").click(function(){
			if ($("#idSitio").val() == ''){
				alertify.error("No se puede eliminar este sitio");
				$("#txtTitulo").select();
			}else if(confirm("¿Seguro?")){
				$.post(server + "cclientes", {
					"movil": 1,
					"json": true,
					"action": "delSitio",
					"id": $("#idSitio").val()
				}, function(resp){
					if (resp.band){
						if($("#winAddSitio").attr("datos") == '' || $("#winAddSitio").attr("datos") == undefined){
							getSitios();
						}
						alertify.success("Sitio eliminado");
						$("#winAddSitio").modal("hide");
					}else
						alertify.error("No se pudo eliminar");
				}, "json");
			}
		});
		
		$("#winAddSitio").find("#btnDireccion").click(function(){
			var str = $("#winAddSitio").find("#txtDireccion").val();
			$.get("https://maps.googleapis.com/maps/api/geocode/json?language=es&address=" + str + "&key=AIzaSyACOp_nFCQAIBJwb58so1Ru_AJ8apWv0sY", function(resp){
				$(".list-group").find(".list-group-item").remove();
				$("#winAddSitio").find("#latitud").val();
				$("#winAddSitio").find("#longitud").val();
						
				$.each(resp.results, function(i, lugar){
					var el = $('<li class="list-group-item" latitude="' + lugar.geometry.location.lat +'" longitude="' + lugar.geometry.location.lng +'">' + lugar.formatted_address + '</li>');
					
					$(".list-group").append(el);
					
					el.click(function(){
						var LatLng = new google.maps.LatLng(el.attr("latitude"), el.attr("longitude"));
						mapSitio.setCenter(LatLng);
						marcaSitios.setPosition(LatLng);
						marcaSitios.setMap(mapSitio);
						
						$("#winAddSitio").find("#latitud").val(el.attr("latitude"));
						$("#winAddSitio").find("#longitud").val(el.attr("longitude"));
						
						console.info(LatLng);
					});
				});
			}, "json");
		});
		
		$("#winAddSitio").on('show.bs.modal', function () {
			//$("#winDatosEnvio").modal("hide");
			$("#winAddSitio").find("#latitud").val("");
			$("#winAddSitio").find("#longitud").val("");
			$("#winAddSitio").find("#txtTitulo").val("");
			$("#winAddSitio").find("#txtDireccion").val("");
			$("#winAddSitio").find("#idSitio").val("");
			
			$("#winAddSitio").find("#eliminar").hide();
			
			if($("#winAddSitio").attr("datos") == '' || $("#winAddSitio").attr("datos") == undefined){
				$("#winAddSitio").find(".modal-title").html("Sitios");
			}
		});
		
		$("#winAddSitio").on('hide.bs.modal', function () {
			if (!($("#winAddSitio").attr("datos") == '' || $("#winAddSitio").attr("datos") == undefined))
				$("#winDatosEnvio").modal();
		});
	});
});