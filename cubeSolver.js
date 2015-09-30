

function AbstractSolver(){
	this.encounteredHashes = {};
	this.ops = null;
	this.stateCount = 0;
}

AbstractSolver.prototype = {
	checkAlreadyHasState : function(newHash){
		if(this.encounteredHashes.hasOwnProperty(newHash)){
			return true;
		}
		this.encounteredHashes[newHash] = true;
		return false;
	},
	hash: function(){throw "must implement"},
	calcEndState: function(){throw "must implement"},
	getInitialBoard: function(){throw "must implement"},
	pushStates: function(){throw "must implement"},
	pushNewState : function(op, q, state, board){
		var newBoard = this.ops[op](board);
		var newHash = this.hash(newBoard);
		
		if(this.checkAlreadyHasState(newHash)){
			//aleady been in this state, so don't explore it further
			return;
		}
		
		this.stateCount++;
		q.enqueue({
			board: newBoard,
	        hash: newHash,
			op: op,
			prevState: state
		});
	},
	report : function(state){
		var cs = state;
		var ops = [state.op];
		while(true){
	        cs = cs.prevState;
	        if(!cs){
	          break;
	        }
			ops.push(cs.op)
		}
		
		ops.reverse();
		console.log(ops.join(" "))
		var d = document.getElementById("output");
		d.innerHTML = ops.join(" ") + '<br>' + "state count: " + this.stateCount;
	}, 
	run: function(){
		var board = this.getInitialBoard();

		var endStateHash = this.calcEndState(board);
		var initHash = this.hash(board);
	 
		this.encounteredHashes[initHash] = true;
	  	var initState = {
			board: board,
			op: 'nop',
			prevState: null,
			hash: initHash
		};
		var q = new Queue();
		q.enqueue(initState);

		while(true){
			if(q.isEmpty()){
				alert("no solution found");
				break;
			}
			var state = q.dequeue();
			
			if(state.hash == endStateHash){
				this.report(state);
				break;
			}
			
			board = state.board;
			
			this.pushStates(q, state, board);
			// if(stateCount % 500 == 0){
			// 	console.log("q: " + q.getLength())
			// }
		}	
	}
};

////////////////////////////////////////////////////////////////////////
//////// FiveByFiveSolver
////////////////////////////////////////////////////////////////////////

function FiveByFiveSolver(){}
//http://phrogz.net/JS/classes/OOPinJS2.html
FiveByFiveSolver.prototype = new AbstractSolver();
FiveByFiveSolver.prototype.constructor = FiveByFiveSolver;
FiveByFiveSolver.prototype.parent = AbstractSolver.prototype;
FiveByFiveSolver.prototype.getInitialBoard = function(){
	return {
		top: [
			0,0,0,
			0,0,1,
			0,0,1
		],
		front: [
			1,1,1,
			1,1,0,
			1,1,0
		],
		rotated: "N",
		hiddenBack: [-1,-1,-1],
		hiddenBottom: [-1,-1,-1]
	};
};

FiveByFiveSolver.prototype.calcEndState = function(board){
	var tc = board.top[4];
	var fc = board.front[4];
	return this.hash({
		top:[	
			tc, tc, tc, 
			tc, tc, tc, 
			tc, tc, tc
		],
		front:[ 
			fc, fc, fc,
			fc, fc, fc,
			fc, fc, fc
		],
		rotated: "N",
		hiddenBack: [-1,-1,-1],
		hiddenBottom: [-1,-1,-1]
	});	
};

FiveByFiveSolver.prototype.hash = function(board){
	return [
		board.top.join(""),
		board.front.join(""),
		board.rotated,
		board.hiddenBack.join(""),
		board.hiddenBottom.join("")
	].join("");
};

FiveByFiveSolver.prototype.ops = {
	"T": function(board){
		var t = board.top;
		return {
			top: [
				t[6], t[3], t[0],
				t[7], t[4], t[1],
				t[8], t[5], t[2]
			],
			front: board.front.slice(),
			rotated: board.rotated,
			hiddenBack: board.hiddenBack.slice(),
			hiddenBottom: board.hiddenBottom.slice()
		};
	},
	"T'": function(board){
		var t = board.top;
		return {
			top: [
				t[2], t[5], t[8],
				t[1], t[4], t[7],
				t[0], t[3], t[6]
			],
			front: board.front.slice(),
			rotated: board.rotated,
			hiddenBack: board.hiddenBack.slice(),
			hiddenBottom: board.hiddenBottom.slice()
		};
	},
	"F": function(board){
		var f = board.front;
		return {
			top: board.top.slice(),
			front: [
				f[6], f[3], f[0],
				f[7], f[4], f[1],
				f[8], f[5], f[2]
			],
			rotated: board.rotated,
			hiddenBack: board.hiddenBack.slice(),
			hiddenBottom: board.hiddenBottom.slice()
		};
	},
	"F'": function(board){
		var f = board.front;
		return {
			top:board.top.slice(),
			front: [
				f[2], f[5], f[8],
				f[1], f[4], f[7],
				f[0], f[3], f[6]
			],
			rotated: board.rotated,
			hiddenBack: board.hiddenBack.slice(),
			hiddenBottom: board.hiddenBottom.slice()
		};
	},
	"rR": function(board){
		var t = board.top.slice();
		var f = board.front.slice();
		var hiddenBack = [t[2], t[5], t[8]];
		var hiddenBottom = [-1, -1, -1];
		var hb = board.hiddenBottom;
		
		t[2] = f[2];
		t[5] = f[5];
		t[8] = f[8];
		
		var rotated;
		if(board.rotated == "N" ){
			rotated = "R";
			f[2] = -1;
			f[5] = -1;
			f[8] = -1;
		} else if(board.rotated == "R"){
			throw "bad state";
		} else if(board.rotated == "P"){
			rotated = "N";
			f[2] = hb[0];
			f[5] = hb[1];
			f[8] = hb[2];
		} else {
			throw "unknown state";
		}
		return {
			top: t,
			front: f,
			rotated: rotated,
			hiddenBack: hiddenBack,
			hiddenBottom: hiddenBottom
		};
	},
	"rR'": function(board){
		var t = board.top.slice();
		var f = board.front.slice();
		var hiddenBack = [-1, -1, -1];
		var hiddenBottom = [f[2], f[5], f[8]];
		
		f[2] = t[2];
		f[5] = t[5];
		f[8] = t[8];

		var rotated;
		if(board.rotated == "N" ){
			rotated = "P";
			t[2] = -1;
			t[5] = -1;
			t[8] = -1;
		} else if(board.rotated == "R"){
			rotated = "N";
			t[2] = board.hiddenBack[0];
			t[5] = board.hiddenBack[1];
			t[8] = board.hiddenBack[2];
		} else if(board.rotated == "P"){
			throw "bad state";
		}
		
		return {
			top: t,
			front: f,
			rotated: rotated,
			hiddenBack: hiddenBack,
			hiddenBottom: hiddenBottom
		};	
	}
};


FiveByFiveSolver.prototype.pushStates = function(q, state, board){
	if(board.rotated == "N"){
		this.pushNewState("T", 	q, state, board);
		this.pushNewState("T'", q, state, board);
		this.pushNewState("F", 	q, state, board);
		this.pushNewState("F'", q, state, board);
		this.pushNewState("rR", q, state, board);
		this.pushNewState("rR'",q, state, board);
	} else if(board.rotated == "R") {
		this.pushNewState("T", 	q, state, board);
		this.pushNewState("T'", q, state, board);
		this.pushNewState("rR'",q, state, board);
	} else if(board.rotated == "P") {
		this.pushNewState("F", 	q, state, board);
		this.pushNewState("F'", q, state, board);
		this.pushNewState("rR", q, state, board);
	} else {
		throw "unknown rotation"
	}
};

////////////////////////////////////////////////////////////////////////
//////// ThreeByThreeSolver
////////////////////////////////////////////////////////////////////////

function ThreeByThreeSolver(){}

ThreeByThreeSolver.prototype = new AbstractSolver();
ThreeByThreeSolver.prototype.constructor = ThreeByThreeSolver;
ThreeByThreeSolver.prototype.parent = AbstractSolver.prototype;

ThreeByThreeSolver.prototype.hash = function(board){
	return [
		board.tops.join(""),
		board.edges.join(""),
		board.keyBlock.join(""),
		board.hiddenRight.join(""),
		board.hiddenLeft.join(""),
		board.hasRotated
	].join("");
};

ThreeByThreeSolver.prototype.calcEndState = function(board){
	var c = board.centers;
	var tc = board.topCenter;
	return this.hash({
		tops: [tc, tc, tc, tc],
		edges: [c[0], c[1], c[2], c[3]],
		keyBlock: [c[3], c[0]],
		hiddenRight: ['x', 'x'],
		hiddenLeft: ['x', 'x'],
		hasRotated: "N"
	});
};


var assert = function(truth){
	if(!truth){
		throw "assertion failed";
	}
	return;
};

ThreeByThreeSolver.prototype.ops = {
	copy: function(board){
		return {
			topCenter: board.topCenter,
			hasRotated: board.hasRotated,
			centers: board.centers.slice(0),
			tops: board.tops.slice(0),
			edges: board.edges.slice(0),
			keyBlock: board.keyBlock.slice(0),
			hiddenRight: board.hiddenRight.slice(0),
			hiddenLeft: board.hiddenLeft.slice(0)
		};
	},
	'nop': function(board){
		return this.copy(board);
	},
	"T": function(board){
		var b = this.copy(board);
		b.tops = [b.tops[1], b.tops[2], b.tops[3], b.tops[0]];
		b.edges = [b.edges[1], b.edges[2], b.edges[3], b.edges[0]];
		return b;
	},
	"T'": function(board){
		var b = this.copy(board);
		b.tops = [b.tops[3], b.tops[0], b.tops[1], b.tops[2]];
		b.edges = [b.edges[3], b.edges[0], b.edges[1], b.edges[2]];
		return b;
	},
	'R': function(board){
		var b = this.copy(board);
		assert(b.hasRotated == "N");
		b.hiddenRight = [b.edges[0], b.tops[0]];
		b.edges[0] = b.keyBlock[1];
		b.tops[0] = b.keyBlock[0];
		b.keyBlock = ['x', 'x'];
		b.hasRotated = "Y";
		return b;
	},
	"R'": function(board){
		var b = this.copy(board);
		assert(b.hasRotated == "Y");
		b.hasRotated = "N";
		b.keyBlock[0] = b.tops[0];
		b.keyBlock[1] = b.edges[0];
		b.tops[0] = b.hiddenRight[1];
		b.edges[0] = b.hiddenRight[0];
		b.hiddenRight = "xx".split("");
		return b;
	},
	'L': function(board){
		var b = this.copy(board);
		assert(b.hasRotated == "Y");
		b.hasRotated = "N";
		b.keyBlock[0] = b.edges[3];
		b.keyBlock[1] = b.tops[3];
		b.tops[3] = b.hiddenLeft[1];
		b.edges[3] = b.hiddenLeft[0];
		b.hiddenLeft = "xx".split("");
		return b;
	},
	"L'": function(board){
		var b = this.copy(board);
		assert(b.hasRotated == "N");
		b.hiddenLeft = [b.edges[3], b.tops[3]];
		b.edges[3] = b.keyBlock[0];
		b.tops[3] = b.keyBlock[1];
		b.keyBlock = ['x', 'x'];
		b.hasRotated = "Y";
		return b;
	}
};

ThreeByThreeSolver.prototype.getInitialBoard = function(){
	return {
		topCenter: "o",
		hasRotated: "N",
		centers : "wbyg".split(""),
		tops: "oooo".split(""),
		edges: "ybwg".split(""),
		keyBlock: "gw".split(""),
		hiddenRight: "xx".split(""),
		hiddenLeft: "xx".split("")
	};
};

ThreeByThreeSolver.prototype.pushStates = function(q, state, board){
	this.pushNewState("T", q, state, board);
	this.pushNewState("T'", q, state, board);
	
	if(board.hasRotated == "N"){
		this.pushNewState("R", q, state, board);
		this.pushNewState("L'", q, state, board);
	}
	
	if(board.hasRotated == "Y"){
		this.pushNewState("R'", q, state, board);
		this.pushNewState("L", q, state, board);
	}	
};

