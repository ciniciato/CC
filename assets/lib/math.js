const PI_TO_DEGREE=180/Math.PI;

function Matrix(row, column){
	var column = column || 1; 
	
	this.data = new Array(row);
	this.size = [row, column]
	
	for (var r = 0; r < row; r++)
	{
		this.data[r] = new Array(column);
		for (var c = 0; c < column; c++)
			this.data[r][c] = 0;
	} 	
	
	return this;
}

Matrix.prototype.show = function(){
	var rows = this.data.length, columns = this.data[0].length, rowString = '[';
	for (var r = 0; r < rows; r++)
	{
		for (var c = 0; c < columns; c++)
			rowString += (c < columns-1) ? this.data[r][c]+',' : this.data[r][c];
		if (r < rows-1) rowString += ';';
	}
	rowString += ']';
	console.log(rowString);
	return this;	
}

Matrix.prototype.multiply = function(tgtMatrix){
	if (tgtMatrix instanceof Matrix)
	{		
		var rows = this.data.length, columns = this.data[0].length,
			rowsTgt = tgtMatrix.data.length, columnsTgt = tgtMatrix.data[0].length;
			
		if (rows == columnsTgt || columns == rowsTgt)
		{
			var result =  new Matrix(rows, columnsTgt);
			for (var r = 0; r < rows; r++)
				for (var c = 0; c < columnsTgt; c++)
				{
					result.data[r][c] = 0;
					for (var ct = 0; ct < rowsTgt; ct++)
						result.data[r][c] += this.data[r][ct] * tgtMatrix.data[ct][c];
				}
			return result;
		}
		else
		{
			console.log('Cant multiply!');
			return false;
		}
	} 
	else
	{
		var rows = this.data.length, columns = this.data[0].length,
			result =  new Matrix(rows, columns);
		for (var r = 0; r < result.size[0]; r++)
			for (var c = 0; c < result.size[1]; c++)
				result.data[r][c]=this.data[r][c] * tgtMatrix;
		return result;		
	}
}

Matrix.prototype.transpose = function(){
	var rows = this.data.length, columns = this.data[0].length,
		result =  new Matrix(columns, rows);
	for (var r = 0; r < rows; r++)
		for (var c = 0; c < columns; c++)
			result.data[c][r] = this.data[r][c];
	return result;
}

Matrix.prototype.duplicate = function(iR, iC, fR, fC){
	var rows = this.data.length, columns = this.data[0].length,
		fR = (fR < 0) ? rows+fR : rows,
		fC = (fC < 0) ? columns+fC : columns;	
	
	var result =  new Matrix(fR - iR, fC - iC);
	for (var r = iR; r < fR; r++)
		for (var c = iC; c < fC; c++)
			result.data[r][c] = this.data[r][c];
	return result;
}

Matrix.prototype.copy = function(tgtMatrix, iR, iC){
	var rows = tgtMatrix.data.length, columns = tgtMatrix.data[0].length;
	
	for (var r = iR; r < rows+iR; r++)
		for (var c = iC; c < columns+iC; c++)
			this.data[r][c] = tgtMatrix.data[r][c];
	return this;
}

Matrix.prototype.minus = function(tgtMatrix){
	var rows = this.data.length, columns = this.data[0].length,
		rowsTgt = tgtMatrix.data.length, columnsTgt = tgtMatrix.data[0].length;
	if (rows == rowsTgt && columns == columnsTgt)
	{		
		var result =  new Matrix(rows, columns);
		for (var r = 0; r < rows; r++)
			for (var c = 0; c < columns; c++)
				result.data[r][c]=this.data[r][c]-tgtMatrix.data[r][c];
		return result;
	}
	else
	{
		console.log('Cant subtraction!'+this.size[0]+'x'+tgtMatrix.size[1]);
		return false;
	}
}