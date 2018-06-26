var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var image = new Image();
var tmp = new Image();
var graph_color = [ 'red', 'green', 'blue', 'black', 'orange' ];
var graph_count = 0;
var scaleSlider = document.getElementById('scaleSlider');
var scaleOutput = document.getElementById('scaleOutput');
var scale = 1.0, MINIMUN_SCALE = 1.0, MAXIMUM_SCALE = 5.0;
var w = canvas.width, h = canvas.height;
var sw = w * scale, sh = h * scale;
var text_canvas = document.getElementById('equation_text');
var text_context = text_canvas.getContext('2d');
var text_posX = 10, text_posY = 10;
var isMoved = false;


  // 슬라이더 이벤트 핸들러, 텍스트 요소 변경
  scaleSlider.onchange = function(e){
    scale = e.target.value;
    if(scale < MINIMUN_SCALE) scale = MINIMUN_SCALE;
    else if(scale > MAXIMUM_SCALE) scale = MAXIMUM_SCALE;

    var text = parseFloat(scale).toFixed(2);
    scaleOutput.innerHTML = text;
    // 캔버스 확대/축소
    sw = w * scale, sh = h * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image,-sw/2 + w/2, -sh/2 + h/2, sw, sh);
  }
  var offsetX=canvas.offsetLeft;
  var offsetY=canvas.offsetTop;
  var lastX=0;
  var lastY=0;
  var panX=0;
  var panY=0;
  var dragging=[];
  var isDown=false;
  var images=[];

  image.onload=function(){
      draw();
  }
  image.src = tmp.src;

  function draw(){
      context.clearRect(0,0,canvas.width,canvas.height);
      var tw, th;
      var tsw, tsh;
      tw = panX, th = panY;
      tsw = tw * scale, tsh = th * scale;
      context.drawImage(tmp,tsw,tsh,sw,sh);

      for(var i=0;i<images.length;i++){
          var img=images[i];
          context.beginPath();
          context.rect(img.x+panX,img.y+panY,img.width,img.height);
          context.fillStyle=img.color;
          context.fill();
          context.stroke();
      }
  }

  // create an array of any "hit" colored-images
  function imagesHitTests(x,y){
      x-=panX;
      y-=panY;
      var hits=[];
      // hit-test each image
      // add hits to hits[]
      for(var i=0;i<images.length;i++){
          var img=images[i];
          if(x > img.x && x < canvas.width && y > img.y && y < canvas.height){
              hits.push(i);
          }
      }
      return(hits);
  }


  function handleMouseDown(e){
    // get mouse coordinates
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);
    // set the starting drag position
    lastX=mouseX;
    lastY=mouseY;
    // test if we're over any of the images
    dragging=imagesHitTests(mouseX,mouseY);
    // set the dragging flag
    isDown=true;
    isMoved=true;
  }

  function handleMouseUp(e){
    // clear the dragging flag
    isDown=false;
  }


  function handleMouseMove(e){

    // if we're not dragging, exit
    if(!isDown){return;}

    //get mouse coordinates
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);

    // calc how much the mouse has moved since we were last here
    var dx=mouseX-lastX;
    var dy=mouseY-lastY;

    // set the lastXY for next time we're here
    lastX=mouseX;
    lastY=mouseY;

    // handle drags/pans
    if(dragging.length>0){
        // we're dragging images
        // move all affected images by how much the mouse has moved
        for(var i=0;i<dragging.length;i++){
            img=images[dragging[i]];
            img.x+=dx;
            img.y+=dy;
        }
    }else{
        // we're panning the canvas_img
        // set the panXY by how much the mouse has moved
        panX+=dx;
        panY+=dy;
    }
    draw();
  }

  // 이벤트 헨들러 등록
  canvas.onmousedown = function(e){handleMouseDown(e);};
  canvas.onmousemove = function(e){handleMouseMove(e);};
  canvas.onmouseup = function(e){handleMouseUp(e);};

  // 그래프 버튼 수행 함수
  function graph_click(option){
    //alert(option);
    switch(option){
      // 사용방법 출력용 textbox
      case "how":
      var text_box = document.getElementById("how2use");
      if (text_box.style.visibility == "visible") {
        text_box.style.visibility = "hidden";
      }
      else {
        var position = document.getElementById("textbox2");
        var top = get_pos_top(position);
        var left = get_pos_left(position);
        text_box.style.top = top;
        text_box.style.left = left;
        text_box.style.visibility = "visible";
      }
      break;
      // 그래프 추가
      case "add":
      var input = document.getElementById('input').value;
      var i;
      for(i = 0; i < input.length; i++){
        if(input[i] == '=')
          break;
      }
      // 방정식 추출 후 stiring 타입의 내용을 formula형태로 변환
      // stringToformula.js 파일 참조
      var equation = input.substring(i+1,input.length);
      var parser = new Parser();
      var expression = parser.parse(equation);
      // 함수의 인자값으로 전달하여 그래프 출력
      context.clearRect(0, 0, canvas.width, canvas.height);
      image.src = tmp.src;
      context.drawImage(image,0,0,canvas.width,canvas.height);

      myGraph.drawEquation(function(k){
        var result = expression.evaluate({ x : k });
        return result;
      }, graph_color[graph_count]);

      // 직선
      var lineY = 7, lineX = text_posX;
      text_context.lineWidth = '2';
      text_context.beginPath();
      text_context.moveTo(lineX, lineY);
      text_context.lineTo(lineX+10, lineY);
      text_context.strokeStyle = graph_color[graph_count];
      text_context.stroke();
      text_posX += 15;

      // 수식
      text_context.font = '7pt Arial';
      text_context.fillStyle = 'black';
      text_context.fillText(equation, text_posX, text_posY);
      var textWidth = context.measureText(input).width;
      text_posX += (textWidth +15);
      ///text_posX += 15;

      // 새로운 정보를 갱신하기 위해 설정
      graph_count++;
      if(graph_count == 5) graph_count = 0;
      tmp.src = canvas.toDataURL();
      image.src = tmp.src;
      reset();

      break;
      // 캔버스 지우기
      case "clear":
      canvas = document.getElementById('canvas');
      context = canvas.getContext('2d');

      text_canvas = document.getElementById('equation_text');
      text_context = text_canvas.getContext('2d');

      context.clearRect(0, 0, canvas.width, canvas.height);
      text_context.clearRect(0, 0, text_context.width, text_context.height);
      
      // 새롭게 좌표가 그려진 캔버스를 출력
      myGraph = new Graph({
        canvasId: 'canvas',
        minX: -15,
        minY: -10,
        maxX: 15,
        maxY: 10,
        unitsPerTick: 1
      });
      graph_count = 0;
      text_posX = 10, text_posY = 10;

      tmp.src = canvas.toDataURL();
      image.src = tmp.src;
      break;
    }

  }

  function Graph(config) {
    // user defined properties
    this.canvas = canvas;
    this.minX = config.minX;
    this.minY = config.minY;
    this.maxX = config.maxX;
    this.maxY = config.maxY;
    this.unitsPerTick = config.unitsPerTick;

    // constants
    this.axisColor = 'DimGray';
    this.font = '7pt Calibri';
    this.tickSize = 15;

    // relationships
    this.context = context;
    this.rangeX = this.maxX - this.minX;
    this.rangeY = this.maxY - this.minY;
    this.unitX = this.canvas.width / this.rangeX;
    this.unitY = this.canvas.height / this.rangeY;
    this.centerY = Math.round(Math.abs(this.minY / this.rangeY) * this.canvas.height);
    this.centerX = Math.round(Math.abs(this.minX / this.rangeX) * this.canvas.width);
    this.iteration = (this.maxX - this.minX) / 1000;
    this.scaleX = this.canvas.width / this.rangeX;
    this.scaleY = this.canvas.height / this.rangeY;

    // draw x and y axis
    context.font = '7pt Arial';
    context.fillText('O',canvas.width/2 + 5, canvas.height/2 + 12);
    this.drawXAxis();
    this.drawYAxis();
  }

  Graph.prototype.drawXAxis = function() {
    var context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(0, this.centerY);
    context.lineTo(this.canvas.width, this.centerY);
    context.strokeStyle = this.axisColor;
    context.lineWidth = 1;
    context.stroke();

    // 눈금 좌표 설정
    var xPosIncrement = this.unitsPerTick * this.unitX;
    var xPos, unit;
    context.font = this.font;
    context.textAlign = 'center';
    context.textBaseline = 'top';

    // 왼쪽 좌표 출력
    xPos = this.centerX - xPosIncrement;
    unit = -1 * this.unitsPerTick;
    while(xPos > 0) {
      context.moveTo(xPos, this.centerY - this.tickSize / 2);
      context.lineTo(xPos, this.centerY + this.tickSize / 2);
      context.stroke();
      context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
      unit -= this.unitsPerTick;
      xPos = Math.round(xPos - xPosIncrement);
    }

    // 오른쪽 좌표 출력
    xPos = this.centerX + xPosIncrement;
    unit = this.unitsPerTick;
    while(xPos < this.canvas.width) {
      context.moveTo(xPos, this.centerY - this.tickSize / 2);
      context.lineTo(xPos, this.centerY + this.tickSize / 2);
      context.stroke();
      context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
      unit += this.unitsPerTick;
      xPos = Math.round(xPos + xPosIncrement);
    }
    context.font = '12pt Arial';
    context.fillStyle = 'red';
    context.fillText('x',xPos - 8,canvas.height/2 + 8);
    context.restore();
  };

  Graph.prototype.drawYAxis = function() {
    var context = this.context;
    context.save();
    context.beginPath();
    context.moveTo(this.centerX, 0);
    context.lineTo(this.centerX, this.canvas.height);
    context.strokeStyle = this.axisColor;
    context.lineWidth = 1;
    context.stroke();

    // 눈금 좌표 설정
    var yPosIncrement = this.unitsPerTick * this.unitY;
    var yPos, unit;
    context.font = this.font;
    context.textAlign = 'right';
    context.textBaseline = 'middle';

    // 위쪽 눈금 좌표 출력
    yPos = this.centerY - yPosIncrement;
    unit = this.unitsPerTick;
    while(yPos > 0) {
      context.moveTo(this.centerX - this.tickSize / 2, yPos);
      context.lineTo(this.centerX + this.tickSize / 2, yPos);
      context.stroke();
      context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
      unit += this.unitsPerTick;
      yPos = Math.round(yPos - yPosIncrement);
    }
    context.save();
    context.font = '12pt Arial';
    context.fillStyle = 'red';
    context.fillText('y', canvas.width/2 + 20, 15);

    context.restore();
    // 아래쪽 눈금 좌표 출력
    yPos = this.centerY + yPosIncrement;
    unit = -1 * this.unitsPerTick;
    while(yPos < this.canvas.height) {
      context.moveTo(this.centerX - this.tickSize / 2, yPos);
      context.lineTo(this.centerX + this.tickSize / 2, yPos);
      context.stroke();
      context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
      unit -= this.unitsPerTick;
      yPos = Math.round(yPos + yPosIncrement);
    }
    context.restore();
  };


  Graph.prototype.drawEquation = function(equation, color) {
    var context = this.context;
    context.save();
    // context를 canvas의 가운데로 위치
    this.context.translate(this.centerX, this.centerY);
    context.scale(this.scaleX, -this.scaleY);

    context.beginPath();
    context.moveTo(this.minX, equation(this.minX));

    for(var x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
      context.lineTo(x, equation(x));
    }

    context.restore();
    context.lineJoin = 'round';
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
    context.restore();
  };
  var myGraph = new Graph({
    canvasId: 'canvas',
    minX: -15,
    minY: -10,
    maxX: 15,
    maxY: 10,
    unitsPerTick: 1
  });
  window.onload = function(e){
    tmp.src = canvas.toDataURL();
    image.src = tmp.src;
  }
