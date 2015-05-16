var stateCount = 0 ;

var copy = function(board){
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
};

var hash = function(board){
	return [
		board.tops.join(""),
		board.edges.join(""),
		board.keyBlock.join(""),
		board.hiddenRight.join(""),
		board.hiddenLeft.join(""),
		board.hasRotated
	].join("");
};

var calcEndState = function(board){
	var c = board.centers;
	var tc = board.topCenter;
	return hash({
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

var ops = {
	'nop': function(board){
		return copy(board);
	},
	"T": function(board){
		var b = copy(board);
		b.tops = [b.tops[1], b.tops[2], b.tops[3], b.tops[0]];
		b.edges = [b.edges[1], b.edges[2], b.edges[3], b.edges[0]];
		return b;
	},
	"T'": function(board){
		var b = copy(board);
		b.tops = [b.tops[3], b.tops[0], b.tops[1], b.tops[2]];
		b.edges = [b.edges[3], b.edges[0], b.edges[1], b.edges[2]];
		return b;
	},
	'R': function(board){
		var b = copy(board);
		assert(b.hasRotated == "N");
		b.hiddenRight = [b.edges[0], b.tops[0]];
		b.edges[0] = b.keyBlock[1];
		b.tops[0] = b.keyBlock[0];
		b.keyBlock = ['x', 'x'];
		b.hasRotated = "Y";
		return b;
	},
	"R'": function(board){
		var b = copy(board);
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
		var b = copy(board);
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
		var b = copy(board);
		assert(b.hasRotated == "N");
		b.hiddenLeft = [b.edges[3], b.tops[3]];
		b.edges[3] = b.keyBlock[0];
		b.tops[3] = b.keyBlock[1];
		b.keyBlock = ['x', 'x'];
		b.hasRotated = "Y";
		return b;
	}
};

var encounteredHashes = {};

var checkAlreadyHasState = function(newHash){
	if(encounteredHashes.hasOwnProperty(newHash)){
		return true;
	}
	encounteredHashes[newHash] = true;
	return false;
}

var pushNewState = function(op, q, state, board){
	var newBoard = ops[op](board);
	var newHash;
	try{
		newHash = hash(newBoard);
	}catch(e){
		debugger;
	}
	
	if(checkAlreadyHasState(newHash)){
		//aleady been in this state, so don't explore it further
		return;
	}
	
	stateCount++;
	q.enqueue({
		board: newBoard,
        hash: newHash,
		op: op,
		prevState: state
	});
};

var report = function(state){
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
	d.innerHTML = ops.join(" ") + '<br>' + "state count: " + stateCount;
};

var run = function(){
	var board = {
				topCenter: "o",
				hasRotated: "N",
				centers : "bygw".split(""),
	 			tops: "ywbw".split(""),
				edges: "oboo".split(""),
				keyBlock: "go".split(""),
				hiddenRight: "xx".split(""),
				hiddenLeft: "xx".split("")
	};

	var endStateHash = calcEndState(board);
	var initHash = hash(board);
 
	encounteredHashes[initHash] = true;
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
			report(state);
			break;
		}
		
		board = state.board;
		pushNewState("T", q, state, board);
		pushNewState("T'", q, state, board);
		
		if(board.hasRotated == "N"){
			pushNewState("R", q, state, board);
			pushNewState("L'", q, state, board);
		}
		
		if(board.hasRotated == "Y"){
			pushNewState("R'", q, state, board);
			pushNewState("L", q, state, board);
		}
		// if(stateCount % 500 == 0){
		// 	console.log("q: " + q.getLength())
		// }
	}	
};
