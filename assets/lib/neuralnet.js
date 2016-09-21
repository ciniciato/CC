/*
	Neural network - Multilayer perceptron - Backpropagation algorithm	
	
	Example:
	var dummyNN = new neuralNet({ 
							layers: [2,2,2],
							learning_rate: 0.5,
							hasBias: true
						});

	dummyNN.train(
				[{
					input: [.05, .1],
					output: [.01, .99]
				
				}],
				10,
				0.00001);
				
	Developed by: Diego Ciniciato
	github.com/ciniciato
*/
'use strict';
function neuralNet(args){ 	
	this.layers = args.layers || [2,2,2];//input, ... hidden layers ..., output
	this.learning_rate = args.learning_rate || 0.01;
	this.hasBias = args.hasBias || true;

	this.output = [];
	
	this.weight = new Array(this.layers.length-1)
	
	this.diferential_output = new Array(this.layers.length);
	this.quadratic_error = new Matrix(this.layers[this.layers.length-1], 1);
		
	for (var i = 0; i < this.layers.length; i++)
		this.output[i] = new Matrix(1, this.layers[i]);
	
	for (i = 0; i < this.layers.length-1; i++)
	{
		this.weight[i] = new Matrix(	(this.hasBias) ? this.layers[i]+1 : this.layers[i], 
										this.layers[i+1]);
		this.diferential_output[i]	 = new Matrix(	this.layers[i], 
												  	this.layers[i]);
	}
	
	this.initWeights();
}

neuralNet.prototype.initWeights = function(){//initialize random weights
	for (var i = 0; i < this.weight.length; i++)//layers
		for (var r = 0; r < this.weight[i].size[0]; r++)//nodes
			for (var c=0; c < this.weight[i].size[1]; c++)
				this.weight[i].data[r][c] = .1 + Math.random()*.9;
}

neuralNet.prototype.feedFwd = function(input){	
	this.output[0].data[0] = input; 
	if (this.hasBias) this.output[0].data[0].push(1);
		
	for (var i = 1; i < this.layers.length; i++)
	{
		this.output[i] = this.output[i-1].multiply(this.weight[i-1]);

		if (this.hasBias) this.output[i-1].data[0].pop();
		
		if (this.hasBias && i < this.layers.length-1) this.output[i].data[0].push(1);	
		
		for (var t = 0; t < this.layers[i]; t++)
		{
			this.output[i].data[0][t] = 1/(1+Math.exp(-this.output[i].data[0][t]));
			this.diferential_output[i-1].data[t][t] = this.output[i].data[0][t] * (1 - this.output[i].data[0][t]);
		}		
	}
	return this.output[i-1];
}

neuralNet.prototype.calcError = function(tgtOutput){
	var len = this.layers.length-1,
		sumEr = 0;
	
	for (var i = 0; i < this.layers[len]; i++)//loop all output nodes
	{
		this.quadratic_error.data[i][0] = this.output[len].data[0][i] - tgtOutput[i];
		sumEr += .5*Math.pow(this.quadratic_error.data[i][0], 2);
	}
	return sumEr;
}

neuralNet.prototype.backProp = function(){	
	var len = this.weight.length-1,
		delta = new Array(len-1),
		deltaW = null;
	
	delta[len] = this.diferential_output[len].multiply(this.quadratic_error);
	
	for (var i = len-1; i >= 0; i--)//delta calculation
		delta[i] = this.diferential_output[i].multiply(this.weight[i+1].duplicate(0,0,-1,0)).multiply(delta[i+1]);
	
	for (i = 0; i<=len; i++)//new weight atribution
	{
		deltaW = this.weight[i].duplicate(0,0,-1,0).transpose().minus(delta[i].multiply(this.learning_rate).multiply(this.output[i]));
		this.weight[i].copy(deltaW.transpose(), 0, 0);
	}	
}

neuralNet.prototype.train = function(trainSet, maxEpochs, minError){
	var epoch = 0, error = 10000;
	while (epoch < maxEpochs && error>minError)
	{
		for (var i = 0; i < trainSet.length; i++)
		{	
			this.feedFwd(trainSet[i].input); 
			error = this.calcError(trainSet[i].output);
			this.backProp();
		}		
		epoch++;
	}	
}

neuralNet.prototype.getWeights = function(){
	console.log(JSON.stringify(this.weight));
}