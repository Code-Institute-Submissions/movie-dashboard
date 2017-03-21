/**
 * Created by chrishealy on 02/03/2017.
 */
queue()
    .defer(d3.json, "/movies/project1")
    .await(makeGraphs);


function makeGraphs(error, projectsJson) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("blocks").style.display = "inline-block";


    projectsJson.forEach(function (d) {
        d["total_gross"] = +d["gross"];
    });

    projectsJson.forEach(function (d) {
        d["profit"] = d["gross"] - d["budget"];
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(projectsJson);


    //Define Dimensions

    var dateDim = ndx.dimension(function (d) {
        return d["title_year"];
    });

    var genreDim = ndx.dimension(function (d) {
        return d["genres"];
    });
    //
    var grossDim = ndx.dimension(function (d) {
        return d["gross"];
    });
    // //

    var titleDim = ndx.dimension(function (d) {
        return d["movie_title"]
    });

    var imdbDim = ndx.dimension(function (d) {
        return d["imdb_score"]
    });


    //
    // // //
    // var totalMoviesDim = ndx.dimension(function (d) {
    //     return d["total_movies"];
    // });


//Calculate metrics
//     var genres = genreDim.group();
    var numProjectsByDate = dateDim.group();
    var numProjectsByGenre = genreDim.group();

    var totalGross = ndx.groupAll().reduceSum(function (d) {
        return d["gross"];
    });

    var totalMovies = ndx.groupAll().reduceSum(function (d) {
        return d["total_films"];
    });

    var totalBudget = ndx.groupAll().reduceSum(function (d) {
        return d["budget"];
    });

    var filmBudget = titleDim.group().reduceSum(function (d) {
        return d["budget"]
    });

    var filmGross = titleDim.group().reduceSum(function (d) {
        return d["gross"]
    });

    var filmProfit = dateDim.group().reduceSum(function (d) {
        return d["profit"]
    });

     var filmLeader = titleDim.group().reduceSum(function (d) {
        return d["profit"]
    });

    var imdbRating = titleDim.group().reduceSum(function (d) {
        return d["imdb_score"]
    });

    var imdbYear = dateDim.group().reduceSum(function (d) {
        return d["imdb_score"]
    });
//
    var bubbleList = titleDim.group().reduce(
        function (p, v) {
            p.fBudget += +v["budget"] / 1000000;
            p.imdbRating += +v["imdb_score"];
            p.fGross += +v["gross"] / 1000000;
            return p;
        },
        function (p, v) {
            p.fBudget -= +v["budget"] / 1000000;
            p.imdbRating -= +v["imdb_score"];
            p.fGross -= +v["gross"] / 1000000;
            return p;
        },
        function () {
            return {fBudget: 0, imdbRating: 0, fGross: 0}
        }
    );


    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["title_year"];
    var maxDate = dateDim.top(1)[0]["title_year"];

    //Charts
    var timelineChart = dc.lineChart("#time-line-chart");
    var timeChart = dc.barChart("#num-movies-per-year");
    var topMovieChartbyYear = dc.lineChart("#highest-rated-chart");
    var genreChart = dc.rowChart("#funding-by-genre-row-chart");
    var totalGrossND = dc.numberDisplay("#total-gross-nd");
    var totalBudgetND = dc.numberDisplay("#total-budgets-nd");
    var titleGrossChart = dc.rowChart("#funding-by-title-row-chart");
    var profitChart = dc.rowChart("#most-profitable-row-chart");
    var totalMoviesND = dc.numberDisplay("#total-movies-nd");
    var budgetChart = dc.pieChart("#most-expensive-pie-chart");
    var budgetIMDBChart = dc.bubbleChart("#bubble-chart");

    var numberFormat = d3.format(".0f");

    var dollarFormat = function(d) { return '$' + d3.format(',f')(d) };

    timelineChart
        .width(1000)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(filmProfit)
        .transitionDuration(500)
        // .x(d3.time.scale().domain([minDate, maxDate]))
        .x(d3.scale.linear().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        // .tickFormat(d3.format("s"))
        .yAxis().ticks(6);


    timeChart
        .ordinalColors(["#ffd847", "#f58277", "#6dc2e8", "#07b6ca", "#9178ea", "#ffbd49", "#3ce6ab", "#ffd847", "#f58277"])
        .width(1300)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        // .x(d3.time.scale().domain([minDate, maxDate]))
        .x(d3.scale.linear().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);

    topMovieChartbyYear
       .width(1000)
        .height(400)
        .margins({top: 30, right: 50, bottom: 50, left: 50})
        .dimension(dateDim)
        .group(imdbYear)
        .transitionDuration(1500)
        .x(d3.scale.linear().domain([minDate, maxDate]))
        .yAxisLabel("IMDB Score")
        .xAxisLabel("Movie Title")
        .elasticX(true)
        .elasticY(true)
        .xAxis().ticks(10);


    //      .ordering(function (d) {
    //     return -d.value;
    // })
    // topMovieChart.data(function (group) {
    //     return group.top(10);
    // });

    genreChart
        .ordinalColors(["#ffd847", "#f58277", "#6dc2e8", "#9178ea", "#07b6ca"])
        .width(600)
        .height(250)
        .dimension(genreDim)
        .group(numProjectsByGenre)
        .xAxis().ticks(10);
    genreChart.ordering(function (d) {
        return -d.value
    });
    genreChart.rowsCap([5]);
    genreChart.othersGrouper(false);


    budgetChart
        .ordinalColors(["#ffd847", "#f58277", "#6dc2e8", "#9178ea", "#07b6ca"])
        .height(250)
        .width(600)
        .radius(110)
        .innerRadius(30)
        .transitionDuration(1500)
        .dimension(titleDim)
        .group(filmBudget);
    budgetChart.ordering(function (d) {
        return -d.value
    });
    budgetChart.slicesCap([5]);
    budgetChart.othersGrouper(false);


    profitChart
        .ordinalColors(["#ffd847", "#f58277", "#6dc2e8", "#9178ea", "#07b6ca"])
        .width(600)
        .height(250)
        .dimension(titleDim)
        .group(filmLeader)
        .xAxis().ticks(10);
    profitChart.ordering(function (d) {
        return -d.value
    });
    profitChart.rowsCap([5]);
    profitChart.othersGrouper(false);


    titleGrossChart
        .ordinalColors(["#ffd847", "#f58277", "#6dc2e8", "#9178ea", "#07b6ca"])
        .width(600)
        .height(250)
        .dimension(titleDim)
        .group(filmGross)
        .yAxis2.tickFormat(dollarFormat)
        .xAxis().ticks(10);
    titleGrossChart.ordering(function (d) {
        return -d.value
    });
    titleGrossChart.rowsCap([5]);
    titleGrossChart.othersGrouper(false);


    totalGrossND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalGross);


    totalBudgetND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalBudget);
    //     .formatNumber(d3.format(".3s"));
    // //
    totalMoviesND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalMovies);
    //

    budgetIMDBChart
        .width(1650)
        .height(800)
        .margins({top: 20, right: 100, bottom: 30, left: 40})
        .transitionDuration(1500)
        .dimension(titleDim)
        .group(bubbleList)
        .colors(d3.scale.category20())
        .keyAccessor(function (p) {
            return p.value.imdbRating;
        })
        .valueAccessor(function (p) {
            return p.value.fBudget;
        })
        .radiusValueAccessor(function (p) {
            return p.value.fGross;
        })
        .x(d3.scale.linear().range([1, 10]))
        .r(d3.scale.linear().domain([0, 850]))
        .minRadiusWithLabel(34)
        .elasticY(true)
        .yAxisPadding(1)
        .elasticX(true)
        .xAxisPadding(2)
        .xAxisLabel("IMDB Rating")
        .yAxisLabel("Budget of Movie")
        .maxBubbleRelativeSize(.04)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(true)
        .renderTitle(true)
        .title(function (p) {
            return p.key
                + "\n"
                + "Gross : " + numberFormat(p.value.fGross) + "\n"
                + "Budget : " + numberFormat(p.value.fBudget) + "\n"
                + "IMDB Rating : " + numberFormat(p.value.imdbRating) + "\n"
        });
    budgetIMDBChart.yAxis().tickFormat(function (s) {
        return s;
    });
    budgetIMDBChart.xAxis().tickFormat(function (s) {
        return s;
    });

    dc.renderAll();
}