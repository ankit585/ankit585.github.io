var sw_w = 15;
var sw_hh = 70;
var sw_h = 130;
var start_y = 70;
var start_x = 0;
var gate = 40;
var door_rotating = 0;

var cells_animals =  {"0,0":null,"0,1":null,"0,2":null,"1,0":null,"1,1":null,"1,2":null,"2,0":null,"2,1":null,"2,2":null,"3,0":null,"3,1":null,"3,2":null};
var fence_coord = {};

function PlayState() {

    var viewport;

    var maxHeight = 600;

    var tiger1;
    var tiger2;
    var wall;
    var fence_back;
    var fence_gate;
    var rotating_fence;


    var sea;
    this.draw_fence = function(mode,row,column) {
        //console.log("Debug : mode:" + mode + " Row:" + row + " Column:" + column);
        if (mode == "horizontal") {
        var fen_b = new jaws.Sprite({anchor:"top_left",image: "img/grass.jpg", x:start_x + 60 + column * 1.5* sw_h, y: start_y + row * sw_h});
        fen_b.setHeight(sw_w);
        fen_b.setWidth(sw_hh);
        fence_back.push(fen_b);
        var fen_g = new jaws.Sprite({anchor:"top_left",image: "img/wood.png", x:start_x + 60 + column * 1.5* sw_h, y: start_y + row * sw_h });
        fen_g.setHeight(sw_w);
        fen_g.setWidth(sw_hh);
        fence_gate.push(fen_g);
        fence_coord[fen_g] = (column) + "," + (row-1)  + "-" + (column) + "," + (row);
        //console.log("Entry: " +  (row-1) + "," + (column)  + "-" + (row) + "," + (column)) ;
        }

        if (mode == "vertical") {
            var fen_b = new jaws.Sprite({image: "img/grass.jpg", x:start_x  + column * 1.5* sw_h, y: 30+start_y + row * sw_h});
            fen_b.setHeight(sw_hh);
            fen_b.setWidth(sw_w);
            fence_back.push(fen_b);
            var fen_g = new jaws.Sprite({image: "img/wood.png", x:start_x  + column * 1.5* sw_h, y: 30+start_y + row * sw_h });
            fen_g.setHeight(sw_hh);
            fen_g.setWidth(sw_w);
            fence_gate.push(fen_g);
            fence_coord[fen_g] = (column-1) + "," + (row)  + "-" + (column) + "," + (row);
            //console.log("Entry: " + (column-1) + "," + (row)  + "-" + (column) + "," + (row));
        }
    };

    this.shift_animals = function (gate_str) {
        //console.log("initiated : " + gate_str);
        var cells = gate_str.split("-");
        if (cells_animals[cells[0]] != null) {
            var animal = cells_animals[cells[0]];
            var cell = cells[1].split(",");
            animal.shift(cell[0], cell[1]);
        } else if (cells_animals[cells[1]] != null) {
            var animal = cells_animals[cells[1]];
            var cell = cells[0].split(",");
            animal.shift(cell[0], cell[1]);
        }
    }

    this.setup = function() {

        //Viewport of 500x800 (jaws.width x maxHeight)
        viewport = new jaws.Viewport({max_x: jaws.width, max_y: maxHeight});

        //Player properties  
        //tiger = new jaws.Sprite({image: "images/squid.png", x: 30, y: 30});
        tiger1 = new Animal (0,1,"images/squid.png");

        tiger2 = new Animal (2,2,"images/squid.png");


        //Coins properties
        wall = new jaws.SpriteList();
        fence_back = new jaws.SpriteList();
        fence_gate = new jaws.SpriteList();
        rotating_fence = new Array();

         //wall : 1
         for(var j=0;j<=3;j++) {
         for(var i = 0; i < 4 ;i++) {
           var wa = new jaws.Sprite({image: "img/wall.png", x:start_x + 1.5*j*sw_h, y: start_y + i*sw_h});
           wa.setHeight(sw_h);
           wa.setWidth(sw_w);
           wall.push(wa);
         }
         }

        for(var j=0;j<=4;j++) {
        for(var i = 0; i < 4 ;i++) {
            var wa = new jaws.Sprite({image: "img/wall.png", x:start_x + i*sw_h, y: start_y + j*sw_h});
            wa.setHeight(sw_w);
            wa.setWidth(sw_h*1.5);
            wall.push(wa);
        }}

          this.draw_fence("vertical",3,1);
          this.draw_fence("vertical",2,1);
          this.draw_fence("vertical",2,2);
          this.draw_fence("vertical",0,1);
          this.draw_fence("vertical",0,2);
          this.draw_fence("vertical",1,1);
          this.draw_fence("vertical",1,2);
          this.draw_fence("horizontal",0,0);
          this.draw_fence("horizontal",3,2);
          this.draw_fence("horizontal",1,2);
          this.draw_fence("horizontal",2,0);

        wall.check = function() {

            //var results = jaws.collideOneWithMany(tiger, wall);

            //if (results.length > 0) {
               // wall.remove(results[0]);
            //}
        };

        //Sea properties
        sea = new jaws.Sprite({image: "img/grass.jpg", x: 0, y: 0, width: jaws.width, height: maxHeight});
        sea.setHeight(600);
        sea.setWidth(600);

    };
    this.update = function() {
        if (door_rotating == 1) {
            var o = rotating_fence[0];
            //console.log("Found new fence:" + o);
            if((o.rotate == 0|| o.rotate == 1) && o.wait == 0) {
                rotating_fence.pop();
                door_rotating = 0;
            }
            if(o.rotate == 0 && o.wait > 0 && o.wait<3) {
                o.rotate = 90;
                o.wait = 0;
            }
            if (o.wait >= 0) {
                if (o.rotate > 0) {
                    o.fence.rotate(1);
                    o.rotate = o.rotate -1;
                }
                if (o.rotate < 0) {
                    o.fence.rotate(-1);
                    o.rotate = o.rotate +1;
                }

            }
            if (o.rotate == 0)
            {
                o.wait = o.wait -1;
            }

        }

        if (jaws.pressed("left_mouse_button")) {

            var x = jaws.mouse_x;
            var y = jaws.mouse_y;
            if (x < 600 && y < 600 && x > 0 && y >0) {

            for (var i = 0;i < fence_gate.length ; i++) {
                var f = fence_gate.sprites[i];
                //console.log("Mouse clicked: x=" + f);
                if ((x > f.x && x < (f.x + f.width)) && (y > f.y && y < (f.y + f.height) )) {

                    if (door_rotating == 0) {
                    var ob = {fence:f,rotate:-90,wait:100};
                    this.shift_animals(fence_coord[f]);
                    rotating_fence.push(ob);
                    door_rotating = 1;
                    }
                }
            }
            }
        }


        tiger1.move();
        tiger2.move();
        wall.check();

    };
    this.draw = function() {
        jaws.clear();
        viewport.draw(sea);
        viewport.draw(wall);
        viewport.draw(fence_back);
        viewport.draw(fence_gate);
        viewport.draw(tiger1.actor);
        viewport.draw(tiger2.actor);

    };
}
jaws.onload = function() {
    jaws.assets.add(["images/coin.png", "images/squid.png","img/grass.jpg","img/wall.png","img/wood.png"]);
    jaws.start(PlayState);
};


 function Animal(row,column,asset) {

    this.cellrow =  row;
    this.cellcolumn = column;
    var s_x = row * sw_h * 1.5;
    var s_y = column * sw_h;
    var size_x = sw_h * 1.5;
    var size_y = sw_h;
    var move_x = 0;
    var move_y = 0;
    cells_animals[row + "," + column] = this;

    this.actor = new jaws.Sprite({image: asset, x: s_x + start_x + size_x/2, y: s_y + start_y + size_y/2});

    this.actor.speed = 1;
    this.actor.dx = 0;
    this.actor.dy = 0;

    this.move = function () {
        this.actor.move();
    };

    this.shift = function(row,column) {
        cells_animals[this.cellrow + "," + this.cellcolumn] = null;
        this.cellrow =  row;
        this.cellcolumn = column;
        cells_animals[this.cellrow + "," + this.cellcolumn] = this;
        s_x = row * sw_h * 1.5;
        s_y = column * sw_h;
        move_x = -1 *(this.actor.x - (s_x + start_x + size_x/2));
        move_y = -1 *(this.actor.y - (s_y + start_y + size_y/2));
        //console.log("DEBUG: row:" + row + " column:" + column + " s_x:" + s_x + " s_y:" + s_y + " start_x:" + start_x + " start_y:" + start_y + " x:" + this.actor.x + " y:"+ this.actor.y + " size_x:" + size_x + " size_y:" + size_y);
        //console.log("Asked to move:" + this.x - (s_x + start_x + size_x/2) + "," + this.y - (s_y + start_y + size_y/2));
    }

    this.actor.move = function() {

       if (move_x == 0 && move_y ==0) {
        var r1 = Math.random();var r2 = Math.random();var x = 3;var y = 1;
        if (r1 > 0.8) {this.dx = x;} else if (r1<0.2) {this.dx = -x;}
        if (r2 > 0.8) {this.dy = y;} else if(r2 < 0.2){this.dy = -y;}
        this.x += this.dx;this.y += this.dy;
        if (this.x < (s_x + sw_w + start_x)) {this.x = s_x + sw_w + start_x;}
        if (this.x > (s_x - sw_w + start_x + size_x)) {this.x = s_x - sw_w + start_x+size_x;}
        if (this.y < (s_y + sw_w + start_y)) {this.y = s_y + sw_w + start_y;}
        if (this.y > (s_y - sw_w + start_y + size_y)) {this.y = s_y - sw_w + start_y + size_y;}
        this.dx = 0;this.dy = 0;
       } else {
           if (move_x > 0) {
               move_x--;
               this.x++;
           } else if (move_x < 0){
               move_x++;
               this.x--;
           }
           if (move_y > 0) {
               move_y--;
               this.y++;
           } else if (move_y < 0){
               move_y++;
               this.y--;
           }
           if (move_x > 0 && move_x < 1) {move_x = 0;}
           if (move_y > 0 && move_y < 1) {move_y = 0;}
           if (move_x  < 0 && move_x > -1) {move_x = 0;}
           if (move_y < 0 && move_y > -1) {move_y = 0;}

       }



     };

}