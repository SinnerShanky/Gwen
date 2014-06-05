var obj = {},
		happening = 0;

function populateDistrict(district) {
    var dist_ele = document.createElement("option");
    dist_ele.value = district;
    dist_ele.text = district;
    document.getElementById("dd_district").add(dist_ele);
}


function populateBlock() {
    var district = document.getElementById('dd_district').value;
    document.getElementById("dd_block").innerHTML = "";
    for (var block in obj[district]) {
        var blk_ele = document.createElement("option");
        blk_ele.value = block;
        blk_ele.text = block;
        document.getElementById("dd_block").add(blk_ele);
    }
}

function upload(path) {
    d3.csv(path, function (data) {
        data.forEach(function (v) {
            var group = v.DISTRICT,
                block = v.BLOCK,
                villageObj = {};
            if (!obj.hasOwnProperty(group)) {
                obj[group] = {};
                populateDistrict(group);
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
//DATA READY

function makeGraph(district, block, from, to) {
    var numVillages = 0;
    var parsingData = obj[district][block];
    var parsingObj = [];
    parsingData.forEach(function (v) {
        var group = v.VILLAGE,
            villageObj = {};
        if (!parsingObj.hasOwnProperty(group)) {
            parsingObj[group] = [];
            parsingObj[group].PRE = [];
            parsingObj[group].POST = [];
            numVillages += 1;
        }
        villageObj = v;
        for (var i = from; i <= to; i++) {
            var preval = "JUNE_" + i,
                postval = "OCT_" + i;
            parsingObj[group].PRE[i - from] = v[preval];
            parsingObj[group].POST[i - from] = v[postval];
        }
    });

    var cnvWidth = document.innerWidth;
    var cnvHeight = document.innerHeight;

    //GRAPH GENERATION

    var heightScale = 10;
    var widthScale = (500 / numVillages) * 1.5; //General width of the graph is controlled by this.
    var offset = 40; //Distance from left, where graph starts.

    //AXIS PREPARATION

    var axisScale = d3.scale.linear()
        .domain([130, 0])
        .range([300, 0]);

    var Yaxis = d3.svg.axis()
        .scale(axisScale)
        .orient("right");

    //MAKE CANVAS AND ADD AXIS

    d3.selectAll("svg").remove();

    var canvas = d3.select("body")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500)
        .attr("transform", "translate(0,5)")
        .call(Yaxis)
        .append("g");

    //GENERATE DATA

    var i = 0,
        data = [];

    for (var village in parsingObj)
    if (village !== "") data.push(parsingObj[village].PRE[i]);

    //DRAW LINE GRAPH	

    canvas.select('lineg').remove();

    var graph = canvas.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d, i) {
        return (widthScale * i / 2 + offset);
    })
        .attr("y1", function (d, i) {
        return heightScale * (data[i]);
    })
        .attr("x2", function (d, i) {
        return (widthScale * (i + 1) / 2 + offset);
    })
        .attr("y2", function (d, i) {
        if( data[i+1] !== NaN && data[i+1] !== undefined )
            return heightScale * (data[i + 1]);
        else
            return 0;
    })
        .attr("stroke", "#90c6ee")
        .attr("stroke-width", 3)
        .attr("id", "lineg");

    //DISPLAY DISTRICT,BLOCK

    document.getElementById("l_district").innerHTML = ('DISTRICT: ' + document.getElementById("dd_district").value.toUpperCase());
    document.getElementById("l_block").innerHTML = ('BLOCK: ' + document.getElementById("dd_block").value.toUpperCase());
    document.getElementById("text_year").innerHTML = ('YEAR: ' + from);

    //ANIMATION FUNCTION

    var total = to - from + 1;
    var animFunc = function () {
        i = (i + 1) % total;
        var temp = 0;

        document.getElementById("text_year").innerHTML = ('YEAR: ' + (from + i));

        for (var village in parsingObj) {
            if (village !== "") {
                if( parsingObj[village].PRE[i] !== NaN && parsingObj[village].PRE[i] !== undefined )
                    data[temp++] = parsingObj[village].PRE[i];
                else
                    data[temp++] = 0;
            }
        }

        graph.transition()
            .attr("y1", function (d, i) {
            return heightScale * (data[i]);
        })
            .attr("y2", function (d, i) {
                if( data[i+1] !== NaN && data[i+1] !== undefined )
                    return heightScale * (data[i + 1]);
                else
                    return 0;
        })
            .attr("stroke", "#90c6ee")
            .attr("stroke-width", 3);

        dataPoints.transition()
            .attr("cy", function (d, i) {
            return heightScale * (data[i]);
        });

        vert_guides.transition()
            .attr("y2", function (d, i) {
            return heightScale * (data[i]);
        });
    };
    var heightScaleFunction = function (i) {
        return (30 / 13 * i * heightScale);
    };

    //GENERATE GUIDES

    for (i = 0; i < 13; i++)
    canvas.append("line")
        .attr("x1", 30)
        .attr("y1", heightScaleFunction(i))
        .attr("x2", 1000)
        .attr("y2", heightScaleFunction(i))
        .attr("stroke", "#d1d1d1")
        .attr("stroke-width", 1);

    var vert_guides = canvas.selectAll("vert_guides")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d, i) {
        return (widthScale * i / 2 + offset);
    })
        .attr("y1", 300)
        .attr("x2", function (d, i) {
        return (widthScale * i / 2 + offset);
    })
        .attr("y2", function (d, i) {
        return heightScale * (data[i]);
    })
        .attr("stroke", "#e1e1e1")
        .attr("stroke-width", 1)
        .attr("id", "vert_guides");

    //GENERATE DATA POINT INDICATORS	

    var dataPoints = canvas.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
        return (widthScale * i / 2 + offset);
    })
        .attr("cy", function (d, i) {
        return heightScale * (data[i]);
    })
        .attr("r", 5)
        .attr("fill", "#ff0000");
    happening = setInterval(animFunc, 1000);
}

function callAnimation(temp) {
    if (temp === false) clearInterval(happening);
}
populateDistrict();