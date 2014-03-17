var sw_w = 15;
var sw_hh = 70;
var sw_h = 130;
var start_y = 70;
var start_x = 0;
var gate = 40;
var door_rotating = 0;

var score = 0;

var cells_animals =  {"0,0":new Array(),"0,1":new Array(),"0,2":new Array(),"1,0":new Array(),"1,1":new Array(),"1,2":new Array(),
    "2,0":new Array(),"2,1":new Array(),"2,2":new Array(),"3,0":new Array(),"3,1":new Array(),"3,2":new Array()};

var fence_coord = {};
var battery_sheet = null;
var heart_sheet = null;
var score_sheet = null;
var heart;
var heart_left=0;
var food_list = new Array();
var score_list = {};
var food_countdown = 1500;

function MenuState() {

    var menu;
    var background;

    this.setup = function() {
        menu = new jaws.Sprite({image: "img/menu.png", x: 100, y: 200});
        background = new jaws.Sprite({color: "#8ED6FF", width: jaws.width, height: jaws.height, x: 0, y: 0});
    };
    this.update = function() {
        if (jaws.pressed("enter")) {
            jaws.switchGameState(PlayState);
        }
    };
    this.draw = function() {
        background.draw();
        menu.draw();
    };
}
function EndState() {

    var end;
    var background;

    this.setup = function() {
        end = new jaws.Sprite({image: "img/end.png", x: 100, y: 200});
        background = new jaws.Sprite({color: "#8ED6FF", width: jaws.width, height: jaws.height, x: 0, y: 0});
    };
    this.update = function() {
        if (jaws.pressed("enter")) {
            jaws.switchGameState(PlayState);
        }
    };
    this.draw = function() {
        background.draw();
        end.draw();
    };
}





function PlayState() {

    var viewport;

    var maxHeight = 600;

    var tiger;
    var rabbit;
    var deer;
    var croc;
    var zebra;
    var lion;

    var wall;
    var fence_back;
    var fence_gate;
    var rotating_fence;

    var meat;

    battery_sheet = new jaws.SpriteSheet({image: "img/battery.png", frame_size: [39, 18], orientation: "right"});
    heart_sheet = new jaws.SpriteSheet({image: "img/heartSheet.png", frame_size: [78, 64], orientation: "right"});
    score_sheet = new jaws.SpriteSheet({image: "img/score.png", frame_size: [29, 50], orientation: "right"});

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
        if (cells_animals[cells[0]] != null && cells_animals[cells[0]].length != 0) {
            var animal = cells_animals[cells[0]][0];
            var cell = cells[1].split(",");
            animal.shift(cell[0], cell[1]);
        } else if (cells_animals[cells[1]] != null && cells_animals[cells[1]].length != 0) {
            var animal = cells_animals[cells[1]][0];
            var cell = cells[0].split(",");
            animal.shift(cell[0], cell[1]);
        }
    };

    this.update_score = function() {
    var sc = Math.floor(score);
    var count = 0;
        while (sc > 0) {
            var rem = sc%10;
            sc = Math.floor(sc / 10);
            score_list[count].setImage(score_sheet.frames[rem]);
            count++;
        }
    };

    this.generate_food = function() {

        if (cells_animals["0,0"].length == 0) {
            food_countdown--;
            if (food_countdown <= 0) {
                var rand = Math.random();
                if (rand > 0.5) {
                    food = new Food("vegi",0,0);
                    food_countdown = 1000;
                } else{
                    food = new Food("meat",0,0);
                    food_countdown = 1500;
                }
            }
        }
    };

    this.feed_animals = function () {

        for (var i = 0; i < 3 ; i++) {
            for (var j = 0; j< 4; j++) {

                // kill all lower beings
                var elements = cells_animals[i + "," + j];
                var isPredatorPresent = 0;
                if (elements != null) {
                for (var k = 0; k < elements.length;k++) {
                    if (elements[k].auk == 2 && elements[k].active ==1) {
                        isPredatorPresent = 1;
                    }
                }
                if (isPredatorPresent ==1) {
                    for (var k = 0; k < elements.length;k++) {
                    if (elements[k].auk == 1 && elements[k].active ==1) {
                        elements[k].energy = 0;
                    }
                    }
                }


                for (var animal = 0; animal < elements.length;animal++) {
                    if (elements[animal].auk == 2 && elements[animal].active ==1) {
                        for (var animal1 = 0; animal1 < elements.length;animal1++) {
                            if (elements[animal1].auk == -1 && elements[animal1].active ==1) {
                                var energy_required = 100 - Math.floor(elements[animal].energy);
                                //console.log("Energy Required:" + energy_required + " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                if (Math.floor((energy_required)) < Math.floor(elements[animal1].energy)) {
                                    //console.log("Getting partial Energy"+ " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                    elements[animal].energy = elements[animal].energy + energy_required;
                                    elements[animal1].energy = elements[animal1].energy - energy_required;
                                    score = score + energy_required;
                                } else{
                                    //console.log("Getting All Energy"+ " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                    elements[animal].energy = elements[animal].energy + elements[animal1].energy;
                                    score = score + elements[animal1].energy;
                                    elements[animal1].energy = 0;

                                }
                            }
                        }
                    }


                    if (elements[animal].auk == 1 && elements[animal].active ==1) {
                        for (var animal1 = 0; animal1 < elements.length;animal1++) {
                            if (elements[animal1].auk == -2 && elements[animal1].active ==1) {
                                var energy_required = 100 - Math.floor(elements[animal].energy);
                                //console.log("Energy Required:" + energy_required + " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                if (Math.floor((energy_required)) < Math.floor(elements[animal1].energy)) {
                                    //console.log("Getting partial Energy"+ " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                    elements[animal].energy = elements[animal].energy + energy_required;
                                    elements[animal1].energy = elements[animal1].energy - energy_required;
                                    score = score + energy_required;
                                } else{
                                    //console.log("Getting All Energy"+ " Predator:" + elements[animal].energy + " Food:" + elements[animal1].energy);
                                    elements[animal].energy = elements[animal].energy + elements[animal1].energy;
                                    score = score + elements[animal1].energy;
                                    elements[animal1].energy = 0;
                                }
                            }
                        }
                    }
                }

                }
            }
        }
    };

    this.setup = function() {

        score_list = new Array();

        //Viewport of 500x800 (jaws.width x maxHeight)
        viewport = new jaws.Viewport({max_x: jaws.width, max_y: maxHeight});

        //Player properties  
        //tiger = new jaws.Sprite({image: "images/squid.png", x: 30, y: 30});
        tiger = new Animal (0,1,"img/tiger_left.png","img/tiger_right.png",1,58,30,16,100,2);
        rabbit = new Animal (1,1,"img/rabbit_left.png","img/rabbit_right.png",1,40,40,10,100,1);
        deer = new Animal (2,1,"img/deer_left.png","img/deer_right.png",1,60,49,7,100,1);
        croc = new Animal (2,2,"img/croc_left.png","img/croc_right.png",0,93,51,4,800,2);
        zebra = new Animal (2,3,"img/zebra_left.png","img/zebra_right.png",1,54,54,9,300,1);
        lion = new Animal (1,3,"img/lion_left.png","img/lion_right.png",1,80,61,12,300,2);


        heart = new jaws.Sprite({ x: 515, y: 05});
        score_list[0] = new jaws.Sprite({image:score_sheet.frames[0], x: 465, y: 15});
        score_list[1] = new jaws.Sprite({image:score_sheet.frames[0], x: 435, y: 15});
        score_list[2] = new jaws.Sprite({image:score_sheet.frames[0], x: 405, y: 15});
        score_list[3] = new jaws.Sprite({image:score_sheet.frames[0], x: 375, y: 15});

       // battery_sheet = new jaws.SpriteSheet({image: "img/battery.png", frame_size: [39, 54], orientation: "right"});
       // console.log("Total elements : " + battery_sheet.frames.length);

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
          this.draw_fence("horizontal",3,1);
          this.draw_fence("horizontal",2,0);
        this.draw_fence("horizontal",1,0);

        wall.check = function() {


        };

        //Sea properties
        sea = new jaws.Sprite({image: "img/grass.jpg", x: 0, y: 0, width: jaws.width, height: maxHeight});
        sea.setHeight(600);
        sea.setWidth(600);

    };
    this.update = function() {
        this.generate_food();
        this.update_score();
        this.feed_animals();
        if (heart_left == 3) {
            jaws.switchGameState(EndState);
        } else {
        heart.setImage(heart_sheet.frames[heart_left]);
        if (door_rotating == 1) {
            var o = rotating_fence[0];
            //console.log("Found new fence:" + o);
            if((o.rotate == 0|| o.rotate == 1|| o.rotate == -1) && o.wait == 0) {
                rotating_fence.pop();
                door_rotating = 0;
            }
            if(o.rotate == 0 && o.wait > 0 && o.wait<3) {
                o.rotate = 90;
                o.wait = 0;
            }
            if (o.wait >= 0) {
                if (o.rotate >= 1) {
                    o.fence.rotate(3);
                    o.rotate = o.rotate -3;
                }
                if (o.rotate <= -1) {
                    o.fence.rotate(-3);
                    o.rotate = o.rotate +3;
                }

            }
            if (o.rotate == 0)
            { if (o.wait >=2)
                o.wait = o.wait -2;
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
                    var ob = {fence:f,rotate:-90,wait:50};
                    this.shift_animals(fence_coord[f]);
                    rotating_fence.push(ob);
                    door_rotating = 1;
                    }
                }
            }
            }
        }

       for (var i=0; i < food_list.length;i++) {

            var f = food_list[i];
            if (f.active == 1) {
                f.move();
            }
        }


        wall.check();

    }};
    this.draw = function() {
        jaws.clear();
        viewport.draw(sea);
        viewport.draw(wall);
        viewport.draw(fence_back);
        viewport.draw(fence_gate);
        viewport.draw(heart);

        for (var i=0; i < score_list.length;i++) {
            var f = score_list[i];
            viewport.draw(f);
        }
        for (var i=0; i < food_list.length;i++) {

            var f = food_list[i];
            if (f.active == 1) {
               viewport.draw(f.actor);
               viewport.draw(f.health);
            }
        }



    };
}


jaws.onload = function() {
    jaws.assets.add(["images/coin.png", "images/squid.png","img/grass.jpg","img/wall.png","img/wood.png","img/tiger_left.png","img/tiger_right.png",
        "img/rabbit_left.png","img/rabbit_right.png","img/deer_left.png","img/deer_right.png","img/croc_left.png","img/croc_right.png","img/zebra_left.png",
        "img/zebra_right.png","img/lion_right.png","img/lion_left.png","img/battery.png","img/heartSheet.png","img/menu.png","img/end.png","img/meat.png","img/vegi.png","img/score.png"]);
    jaws.start(PlayState);
};


function Food(type,row,column) {

    this.cellrow = row;
    this.cellcolumn = column;
    var s_x = row * sw_h * 1.5;
    var s_y = column * sw_h;
    var size_x = sw_h * 1.5;
    var size_y = sw_h;
    var move_x = 0;
    var move_y = 0;
    this.energy  = 100;
    this.spend = 0.025;
    this.active = 1;
    this.image = "";
    this.auk = -1;
    if (type == "meat") {
        this.image = "img/meat.png";
        this.auk = -1;
    } else if (type == "vegi") {
        this.image = "img/vegi.png";
        this.auk = -2;
    }
    this.actor = new jaws.Sprite({image:this.image,x: s_x + start_x + size_x/2, y: s_y + start_y + size_y/2,height:30,width:30});
    this.health = new jaws.Sprite({image: battery_sheet.frames[0], x: this.actor.x+20, y: this.actor.y-20});
    food_list.push(this);
    if (cells_animals[row+","+column] == null) {
        cells_animals[row+","+column] = new Array();
    }
    cells_animals[row + "," + column].push(this);

    this.move = function () {
        if (this.active == 1) {
            this.energy = this.energy - this.spend;
            if (this.energy >= 0) {
                this.health.setImage(battery_sheet.frames[Math.floor(this.energy/10)]);
                this.actor.move();
                this.health.x = this.actor.x + 20;
                this.health.y = this.actor.y - 20;
            } else {
                //console.log("Someone killed");

                this.active = 0;
                //var f = new Food("meat",this.cellrow,this.cellcolumn);
               // heart_left++;
                if (heart_left == 3) {
                    jaws.switchGameState(EndState);
                }
            }
        }
    };

    this.shift = function(row,column) {
        var animal_index = cells_animals[this.cellrow + "," + this.cellcolumn].indexOf(this);
        cells_animals[this.cellrow + "," + this.cellcolumn].splice(animal_index,1);
        //cells_animals[this.cellrow + "," + this.cellcolumn] = null;
        this.cellrow =  row;
        this.cellcolumn = column;
        if (cells_animals[this.cellrow+","+this.cellcolumn] == null) {
            cells_animals[this.cellrow+","+this.cellcolumn] = new Array();
        }
        cells_animals[this.cellrow + "," + this.cellcolumn].push(this);
        s_x = row * sw_h * 1.5;
        s_y = column * sw_h;
        move_x = -1 *(this.actor.x - (s_x + start_x + size_x/2));
        move_y = -1 *(this.actor.y - (s_y + start_y + size_y/2));

        //console.log("DEBUG: row:" + row + " column:" + column + " s_x:" + s_x + " s_y:" + s_y + " start_x:" + start_x + " start_y:" + start_y + " x:" + this.actor.x + " y:"+ this.actor.y + " size_x:" + size_x + " size_y:" + size_y);
        //console.log("Asked to move:" + this.x - (s_x + start_x + size_x/2) + "," + this.y - (s_y + start_y + size_y/2));
    }

    this.actor.move = function() {


            if (move_x > 0) {
                //this.setImage(this.anim_default.next());
                move_x--;
                this.x++;
                move_x--;
                this.x++;
            } else if (move_x < 0){
               // this.setImage(this.anim_up.next());
                move_x++;
                this.x--;
                move_x++;
                this.x--;
            }
            if (move_y > 0) {
                move_y--;
                this.y++;
                move_y--;
                this.y++;
            } else if (move_y < 0){
                move_y++;
                this.y--;
                move_y++;
                this.y--;
            }
            if (move_x > 0 && move_x < 1) {move_x = 0;}
            if (move_y > 0 && move_y < 1) {move_y = 0;}
            if (move_x  < 0 && move_x > -1) {move_x = 0;}
            if (move_y < 0 && move_y > -1) {move_y = 0;}


    };

}


 function Animal(row,column,asset_left,asset_right,speed,frame_width,frame_height,frames,fd,auk) {

    this.cellrow =  row;
    this.cellcolumn = column;
    this.energy  = 100*Math.random();
    this.spend = 0.01;
    this.active = 1;
    this.alive = 1;
    this.auk = auk;
    var s_x = row * sw_h * 1.5;
    var s_y = column * sw_h;
    var size_x = sw_h * 1.5;
    var size_y = sw_h;
    var move_x = 0;
    var move_y = 0;
    var speed = speed;
     if (cells_animals[row+","+column] == null) {
         cells_animals[row+","+column] = new Array();
     }
     (cells_animals[row + "," + column]).push(this);
    food_list.push(this);


    //console.log("Checking element 0 :" + battery_sheet.frames[0]);
    this.actor = new jaws.Sprite({x: s_x + start_x + size_x/2, y: s_y + start_y + size_y/2});
    this.health = new jaws.Sprite({image: battery_sheet.frames[0], x: this.actor.x+20, y: this.actor.y-20});
     var playerAnim_left = new jaws.Animation({sprite_sheet: asset_left, frame_size: [frame_width,frame_height], frame_duration: fd, orientation: "right"});
     var playerAnim_right = new jaws.Animation({sprite_sheet: asset_right, frame_size: [frame_width,frame_height], frame_duration: fd, orientation: "right"});

    this.actor.anim_up = playerAnim_left.slice(0, frames -1);
    this.actor.anim_default = playerAnim_right.slice(0, frames -1);
    this.actor.speed = 1;
    this.actor.dx = 0.3;
    var rand = Math.random();
    if (rand > 0.5) {
        this.actor.dx = -1 * this.actor.dx;
    }
    this.actor.dy = 0.05;

    this.move = function () {
        if (this.active == 1) {
        this.energy = this.energy - this.spend;
        if (this.energy >= 0) {
           this.health.setImage(battery_sheet.frames[Math.floor(this.energy/10)]);
           this.actor.move();
           this.health.x = this.actor.x + 20;
           this.health.y = this.actor.y - 20;
        } else {
            //console.log("Someone killed");

            this.active = 0;
            var f = new Food("meat",this.cellrow,this.cellcolumn);
            heart_left++;
            if (heart_left == 3) {
                jaws.switchGameState(EndState);
            }
        }
        }
    };

    this.shift = function(row,column) {
        var animal_index = cells_animals[this.cellrow + "," + this.cellcolumn].indexOf(this);
        cells_animals[this.cellrow + "," + this.cellcolumn].splice(animal_index,1);

        //cells_animals[this.cellrow + "," + this.cellcolumn] = null;
        this.cellrow =  row;
        this.cellcolumn = column;
        if (cells_animals[this.cellrow+","+this.cellcolumn] == null) {
            cells_animals[this.cellrow+","+this.cellcolumn] = new Array();
        }
        cells_animals[this.cellrow + "," + this.cellcolumn].push(this);
        s_x = row * sw_h * 1.5;
        s_y = column * sw_h;
        move_x = -1 *(this.actor.x - (s_x + start_x + size_x/2));
        move_y = -1 *(this.actor.y - (s_y + start_y + size_y/2));

        //console.log("DEBUG: row:" + row + " column:" + column + " s_x:" + s_x + " s_y:" + s_y + " start_x:" + start_x + " start_y:" + start_y + " x:" + this.actor.x + " y:"+ this.actor.y + " size_x:" + size_x + " size_y:" + size_y);
        //console.log("Asked to move:" + this.x - (s_x + start_x + size_x/2) + "," + this.y - (s_y + start_y + size_y/2));
    }

    this.actor.move = function() {

       if (move_x == 0 && move_y ==0) {
           if (this.dx < 0)
           this.setImage(this.anim_up.next());
           else
            this.setImage(this.anim_default.next());

        this.x += this.dx*speed;this.y += this.dy*speed;
        if (this.x < (s_x + sw_w + start_x)) {this.x = s_x + sw_w + start_x;this.dx = this.dx * -1;}
        if (this.x > (s_x - 3*sw_w + start_x + size_x)) {this.x = s_x - 3*sw_w + start_x+size_x;this.dx = this.dx * -1;}
        if (this.y < (s_y + sw_w + start_y)) {this.y = s_y + sw_w + start_y;this.dy = this.dy * -1;}
        if (this.y > (s_y - 3*sw_w + start_y + size_y)) {this.y = s_y - 3*sw_w + start_y + size_y;this.dy = this.dy * -1;}
        //this.dx = 0;this.dy = 0;
       } else {
           if (move_x > 0) {
               this.setImage(this.anim_default.next());
               move_x--;
               move_x--;
               this.x++;
               this.x++;
           } else if (move_x < 0){
               this.setImage(this.anim_up.next());
               move_x++;
               move_x++;
               this.x--;
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