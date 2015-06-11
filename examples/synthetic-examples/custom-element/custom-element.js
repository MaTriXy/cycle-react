var h = Cycle.h;
var Rx = Cycle.Rx;

var Ticker = Cycle.createReactClass('Ticker', function (interactions, props) {
  var removeClicks$ = interactions.get('.remove-btn', 'click').share();
  var stop$ = removeClicks$.map(function () { return 'stop'; });
  var remove$ = removeClicks$.map(function () { return 'remove'; }).delay(500);
  var color$ = Rx.Observable.merge(
    props.get('color').takeUntil(stop$),
    stop$.map(function () { return '#FF0000'; })
  );
  var x$ = Rx.Observable.interval(50).startWith(0).takeUntil(stop$);
  var y$ = Rx.Observable.interval(100).startWith(0).takeUntil(stop$);
  var vtree$ = Rx.Observable.combineLatest(color$, x$, y$, function (color, x, y) {
    return h('div.ticker', {
      style: {color: color, backgroundColor: '#ECECEC'}
    }, [
      h('h4', 'x' + x + ' ' + color),
      h('h1', 'Y' + y + ' ' + color),
      h('button.remove-btn', {onclick: 'removeClick$'}, 'Remove')
    ]);
  });

  return {
    view: vtree$,
    events: {
      remove: remove$
    }
  };
});

function makeRandomColor() {
  var hexColor = Math.floor(Math.random() * 16777215).toString(16);
  while (hexColor.length < 6) {
    hexColor = '0' + hexColor;
  }
  hexColor = '#' + hexColor;
  return hexColor;
}

function computer(interactions) {
  var removeTicker$ = interactions.get('.ticker', 'remove');
  var color$ = Rx.Observable.interval(1000)
    .map(makeRandomColor)
    .startWith('#000000');
  var tickerExists$ = Rx.Observable.just(true)
    .merge(removeTicker$.map(function () { return false; }));
  return Rx.Observable.combineLatest(color$, tickerExists$,
    function (color, tickerExists) {
      return h('div#the-view', [
        tickerExists ? h(Ticker, {key: 1, color: color}) : null
      ]);
    }
  );
}

Cycle.applyToDOM('.js-container', computer);
