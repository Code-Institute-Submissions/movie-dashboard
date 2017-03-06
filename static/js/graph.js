/**
 * Created by chrishealy on 02/03/2017.
 */
queue()
    .defer(d3.json, "/movies/project1")
    .await(makeGraphs);



function makeGraphs(error, projectsJson) {
    document.getElementById("loading").style.display="none";
    document.getElementById("blocks").style.display="inline-block";

    projectsJson.forEach(function (d){d["total_gross"] = +d["gross"];
       });
    projectsJson.forEach(function (d){d["profit"] = d["gross"] -d["budget"];
    });
    // projectsJson.forEach(function (d){"total_budget"})


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
        return d["total_gross"];
    });
    // //
    var budgetTotalDim = ndx.dimension(function (d) {
        return d["budget"];
    });

    var titleDim = ndx.dimension(function (d) {
        return d["movie_title"]
    });

    var profitDim = ndx.dimension(function (d) {
        return d["profit"]
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
    var totalGrossByGenre = genreDim.group().reduceSum(function (d) {
        return d["total_gross_by_genre"];
    });

    var totalGross = ndx.groupAll().reduceSum(function (d) {
        return d["total_gross"];
    });


    var totalBudget = ndx.groupAll().reduceSum(function (d) {
        return d["total_budget"];
    });


    var filmGross = titleDim.group().reduceSum(function (d) {
        return d["gross"]
    });

    var filmProfit = titleDim.group().reduceSum(function (d) {
        return d["profit"]
    });


        // //
        // var totalMovies = ndx.groupAll().reduceSum(function (d) {
        //     return d["total_movies"];
        // });


        //Define values (to be used in charts)
        var minDate = dateDim.bottom(1)[0]["title_year"];
        var maxDate = dateDim.top(1)[0]["title_year"];

        //Charts
        var timelineChart = dc.lineChart("#time-line-chart")
        var timeChart = dc.barChart("#num-movies-per-year");
        var genreChart = dc.rowChart("#funding-by-genre-row-chart");
        var totalGrossND = dc.numberDisplay("#total-gross-nd");
        var totalBudgetND = dc.numberDisplay("#total-budgets-nd");
        var titleGrossChart = dc.rowChart("#funding-by-title-row-chart");
        var profitChart = dc.rowChart("#most-profitable-row-chart");
        // var totalMoviesND = dc.numberDisplay("#total-movies-nd");


    timelineChart
            .width(1000)
            .height(200)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(dateDim)
            .group(filmGross,filmProfit)
            .transitionDuration(500)
            // .x(d3.time.scale().domain([minDate, maxDate]))
            .x(d3.scale.linear().domain([minDate, maxDate]))
            .elasticY(true)
            .xAxisLabel("Year")
            .yAxis().ticks(4);


        timeChart
             .ordinalColors([ "#ffd847" , "#f58277" , "#6dc2e8","#07b6ca","#9178ea","#ffbd49", "#3ce6ab","#ffd847","#f58277"])
            .width(1000)
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


        genreChart
            .ordinalColors([ "#ffd847" , "#f58277" , "#6dc2e8","#9178ea", "#07b6ca"])
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



     profitChart
          .ordinalColors([ "#ffd847" , "#f58277" , "#6dc2e8","#9178ea", "#07b6ca"])
      .width(600)
         .height(250)
       .dimension(titleDim)
       .group(filmProfit)
       .xAxis().ticks(10);
       profitChart.ordering(function (d) { return -d.value});
       profitChart.rowsCap([5]);
        profitChart.othersGrouper(false);




        titleGrossChart
            .ordinalColors([ "#ffd847" , "#f58277" , "#6dc2e8","#9178ea", "#07b6ca"])
            .width(600)
            .height(250)
            .dimension(titleDim)
            .group(filmGross)
            .xAxis().ticks(10);
            titleGrossChart.ordering(function (d) { return -d.value});
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
        // totalMoviesND
        //     .formatNumber(d3.format("d"))
        //     .valueAccessor(function (d) {
        //         return d;
        //     })
        //     .group(totalMovies);
        //

        dc.renderAll();
    }