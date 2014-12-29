:- module(family,[
	male/1,
	female/1,
	parent/2,
	mother/2,
	father/2,
	ancestor/2
	]).
		male(max).
		male(luca).
		male(hans).
		female(lisa).
		female(tea).
		female(madita).
		female(doris).
		
		parent(max,luca).
		parent(max,tea).
		parent(lisa,luca).
		parent(lisa,tea).			
		parent(madita,lisa).
		parent(hans,lisa).
		parent(doris,hans).
		
		
		mother(P,C):-
			female(P), parent(P,C).
			
		father(P,C):-
			male(P), parent(P,C).
				
		child(C,P):-
			parent(P,C).
			
		ancestor(A,C):-
			parent(A,C).
		ancestor(A,C):-
			parent(A,X),ancestor(X,C).
			
			
			% father(max,luca). 
			% father(hans,luca).
			% mother(lisa,X).
			% ancestor(X,tea).
			
			
			% ancestor(doris,X).
		
		