/* eslint new-cap: 0 */
var Benchmark = require('benchmark'),
    regexCombiner = require('./regex-combiner'),
    allStrings;

allStrings = [
  // 1000 most common words in English. This should be a relatively normal use case: check if a password is one of the
  // most common words and reject it. List from http://www.bckelk.ukfsn.org/words/uk1000n.html
  'the and to of a i in was he that it his her you as had with for she not at but be my on have him is said me which',
  'by so this all from they no were if would or when what there been one could very an who them mr we now more out do',
  'are up their your will little than then some into any well much about time know should man did like upon such',
  'never only good how before other see must am own come down say after think made might being mrs again great two',
  'can go over too here came old thought himself where our may first way has though without went us away day make',
  'these young nothing long shall sir back don\'t house ever yet take every hand most last eyes its miss having off',
  'looked even while dear look many life still mind quite another those just head tell better always saw seemed put',
  'face let took poor place why done herself found through same going under enough soon home give indeed left get',
  'once mother heard myself rather love knew got lady room something yes thing father perhaps sure heart oh right',
  'against three men night people door told round because woman till felt between both side seen morning began whom',
  'however asked things part almost moment looking want far hands gone world few towards gave friend name best word',
  'turned kind cried since anything next find half hope called nor words hear brought set each replied wish voice',
  'whole together manner new believe course least years answered among stood sat speak leave work keep taken end less',
  'present family often wife whether master coming mean returned evening light money cannot whose boy days near',
  'matter suppose gentleman used says really rest business full help child sort passed lay small behind girl feel',
  'fire care alone open person call given i\'ll sometimes making short else large within chapter true country times',
  'ask answer air kept hour letter happy reason pretty husband certain others ought does known it\'s bed table',
  'that\'s ready read already pleasure either means spoke taking friends talk hard walked turn strong thus yourself',
  'high along above feeling glad children doubt nature themselves black hardly town sense saying deal account use',
  'white bad everything can\'t neither wanted mine close return dark fell subject bear appeared fear state thinking',
  'also point therefore fine case doing held certainly walk lost question company continued fellow truth water',
  'possible hold afraid bring honour low ground added five remember except power seeing dead i\'m usual able second',
  'arms late opinion window brother live four none death arm road hair sister entered sent married longer immediately',
  'god women hours ten understand son horse wonder cold beyond please fair became sight met afterwards eye year show',
  'general itself silence lord wrong turning daughter stay forward o interest thoughts followed won\'t different',
  'opened several idea received change laid strange nobody fact during feet tears run purpose character body ran past',
  'order need pleased trouble whatever dinner happened sitting getting there\'s besides soul ill early rose aunt',
  'hundred minutes across carried sit observed suddenly creature conversation worse six quiet chair doctor tone',
  'standing living sorry stand meet instead wished ah lived try red smile sound expected silent common meant tried',
  'until mouth distance occasion cut marry likely length story visit deep seems street remained become led speaking',
  'natural giving further struck week loved drew seem church knows object ladies marriage book appearance pay i\'ve',
  'obliged particular pass thank form knowing lips knowledge former blood sake fortune necessary presence feelings',
  'corner beautiful talking spirit ago foot circumstances wind presently comes attention wait play easy real clear',
  'worth cause send spirits chance didn\'t view pleasant party beginning horses stopped notice duty he\'s age figure',
  'leaving sleep entirely twenty fall promise months broken heavy secret thousand happiness comfort minute act human',
  'fancy strength showed pounds nearly probably captain piece school write laughed reached repeated walking father\'s',
  'heaven beauty shook sun waiting moved bit desire news front effect laugh uncle fit miles handsome caught hat',
  'regard gentlemen supposed easily impossible glass resolved grew consider green considered unless stop forth expect',
  'perfectly altogether surprise sudden free exactly grave carriage believed service angry putting carry everybody',
  'mentioned looks scarcely society affection exclaimed dress die earth latter garden step perfect countenance liked',
  'dare pain companion journey paper opportunity makes honest arrived you\'ll bright pity directly cry trust fast ye',
  'warm danger trees breakfast rich engaged proper talked respect fixed hill wall determined wild shut top plain',
  'scene sweet especially public acquaintance forget history pale pray books afternoon man\'s otherwise mention',
  'position speech gate \'em boys yours drink slowly broke clothes fond pride watch sooner settled paid reply tea lie',
  'running died gentle particularly allowed outside placed joy hearing note condition follow begin neck serious hurt',
  'kindness mere farther changed o\'clock passing girls force situation greater expression eat reading spoken raised',
  'anybody started following although sea proud future quick safe temper laughing ears difficulty meaning servant sad',
  'advantage appear offer breath opposite number miserable law rising favour save twice single blue noise stone',
  'mistress surprised allow spot burst keeping line understood court finding direction anxious pocket around conduct',
  'loss fresh below hall satisfaction land telling passion floor break lying waited closed meeting trying seat king',
  'confidence offered stranger somebody matters noble pardon private sharp evil weeks justice hot cast letters youth',
  'lives health finished hoped holding touch spite delight bound consequence rain wouldn\'t third hung ways weather',
  'written difference kitchen she\'s mother\'s persons quarter promised hopes brown nay seven simple wood beside',
  'middle ashamed lose dreadful move generally cousin surely satisfied bent shoulder art field quickly thrown tired',
  'share pair to-morrow aware colour writing whenever quietly fool forced touched smiling taste dog spent steps worst',
  'legs watched ay thee eight worthy wrote manners proceeded frightened somewhat born greatest charge degree shame',
  'places ma\'am couldn\'t tongue according box wine filled servants calling fallen supper'
].join(' ').split(' ');

var tests = [80, 40, 20, 10, 5].reduce(function (memo, sampleSize) {
  memo['Set size = ' + sampleSize] = sample(allStrings, sampleSize);
  return memo;
}, {'Set size = 1000': allStrings });

Benchmark.forOwn(tests, function (strings, name) {
  var individual = strings.map(toBoundedRegex);
  var combined = regexCombiner(individual);
  var bestCase = strings[0];
  var worstCase = strings[strings.length - 1];
  var avgCase = strings[Math.floor(strings.length / 2)];
  var worstMiss = worstCase + '!@#';
  var bestMiss = '!@#';

  runBenchmark(Benchmark.Suite(name)
    .add('combined regex with a match at the start',      combinedTest(combined, bestCase))  // best case match
    .add('combined regex with a match at the middle',     combinedTest(combined, avgCase))   // average case match
    .add('combined regex with a match at the end',        combinedTest(combined, worstCase)) // worst case match
    .add('combined regex with a complete miss',           combinedTest(combined, bestMiss))  // best case miss
    .add('combined regex with a near miss',               combinedTest(combined, worstMiss)) // worst case miss
    .add('individual regexes with a match at the start',  individualTest(individual, bestCase))
    .add('individual regexes with a match at the middle', individualTest(individual, avgCase))
    .add('individual regexes with a match at the end',    individualTest(individual, worstCase))
    .add('individual regexes with a complete miss',       individualTest(individual, bestMiss))
    .add('individual regexes with a near miss',           individualTest(individual, worstMiss))
    .add('indexOf with a match at the start',             indexOfTest(strings, bestCase))
    .add('indexOf with a match at the middle',            indexOfTest(strings, avgCase))
    .add('indexOf with a match at the end',               indexOfTest(strings, worstCase))
    .add('indexOf with a complete miss',                  indexOfTest(strings, bestMiss))
    .add('indexOf with a near miss',                      indexOfTest(strings, worstMiss))
  );

  // 1/3 chance to test against a word which isn't in the list
  var stringsWithGibberish = strings.concat(makeArray(Math.floor(strings.length * 0.5), gibberish));
  runBenchmark(Benchmark.Suite(name + ' (averaged case)')
    .add('combined regex', combinedTestAvg(combined, stringsWithGibberish))
    .add('individual regexes', individualTestAvg(individual, stringsWithGibberish))
    .add('indexOf', indexOfTestAvg(strings, stringsWithGibberish))
  );
});

runBenchmark(Object.keys(tests).reduce(function (suite, name) {
  var strings = tests[name];
  var individual = strings.map(toBoundedRegex);
  return suite.add('Size = ' + strings.length, function () {
    regexCombiner(individual);
  });
}, Benchmark.Suite('Generating combined regex')));

function runBenchmark(suite) {
  console.log('\n## ' + suite.name + '\n');
  suite
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').map('name').join(', '));
    })
    .run({ 'async': false });
}

function combinedTest(combinedRegex, phrase) {
  return function () {
    combinedRegex.test(phrase);
  };
}

function combinedTestAvg(combinedRegex, phrases) {
  return function () {
    combinedRegex.test(sample(phrases));
  };
}

function individualTest(arr, phrase) {
  return function () {
    for (var i = 0, l = arr.length; i < l; ++i) {
      if (arr[i].test(phrase)) {
        return;
      }
    }
  };
}
function individualTestAvg(arr, phrases) {
  return function () {
    var phrase = sample(phrases);
    for (var i = 0, l = arr.length; i < l; ++i) {
      if (arr[i].test(phrase)) {
        return;
      }
    }
  }
}

function indexOfTest(words, phrase) {
  return function () {
    return words.indexOf(phrase) > -1;
  };
}

function indexOfTestAvg(words, phrases) {
  return function () {
    var phrase = sample(phrases);
    return words.indexOf(phrase) > -1;
  };
}

function toBoundedRegex(str) {
  return RegExp('^' + str + '$');
}

function sample(arr, n) {
  if (n && n > 1) {
    return makeArray(n, sample.bind(null, arr));
  }
  return arr[rnd(0, arr.length)];
}

function gibberish() {
  return String.fromCharCode.apply(String, makeArray(rnd(2, 8), function () {
    return rnd(97, 123); // a-z
  }));
}

function makeArray(size, fn) {
  var out = [];
  for (var i = 0; i < size; ++i) {
    out[i] = fn();
  }
  return out;
}

// something in the range [low...high-1]
function rnd(low, high) {
  return Math.floor(Math.random() * (high - low)) + low;
}
