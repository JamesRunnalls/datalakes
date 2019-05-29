function getdata(one,two){
	$.ajax({
		 url: 'php/dataimport.php', //This is the current doc
		 type: "POST",
		 beforeSend: function() {$('body').removeClass('loaded');},
		 dataType:'json', // add json datatype to get json
		 data: ({id1: one,id2: two}),
		 success: function(data){
			 plotdata(data);
		 },
		error: function(xhr, status, error) {
			console.log(xhr.responseText);
			console.log(error);
		}
	}); 
}

function plotdata(data_out){
	data = data_out;
	var out = plottimeseries(-25,data)
	//d = horizontalslider(out,data);
	plotverticaldata(parseFloat(out[0]));
	$('body').addClass('loaded');
}

function verticalslider(){
	var handle = $( "#custom-handle" );
	$( "#slider" ).slider({
      create: function() {
        handle.text( $( this ).slider( "value" ) + "m");
      },
      orientation: "vertical",
      range: "min",
      min: -50,
      max: 0,
      value: -25,
      step: 0.1,
      slide: function( event, ui ) {
        handle.text( ui.value + "m" );
        plottimeseries(ui.value,data);
      }
    });
    handle.text( "-25m" );
}

function horizontalslider(out,data){
	var max = Math.floor((out[1] - out[0]) / 10800) * 10800;
	var handle = $( "#custom-handle2" );
	$( "#slider2" ).slider({
      create: function() {
        handle.text( $( this ).slider( "value" ));
      },
      orientation: "horizontal",
      range: "min",
      min: 0,
      max: max,
      step: 10800,
      slide: function( event, ui ) {
        plotverticaldata(ui.value+parseFloat(out[0]),data);
      }
    });
    handle.text( "Adjust Date" );
	return parseFloat(out[0]);
}

function plottimeseries(d,data){
	// Convert d to index
	d_in = parseInt(Math.abs(d * 10) + 1);
	
	h1 = data[0][0];
	h2 = data[1][0];
	
	ds1 = data[0][d_in];
	ds2 = data[1][d_in];
		
	var arr = []
	for (i = 0; i < h1.length; i++) {
		arr.push([h1[i],parseFloat(ds1[i]),null]);
	}
	for (i = 0; i < h2.length; i++) {
		arr.push([h2[i],null,parseFloat(ds2[i])]);
	}
	
	arr.sort(function(a,b) {
		return a[0]-b[0]
	});
	
	var min = arr[0][0];
	var max = arr[arr.length-1][0];
		
	var ar = []
	for (i = 1; i < arr.length; i++) {
		if (arr[i][0] - arr[i-1][0] > 86400){
			ar.push([arr[i-1][0]+43200,"NA","NA"])
		}
		ar.push(arr[i]);
	}
	
	arr = ar;
	
	for (i = 0; i < arr.length; i++) {
		arr[i][0] = new Date(arr[i][0]*1000);
	}
	
	gs[1].updateOptions({ 
        'file': arr,
    });
		
	return [min,max];
}

function plotverticaldata(t){
	
	var h1 = data[0][0];
	var h2 = data[1][0];
	var h1_d = [];
	var h2_d = [];
	
	for (i = 0; i < h1.length; i++) {
		h1_d[i] = [h1[i] - t,i];
	}
	
	h1_d.sort(function(a,b) {
		return Math.abs(a[0])-Math.abs(b[0]);
	});
	
	var d1 = h1_d[0][1];
		
	var dd1 = new Date((h1_d[0][0]+t)*1000);
	document.getElementById("date1").innerHTML = dd1.toLocaleString();
	
	for (i = 0; i < h2.length; i++) {
		h2_d[i] = [h2[i] - t,i];
	}
	
	h2_d.sort(function(a,b) {
		return Math.abs(a[0])-Math.abs(b[0]);
	});

	var d2 = h2_d[0][1];
	
	var dd2 = new Date((h2_d[0][0]+t)*1000);
	document.getElementById("date2").innerHTML = dd2.toLocaleString();
	
	var arr = [];
	for (i = 1; i < data[0].length; i++){
		var x = -(i - 1)/10;
		var y1 = parseFloat(data[0][i][d1]);
		var y2 = parseFloat(data[1][i][d2]);
		arr.push([x,y1,y2]);
	}
	
	if (h2_d[0][0] > 43200 || h1_d[0][0] > 43200){
		arr = [[0,0,0]];
		document.getElementById("y1_0").innerHTML = "0";
		document.getElementById("y1_1").innerHTML = "0";
		document.getElementById("y1_2").innerHTML = "0";
		document.getElementById("y2_0").innerHTML = "0";
		document.getElementById("y2_1").innerHTML = "0";
		document.getElementById("y2_2").innerHTML = "0";
	} else {
		// Update axis
		var y1_0 = 100000000000000;
		var y1_2 = -10000000000000;
		var y2_0 = 100000000000000;
		var y2_2 = -10000000000000;

		for (i = 1; i < arr.length; i++){

			if (arr[i][1] < y1_0){
				y1_0 = arr[i][1];
			}
			if (arr[i][1] > y1_2){
				y1_2 = arr[i][1];
			}
			if (arr[i][2] < y2_0){
				y2_0 = arr[i][2];
			}
			if (arr[i][2] > y2_2){
				y2_2 = arr[i][2];
			}
		}
		var y1_1 = (y1_0+y1_2)/2;
		var y2_1 = (y2_0+y2_2)/2;

		document.getElementById("y1_0").innerHTML = round(y1_0,2);
		document.getElementById("y1_1").innerHTML = round(y1_1,2);
		document.getElementById("y1_2").innerHTML = round(y1_2,2);
		document.getElementById("y2_0").innerHTML = round(y2_0,2);
		document.getElementById("y2_1").innerHTML = round(y2_1,2);
		document.getElementById("y2_2").innerHTML = round(y2_2,2);
	}
	
	gs[0].updateOptions({ 
        'file': arr,
    });
		
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getplotdata(){
	var d1 = $( "#dataset1 option:selected" ).val();
	var d2 = $( "#dataset2 option:selected" ).val();
	document.getElementById("y1").innerHTML = $( "#dataset1 option:selected" ).text();
	document.getElementById("y2").innerHTML = $( "#dataset2 option:selected" ).text();
	document.getElementById("hy1").innerHTML = $( "#dataset1 option:selected" ).text();
	document.getElementById("hy2").innerHTML = $( "#dataset2 option:selected" ).text();
	document.getElementById("ax1").innerHTML = $( "#dataset1 option:selected" ).text();
	document.getElementById("ax2").innerHTML = $( "#dataset2 option:selected" ).text();
	var ds1 = "../data/" + d1 + ".csv";
	var ds2 = "../data/" + d2 + ".csv";
	getdata(ds1,ds2);
}

function legendFormatter(data) {
    if (data.x == null) {
        document.getElementById("depth").innerHTML = '0.000';
        document.getElementById("l1").innerHTML = '0.000';
        document.getElementById("l2").innerHTML = '0.000';
    } else {
		document.getElementById("depth").innerHTML = parseFloat(data['x']).toFixed(4);
        document.getElementById("l1").innerHTML = parseFloat(data['series'][0]['y']).toFixed(4);
		document.getElementById("l2").innerHTML = parseFloat(data['series'][1]['y']).toFixed(4);
    }
    return "";
}

function legendFormatter2(data) {
	if (data.x == null) {
        document.getElementById("date").innerHTML = '';
		document.getElementById("h1").innerHTML = '';
		document.getElementById("h2").innerHTML = '';
    } else {
		var d = new Date(data.x);
		document.getElementById("date_hidden").innerHTML = data.x;
		document.getElementById("date").innerHTML = d.toLocaleString();
		if (data.series != null){
			try {
				if (parseFloat(data['series'][0]['y']).toFixed(4) != "NaN"){
					document.getElementById("h1").innerHTML = parseFloat(data['series'][0]['y']).toFixed(4);
				} else {
					document.getElementById("h1").innerHTML = '';
				}
			} catch(err) {}
			try {
				if (parseFloat(data['series'][1]['y']).toFixed(4) != "NaN"){
					document.getElementById("h2").innerHTML = parseFloat(data['series'][1]['y']).toFixed(4);
				} else {
					document.getElementById("h2").innerHTML = "";
				}
			} catch(err) {}
		}
    }
    return "";
}

// Main Function

var gs = [];
var data = [];
$(document).ready(function(){
	$("#dataset1").change(getplotdata);
	$("#dataset2").change(getplotdata);
	
	document.getElementById("horizontal").addEventListener("click", function(){
		var d = parseFloat(document.getElementById("date_hidden").innerHTML);
		plotverticaldata(d/1000);
	});
	
	gs.push(
        new Dygraph(
            document.getElementById("vertical"),
            [],
            {   colors: ["red","black"],            
                labels: [ "x", "y1", "y2"],
                series: {
                    'y2': {
                        axis: 'y2'
                    }
                },
			 	legend: 'always',
                legendFormatter: legendFormatter,
			    connectSeparatedPoints: true,
			    interactionModel: {},
                axes: {
                    y2: {
                        drawAxis: false
                    },
                    y: {
                        drawGrid: false,
						drawAxis: false
                    },
                    x: {
                        drawGrid: false,
						drawAxis: false
                    }
                }
            }
        )
    )
	
	
	
    gs.push(
        new Dygraph(
            document.getElementById("horizontal"),
            [],
            {   colors: ["red","black"],            
                labels: [ "x", "y1", "y2"],
                series: {
                    'y2': {
                        axis: 'y2'
                    }
                },
			 	legend: 'always',
                legendFormatter: legendFormatter2,
			    connectSeparatedPoints: true,
                axes: {
                    y2: {
                        drawAxis: false
                    },
                    y: {
                        drawGrid: false
                    },
                    x: {
                        drawGrid: false
                    }
                }
            }
        )
    )
	
	verticalslider();
	getplotdata();
});


