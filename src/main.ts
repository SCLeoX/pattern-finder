import { Pattern } from './Pattern';
import { QueryProcess } from './QueryProcess';

// !!! EXTREMELY SPAGHETTI CODE WARNING !!! //

let runningProcess: null | QueryProcess = null;

const padding = 15;
const margin = 20;
const elemTitle = document.getElementById('title') as HTMLHeadingElement;
const elemInput = document.getElementById('input') as HTMLInputElement;
const elemResults = document.getElementById('results') as HTMLDivElement;
const elemResultsInner
  = document.getElementById('results-inner') as HTMLDivElement;
const elemSampleResult
  = document.getElementById('sample-result') as HTMLDivElement;
const elemMetrics = document.getElementById('metrics') as HTMLDivElement;
const composePosingStyle = (left, top) => `left:${left}px;top:${top}px;`;
const updateView = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const titleMode = elemInput.value === '' && width > height;
  const titleWidth = elemTitle.clientWidth;
  const titleHeight = elemTitle.clientHeight;
  const inputHeight = elemInput.clientHeight;
  let titleX: number;
  let titleY: number;
  let inputX: number;
  let inputY: number;
  let inputWidth;
  if (titleMode) {
    inputWidth = 600;
    titleX = (width - titleWidth) / 2;
    titleY = (height - titleHeight - padding - inputHeight) / 2;
    inputX = (width - inputWidth) / 2;
    inputY = (height + titleHeight + padding - inputHeight) / 2;
  } else {
    titleY = margin;
    inputY = margin + titleHeight + margin;
    let xOffset;
    if (width < 1000 + margin * 2) {
      xOffset = margin;
      inputWidth = width - margin * 2;
    } else {
      xOffset = (width - 1000) / 2;
      inputWidth = 1000;
    }
    titleX = inputX = xOffset;
    const resultsY = inputY + inputHeight;
    elemResults.setAttribute('style', composePosingStyle(
      xOffset,
      resultsY,
    ) + `width:${inputWidth}px;height:${height - resultsY}px;`);
  }
  elemTitle.setAttribute('style', composePosingStyle(titleX, titleY));
  elemInput.setAttribute(
    'style',
    `${composePosingStyle(inputX, inputY)}width:${inputWidth}px;`,
  );
  if (titleMode) {
    elemResults.setAttribute('class', 'hide');
  } else {
    elemResults.removeAttribute('class');
  }
};
updateView();
window.addEventListener('resize', () => updateView());

interface IResult {
  elemRoot: HTMLDivElement;
  elemRepeat: HTMLSpanElement;
  elemPredict: HTMLSpanElement;
  elemPattern: HTMLSpanElement;
  pattern: Pattern;
}
const results: Array<IResult> = [];

const resetResults = () => {
  for (const result of results) {
    result.elemRoot.remove();
  }
  results.length = 0;
};

let autoPaused = false;

elemSampleResult.removeAttribute('id');
elemSampleResult.remove(); // Detach the template from DOM
const addResult = (pattern: Pattern, predictions: Array<number>) => {
  if (runningProcess === null) {
    return;
  }
  if (runningProcess.totalMatches === 25) {
    runningProcess.stop();
    autoPaused = true;
  }
  const elemRoot = elemSampleResult.cloneNode(true) as HTMLDivElement;
  const elemRepeat
    = elemRoot.getElementsByClassName('repeat')[0] as HTMLSpanElement;
  elemRepeat.innerText = runningProcess.sequence.join(', ');
  const elemPredict
    = elemRoot.getElementsByClassName('predict')[0] as HTMLSpanElement;
  const initialIndex = runningProcess.sequence.length;
  elemPredict.innerText = predictions.join(', ');
  const elemPattern
    = elemRoot.getElementsByClassName('pattern')[0] as HTMLSpanElement;
  elemPattern.innerText = pattern.toString(false);
  const scroll = (elemResults.scrollTop + elemResults.clientHeight)
    >= elemResults.scrollHeight - 10;
  (elemMetrics.parentElement as HTMLElement).insertBefore(
    elemRoot,
    elemMetrics,
  );
  results.push({
    elemRoot,
    elemRepeat,
    elemPredict,
    elemPattern,
    pattern,
  });
  if (scroll) {
    // Scroll to bottom. (Actually more than needed but that is fine)
    elemResults.scrollTop = elemResults.scrollHeight;
  }
};

const numbers = '1234567890';
const formatInput = () => {
  const original = elemInput.value;
  const result: Array<string> = [];
  let lastIsNumber: boolean = false;
  let negativeUsed: boolean = false;
  for (const char of original) {
    if (numbers.includes(char)) {
      negativeUsed = false;
      result.push(char);
      lastIsNumber = true;
    } else {
      if (lastIsNumber) {
        result.push(', ');
      }
      lastIsNumber = false;
      if (char === '-' && !negativeUsed) {
        result.push('-');
        negativeUsed = true;
      }
    }
  }
  elemInput.value = result.join('');
};
let lastValue = '';
elemInput.addEventListener('input', () => {
  if (elemInput.value + ' ' === lastValue) {
    // If the user deleted a single space.
    elemInput.value = lastValue.substr(0, lastValue.length - 2);
  } else if (lastValue + ',' === elemInput.value) {
    // If the user entered a single comma.
    elemInput.value += ' ';
    elemInput.selectionStart = elemInput.value.length;
  }
  formatInput();
  updateView();
  lastValue = elemInput.value;
});

elemInput.addEventListener('keyup', event => {
  if (event.keyCode === 13) {
    if (runningProcess !== null) {
      runningProcess.stop();
    } else {
      // Do not ask me why. Trust the process.
      elemMetrics.innerHTML = ''
        + '<p id="running-note">'
          + 'Please note, the best guesses are on the top.'
        + '</p>'
        + '<div class="scroll"><table>'
          + '<tr>'
            + '<th>Current Status:</th>'
            + '<td><a id="current-status"></a></td>'
          + '</tr>'
          + '<tr>'
            + '<th>Total matches:</th>'
            + '<td id="metrics1"></td>'
            + '<th>Total steps:</th>'
            + '<td id="metrics2"></td>'
          + '</tr>'
          + '<tr>'
            + '<th>Total failed steps:</th>'
            + '<td id="metrics3"></td>'
            + '<th>Step success rate:</th>'
            + '<td id="metrics4"></td>'
          + '</tr>'
          + '<tr>'
            + '<th>Total ticks:</th>'
            + '<td id="metrics5"></td>'
            + '<th>Average step per tick:</th>'
            + '<td id="metrics6"></td>'
          + '</tr>'
        + '<table></div>';
      const elemMetrics1
        = document.getElementById('metrics1') as HTMLTableDataCellElement;
      const elemMetrics2
        = document.getElementById('metrics2') as HTMLTableDataCellElement;
      const elemMetrics3
        = document.getElementById('metrics3') as HTMLTableDataCellElement;
      const elemMetrics4
        = document.getElementById('metrics4') as HTMLTableDataCellElement;
      const elemMetrics5
        = document.getElementById('metrics5') as HTMLTableDataCellElement;
      const elemMetrics6
        = document.getElementById('metrics6') as HTMLTableDataCellElement;
      const elemCurrentStatus
        = document.getElementById('current-status') as HTMLLinkElement;
      elemCurrentStatus.addEventListener('click', () => {
        if (runningProcess !== null) {
          if (runningProcess.running) {
            autoPaused = false;
            runningProcess.stop();
          } else {
            runningProcess.start();
          }
        }
      });
      requestAnimationFrame(function animation() {
        if (runningProcess !== null) {
          elemMetrics1.innerText = String(runningProcess.totalMatches);
          elemMetrics2.innerText = String(runningProcess.totalSteps);
          elemMetrics3.innerText = String(
            runningProcess.totalSteps - runningProcess.totalMatches,
          );
          elemMetrics4.innerText
            = (runningProcess.totalMatches / runningProcess.totalSteps * 100)
              + '%';
          elemMetrics5.innerText = String(runningProcess.totalTicks);
          elemMetrics6.innerText = String(
            Math.round(
              runningProcess.totalSteps / runningProcess.totalTicks * 100,
            ) / 100,
          );
          elemCurrentStatus.innerText = (runningProcess.running
            ? 'Running'
            : ((autoPaused ? 'Auto ' : '' ) + 'Paused')) + ' (Click to switch)';
        }
        requestAnimationFrame(animation);
      });
    }
    resetResults();
    runningProcess = new QueryProcess(
      elemInput.value,
      addResult,
      () => undefined,
    );
  }
});
