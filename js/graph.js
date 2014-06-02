var obj = {};
		
function upload(path) {
    d3.csv(path, function (data) {
        data.forEach(function (v) {
            var group = v.DISTRICT,
                block = v.BLOCK,
                villageObj = {};
            if (!obj.hasOwnProperty(group)) {
                obj[group] = {};
            }
            if (!obj[group].hasOwnProperty(block)) {
                obj[group][block] = [];
            }
            villageObj = v;
            delete(villageObj.DISTRICT);
            delete(villageObj.BLOCK);
            obj[group][block].push(villageObj);
        });
    });
}

upload('../data/water.csv');

function makeGraph(district, block, from, to) {

    var cnvWidth = document.innerWidth;
    var cnvHeight = document.innerHeight;

    var data = obj[district][block];
    var parsingObj = [];
    data.forEach(function (v) {
        var group = v.VILLAGE,
            villageObj = {};
        if (!parsingObj.hasOwnProperty(group)) {
            parsingObj[group] = [];
            parsingObj[group].PRE = [];
            parsingObj[group].POST = [];
        }
        villageObj = v;
        for (var i = from; i <= to; i++) {
            var preval = "JUNE_" + i,
                postval = "OCT_" + i;
            parsingObj[group].PRE[i - from] = v[preval];
            parsingObj[group].POST[i - from] = v[postval];
        }
    });

//PARSE DATA AS:  for(a in parsingObj) {console.log(parsingObj[a].PRE[0])}

	var numberVillages=0;

//DATA READY. GRAPH GENERATION

  var heightScale = 10;
	var widthScale = 40;	//General width of the graph is controlled by this.
	var offset = 40;	//Distance from left, where graph starts.

//AXIS PREPARATION
	
	var axisScale = d3.scale.linear()
					.domain([130,0])
					.range([300, 0]);
	
	var Yaxis = d3.svg.axis()
				.scale(axisScale)
				.orient("right");

//MAKE CANVAS AND ADD AXIS
				
    var canvas = d3.select("body")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500)
				.attr("transform","translate(0,5)")
				.call(Yaxis)
				.append("g");
	
//GENERATE DATA
	
	var i=0,
	data = [];
	
	for (village in parsingObj)
		if (village!=="")
			data.push(parsingObj[village].PRE[i]);

//DRAW LINE GRAPH	

	var graph = canvas.selectAll("line")
				.data(data)
				.enter()
					.append("line")
					.attr("x1",function(d,i)	{	return (widthScale * i/2 + offset);	})
					.attr("y1",function(d,i)	{	return heightScale*(data[i]);	})
					.attr("x2",function(d,i)	{	return (widthScale * (i+1)/2 + offset);	})
					.attr("y2",function(d,i)	{	return heightScale*(data[i+1]);	})
					.attr("stroke","#90c6ee")
					.attr("stroke-width",3);
	
	var total=to-from+1;
	var animFunc=function()
		{
			i=(i+1)%total;
			var temp=0;
			for (village in parsingObj)
			{
				if (village!=="")
				{
					data[temp++]=parsingObj[village].PRE[i];
					canvas.select("text")
						.remove();
					canvas.append("text")
						.text(function()	{	return from+i;	})
						.attr("transform","translate(300,350)");
				}
			}
				
			graph.transition()
				.attr("y1",function(d,i)	{	return heightScale*(data[i]);	})
				.attr("y2",function(d,i)	{	return heightScale*(data[i+1]);	})
				.attr("stroke","#90c6ee")
				.attr("stroke-width",1);
				
			dataPoints.transition()
				.attr("cy",function(d,i)	{	return heightScale*(data[i]);	})
				.attr("fill",function(d)	{	return colorScale(data[i]);	});
		}
		
//GENERATE GUIDES

	var guides = canvas;

	for(i=0;i<13;i++)
		canvas.append("line")
			.attr("x1",30)
			.attr("y1",function()	{	return 30/13*i*heightScale;	})
			.attr("x2",1000)
			.attr("y2",function()	{	return 30/13*i*heightScale;	})
			.attr("stroke","#d1d1d1")
			.attr("stroke-width",1);
	
//GENERATE DATA POINT INDICATORS	

	var colorScale = d3.scale.linear()
										.domain([0,130])
										.range(["#0000ff","#ff0000"]);

	var dataPoints = canvas.selectAll("circle")
										.data(data)
										.enter()
											.append("circle")
											.attr("cx",function(d,i)	{	return (widthScale * i/2 + offset);	})
											.attr("cy",function(d,i)	{	return heightScale*(data[i]);	})
											.attr("r",3)
											.attr("fill",function(d)	{	return colorScale(data[i]);	});
	
	
	setInterval(animFunc,1000);
}