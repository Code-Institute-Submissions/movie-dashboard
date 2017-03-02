/**
 * Created by chrishealy on 02/03/2017.
 */
queue()
    .defer(d3.json, "/movies/project1")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {




  //Create a Crossfilter instance
var ndx = crossfilter(movieProjects);


 //Define Dimensions

var dateDim = ndx.dimension(function (d) {
    return d["release_year"];
});

var movieBudgetDim = ndx.dimension(function (d) {
    return d["movie_budget"];
});

var genreDim = ndx.dimension(function (d) {
    return d["gross_genre"];
});

var grossTotalDim = ndx.dimension(function (d) {
    return d["total_gross"]
    });

var budgetTotalDim = ndx.dimension(function (d) {
    return d["total_budget"];
});


//Calculate metrics
var numProjectsByDate = dateDim.group();
var numProjectsByGenre = genreDim.group();
var totalGross = grossTotalDim.group().reduceSum(function (d) {
    return d["total_gross"];
      });
var totalBudget = budgetTotalDim.group().reduceSum(function (d) {
    return d["total_budget"];
      });

    var all = ndx.groupAll();
   var totalMovies = ndx.groupAll().reduceSum(function (d) {
       return d["total_movies"];
   });



        //Define values (to be used in charts)
      var minDate = dateDim.bottom(1)[0]["title_year"];
      var maxDate = dateDim.top(1)[0]["title_year"];

        //Charts
        var timeChart = dc.barChart("#chart-stage");
        var grossChart = dc.piechart("#funding-by-genre");
        var totalGrossND = dc.numberDisplay("#total-gross-nd");
        var totalBudgetND = dc.numberDisplay("#total-budgets-nd");
        var totalMoviesND = dc.numberDisplay("#total-movies-nd")


     timeChart
       .width(1000)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(dateDim)
       .group(numProjectsByDate)
       .transitionDuration(500)
       .x(d3.time.scale().domain([minDate, maxDate]))
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxis().ticks(4);


 grossChart
       .height(250)
       .width(600)
       .radius(90)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(totalGross)
       .group(numProjectsByGenre);


 totalGrossND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalGross)
       .formatNumber(d3.format(".3s"));


  totalBudgetND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalBudget)
       .formatNumber(d3.format(".3s"));

    totalMoviesND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalMovies)
       .formatNumber(d3.format(".3s"));

    }

dc.renderAll();