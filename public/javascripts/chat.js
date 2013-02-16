
var socket;
var stage, g1, g2, s1, s2, x, y;
var drawing = false;
var target;


var newRoom = function(){
	var room = prompt("Enter a name for your room");
	socket.emit('new_room',room);
	$("a.active").removeClass('active');
	var li = document.createElement('li');
	var a = document.createElement('a');
	a.innerHTML = room;
	a.className = "active";
	a.addEventListener('click',joinRoom,false);
	li.appendChild(a);
	document.getElementById('rooms').appendChild(li);
	
}


var joinRoom = function(e){
	target = e.target;
	console.log(target.innerHTML);
	socket.emit('change_room',"/"+target.innerHTML);
	return false;
}
var init = function(){
	$("#new-room").on('click',newRoom);
	//document.getElementById('new-room').addEventListener('click',newRoom,false);
	socket.on('status_of_join',function(bool,newRoom,socket){
		if(bool){
			$("a.active").removeClass('active');
			target.className = "active";
		}
		else{
			alert("room full");
		}
	});
	socket.on('update_rooms',function(rooms){
		console.log(rooms);
		for(var x in rooms){
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.innerHTML = x.slice(1);
			a.addEventListener('click',joinRoom,false);
			li.appendChild(a);
			document.getElementById('rooms').appendChild(li);
		}
	});
	socket.on('new_room',function(room){
		
		var li = document.createElement('li');
			var a = document.createElement('a');
			a.innerHTML = room;
			a.addEventListener('click',joinRoom,false);
			li.appendChild(a);
			document.getElementById('rooms').appendChild(li);
		});
	socket.on('remove_room',function(room){
		$("a:contains('"+room+"')").remove();
	});
	socket.on('room_status',function(bool){
		if(bool){
			if(document.getElementById('canvas').style['visibility'] != 'visible'){
		$("#canvas").css('visibility','visible');
		$("#canvas").css('z-index',99999);
		}
	}
	else{
			alert("room full");
		}
	
	});

	socket.on('mousedownn',function(x,y){
		x = x;
		y = y;
		drawing = true;
		g1.moveTo(x,y);
	});

	socket.on('mousemovee',function(x,y){
		if(drawing){
			g1.lineTo(x,y);
		}
	});

	socket.on('mouseupp',function(){
		drawing = false;
	});

	var canvas = document.getElementById("canvas");

	stage = new createjs.Stage(canvas);
	g1 = new createjs.Graphics();
	g1.setStrokeStyle(1);
	g1.beginStroke(createjs.Graphics.getRGB(0,0,0));
	
	s1 = new createjs.Shape(g1);

	stage.addChild(s1);
	
	canvas.onmousedown = function(e){
		console.log("pressed");
		g1.moveTo(stage.mouseX,stage.mouseY);

		socket.emit('mousedown',stage.mouseX,stage.mouseY);

		canvas.addEventListener('mousemove', mousemove,false);
	}

	canvas.onmouseup = function(){
		socket.emit('mouseup');
		canvas.removeEventListener('mousemove', mousemove, false);
	}

	var mousemove = function(e){

		socket.emit('mousemove',stage.mouseX,stage.mouseY);

		g1.lineTo(stage.mouseX,stage.mouseY);
	}

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addListener(stage);
	stage.update();

}

function setNickName(){
	var nickName = prompt("Please choose a nickname?");
	if(nickName){
		socket = io.connect('http://localhost:3000');
		socket.emit('new_user',nickName);
		$("#welcome").remove();
		$("#holder").css('visibility','visible');
		$("canvas").css('z-index',99999);

		init();
	}
}


window.onload = function(){
	document.getElementById('set').addEventListener('click',setNickName,false);	

}