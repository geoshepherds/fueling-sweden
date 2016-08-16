var introQuiz = document.getElementById('introQuiz'),
    homeTitle = document.getElementById('homeTitle'),
    question = document.getElementById('question'),
    skip = document.getElementsByClassName('skip'),
    mapView = document.getElementById('mapView'),
    currentQuestionIndex = 0,
    infoBtn = document.getElementById('info'),
    infoTooltip = document.getElementById('infoTooltip');



//Quiz questions
var questions = [
    {
        question: 'How many passenger cars were registered in Sweden at the end of 2015?',
        answer1: '2.7 million',
        answer2: '4.7 million',
        answer3: '6.7 million',
        correctAnswer: 1
    },
    {
        question: 'Of these cars, which is the most common type of fuel used in Sweden?',
        answer1: 'Petrol',
        answer2: 'Electric Hybrid',
        answer3: 'Diesel',
        correctAnswer: 0
    },
    {
        question: 'What percentage of all passenger cars in Sweden run solely on electricity?',
        answer1: '0,1%',
        answer2: '7,2%',
        answer3: '11,3%',
        correctAnswer: 0
    }
];

//Run introContent through quiz.
setTimeout(function() {
    nextView(homeTitle, question);
    generateQuiz(currentQuestionIndex);
}, 2000);

//Change to next view
function nextView(oldViewId, newViewId) {
    //Run introMapView if newViewId == mapView else show next question
    if (newViewId == mapView) {
        introQuiz.classList.remove('active');
        mapView.classList.add('active');
    } else {
        oldViewId.classList.remove('active');
        newViewId.classList.add('active');
    }
}


function showAnswer(boolean, questionIndex, userAnswerIndex, correctAnswerIndex) {
    var arr = [0,1,2];
    var correct = document.getElementById('aIndex' + correctAnswerIndex);

    if (boolean) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === correctAnswerIndex) {
                correct.classList.add('correct');
            } else {
                document.getElementById('aIndex' + arr[i]).classList.add('notGuessed');
            }
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === correctAnswerIndex) {
                correct.classList.add('correct');
            } else if (arr[i] === userAnswerIndex) {
                document.getElementById('aIndex' + arr[i]).classList.add('incorrect');
            } else {
                document.getElementById('aIndex' + arr[i]).classList.add('notGuessed');
            }
        }
    }

    //Finish quiz after the last question
    setTimeout(function() {
        if (questionIndex < questions.length - 1) {
            currentQuestionIndex += 1;
            generateQuiz(currentQuestionIndex);
        } else {
            nextView(question, mapView);
        }
    }, 1500);
}


function checkAnswer(answerIndex, questionIndex) {
    return function() {
        var userAnswer = answerIndex,
            correctAnswer = questions[questionIndex].correctAnswer;

        if (userAnswer === correctAnswer) {
            showAnswer(true, questionIndex, answerIndex, correctAnswer);
        } else {
            showAnswer(false, questionIndex, answerIndex, correctAnswer);
        }
    };
}

//Generate/Switch to next question
function generateQuiz(questionIndex) {

    var quizBody =  '<h3 class="italic">';
        quizBody += questions[questionIndex].question + '</h3>';
        quizBody += '<h2 class="answer" id="aIndex0">';
        quizBody += questions[questionIndex].answer1 + '</h2>';
        quizBody += '<h2 class="answer" id="aIndex1">';
        quizBody += questions[questionIndex].answer2 + '</h2>';
        quizBody += '<h2 class="answer" id="aIndex2">';
        quizBody += questions[questionIndex].answer3 + '</h2>';
        quizBody += '<h4 class="skip upper"> skip</h4>';

    question.innerHTML = quizBody;

    //Show correct answer when user clicks an answer
    var answer = document.getElementsByClassName('answer');
    var skip = document.getElementsByClassName('skip');
    for (var i = 0; i < answer.length; i++) {
        answer[i].addEventListener('click', checkAnswer(i, questionIndex));
    }
    //Skip to map if user clicks skip
    skip[0].addEventListener('click', function() {
        nextView(question, mapView)
    });

}

//Run mapView
//Show infoTooltip when user clicks #info
infoBtn.addEventListener('click', function() {
   if(infoTooltip.classList.length === 0) {
       infoTooltip.classList.add('active');
       infoBtn.innerHTML = 'close';
   } else {
       infoTooltip.classList.remove('active');
       infoBtn.innerHTML = 'info';
   }
});

//Close introMapView, generate min max from data, compute legend, and render map when user clicks goToMap
document.getElementById('goToMap').addEventListener('click', function() {
    document.getElementById('mapIntroView').classList.remove('active');
    document.getElementsByTagName('body')[0].classList.add('noQuiz');
    generateMinMax('PETROL');
    renderMap();
});


//DATA PROCESSING
var maxValue,
    minValue,
    currentLayer,
    legend = document.getElementById('legend'),
    activeFuel = document.getElementById('activeFuel'),
    fuelTypeChange = document.getElementById('fuelTypeChange'),
    fuelType = document.getElementsByClassName('fuelType');

function formatPercent(value) {
  var percentValue = value.toFixed(1) + '%';
  return percentValue.toString();
}

//Generate min and max of data layer
function generateMinMax(dataLayer) {
    if (dataLayer == 'ELECTRIC HYBRID') {
      currentLayer = 'ELECTRICHYBRID';
      dataLayer = 'ELECTRICHYBRID';
    } else if (dataLayer == 'CHARGING HYBRID') {
      currentLayer = 'CHARGINGHYBRID';
      dataLayer = 'CHARGINGHYBRID';
    } else {
      currentLayer = dataLayer;
    }
    var dataArr = [];
    for (var i = 0; i < fuelData.features.length; i++) {
        var layerData = fuelData.features[i].properties[dataLayer];
        dataArr.push(layerData);
    }
    maxValue = Math.max.apply(Math, dataArr);
    minValue = Math.min.apply(Math, dataArr);
}

function updateLegend() {
  document.getElementById('minValue').innerText = formatPercent(minValue);
  document.getElementById('maxValue').innerText = formatPercent(maxValue);
}

function updateActiveFuel(newFuelType) {
  activeFuel.innerText = newFuelType;
}

function getLegendPosition(value) {
  var onePercentValue = 100 / (maxValue - minValue);
  return Math.round((value - minValue) * onePercentValue);
}

function changeFuelType() {
  if (fuelTypeChange.classList.length === 0) {
    fuelTypeChange.classList.add('active');

    //bind event handler to fuelType options
    for (var i = 0; i < fuelType.length; i++) {
      fuelType[i].addEventListener('click', function() {
        updateActiveFuel(this.innerText);
        generateMinMax(this.innerText);
        updateLegend();
        renderMap();
        fuelTypeChange.classList.remove('active');
        activeFuel.addEventListener('click', changeFuelType);
      });
    }

  } else {
    fuelTypeChange.classList.remove('active');
  }
}


//Initiate and load tilelayer from Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2E4OCIsImEiOiJjaXJubWhrYjAwMDZjaGpuaDZ0aGE3cXZzIn0.aJ2_IfAe1yKkWByfiYyfog';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [14.993038200627012, 54.775893640702776],
    zoom: 2.68,
    minZoom: 2.68,
    maxZoom: 6.36,
    attributionControl: {
      position: 'top-left'
    }
});

var bounds = [
    [25.517317537856513, 69.3193677302958],
    [7.15691005067589, 51.36162679619255]
];

//When map is fully loaded, load Data and render on map
map.on('load', function() {
    map.addSource('fuelData', {
        type: 'geojson',
        data: fuelData
    });

    map.addSource('fuelHoverData', {
      type: 'geojson',
      data: {
        'type': 'FeatureCollection',
        'features': []
      }
    });
});

function renderMap() {
    map.fitBounds(bounds);
    map.addLayer({
        'id': 'fuelMap',
        'type': 'fill',
        'layout': {},
        'source': 'fuelData',
        'paint': {
            'fill-color': {
                property: currentLayer,
                stops: [
                    [ minValue, '#FFF'],
                    [ maxValue, '#F99F00']
                ]
            }
        }
    });

    map.addLayer({
        'id': 'fuelMapHover',
        'type': 'line',
        'layout': {},
        'source': 'fuelHoverData',
        'paint': {
            'line-color': '#1D918E',
            'line-width': 2
        }
    });

  } // end renderMap


  function countyHover() {
    var hoverValue = document.getElementById('hoverValue');

    map.on('mousemove', function(e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['fuelMap']} );
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

      if (features.length) {
        var legendPostion = getLegendPosition(features[0].properties[currentLayer]);
        var newCss = 'bottom:' + legendPostion + '%';
        hoverValue.style.cssText = newCss;
        
        hoverValue.innerHTML = '<h5 class="hoverName">' + features[0].properties.KOMMUN + '</h5>';
        hoverValue.innerHTML += '<h5 class="hoverPercent">' + formatPercent(features[0].properties[currentLayer]) + '</h5>';
        hoverValue.classList.add('active');

        map.getSource('fuelHoverData').setData({type: 'FeatureCollection', features: [features[0]]});

      } else {
        hoverValue.classList.remove('active');
        map.getSource('fuelHoverData').setData({type: 'FeatureCollection', features: []});
      }
    }); //end mousemove event
  }

  //Display county fueltype percent if window width is greater than 600px
  if (window.innerWidth > 600) {
    countyHover();
  }

  //Bind event listenter to activeFuel
  activeFuel.addEventListener('click', changeFuelType);


  //////  WINDOW RESIZE //////
  window.addEventListener('resize', function() {
    map.fitBounds(bounds);
  });
