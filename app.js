const store = window.location.pathname;
const inputEls = document.querySelectorAll('input');
const selectEls = document.querySelectorAll('select');
const codeBoxes = document.querySelectorAll('.codeToggle');
const sliders = {};
const defaultValues = {};
// Redraw plots on page resize

function RunMain() {
    if(typeof Main === 'function') Main();
}

(function() {
    let resizeTimeout;

    window.addEventListener('resize', resizeThrottler, false);

    function resizeThrottler() {
        // ignore resize events as long as an calcIt execution is in the queue
        if(!resizeTimeout) {
            resizeTimeout = setTimeout(function() {
                resizeTimeout = null;
                RunMain();
                // The calcIt will execute at a rate of 15fps
            }, 66);
        }
    }
}());

(function() {
    function setUpInput(input) {
        switch(input.type) {
            case 'checkbox':
            case 'radio':
                input.addEventListener('change', RunMain);
                defaultValues[input.id] = input.checked
                break;
            case 'range':
                sliders[input.id] = new LogSlider({id: input.id, callback: RunMain});
                defaultValues[input.id] = input.value;
                break
            default:
                input.addEventListener('change', RunMain);
                defaultValues[input.id] = input.value;
        }
    }

    function setUpSelect(selector) {
        selector.addEventListener('change', RunMain);
        defaultValues[selector.id] = selector.options[selector.selectedIndex].value;
    }

    function updateCodeToggleText(toggle) {
        if(toggle.nextElementSibling.classList.contains('show')) {
            toggle.innerHTML = 'Hide Code';
        } else {
            toggle.innerHTML = 'Show Code';
        }
    }

    function setUpToggle(toggle) {
        updateCodeToggleText(toggle);
        toggle.addEventListener('click', function() {
            toggle.nextElementSibling.classList.toggle('show');
            updateCodeToggleText(toggle);
        });
    }

    inputEls.forEach(setUpInput);
    selectEls.forEach(setUpSelect);
    codeBoxes.forEach(setUpToggle);

    let storedSettings = window.localStorage.getItem(store);
    if(storedSettings) {
        for(const inputData of storedSettings.split('\n')) {
            const [name, value] = inputData.split(':');
            const input = document.getElementById(name);
            if(!input) continue;
            switch(input.type) {
                case 'checkbox':
                case 'radio':
                    input.checked = value === 'true';
                    break;
                case 'range':
                    sliders[name].value = value;
                    break;
                default:
                    input.value = value;
            }
        }
    }
}());

function saveSettings() {
    if(window.localStorage) {
        const selectors = [
            ...document.querySelectorAll('input'),
            ...document.querySelectorAll('select'),
        ];
        const serialisedInputs = selectors.reduce(function(str, item) {
            switch(item.type) {
                case 'checkbox':
                case 'radio':
                    str += item.id + ':' + item.checked + '\n';
                    break;
                case 'range':
                    str += item.id + ':' + sliders[item.id].value + '\n';
                    break;
                default:
                    str += item.id + ':' + item.value + '\n';
            }
            return str;
        }, '');
        window.localStorage.setItem(store, serialisedInputs);
    }
}

function restoreDefaultValues() {
    window.localStorage.removeItem(store);

    function resetInput(input) {
        switch(input.type) {
            case 'checkbox':
            case 'radio':
                input.checked = defaultValues[input.id]
                break;
            case 'range':
                sliders[input.id].inputValue = defaultValues[input.id];
                break
            default:
                input.value = defaultValues[input.id];
        }
    }

    function resetSelect(select) {
        select.value = defaultValues[select.id];
    }

    inputEls.forEach(resetInput);
    selectEls.forEach(resetSelect);
    RunMain();
}

const resetButton = document.getElementById('ResetInputs');
resetButton.addEventListener('click', restoreDefaultValues)

Chart.plugins.register({
    // Needed to set Chart background to white
    beforeDraw: function(chartInstance, easing) {
        const ctx = chartInstance.chart.ctx;
        ctx.fillStyle = 'white'; // your chart color here
        const chartArea = chartInstance.chartArea;
        ctx.fillRect(chartArea.left, chartArea.top,
            chartArea.right - chartArea.left,
            chartArea.bottom - chartArea.top);
    },
});

hljs.initHighlightingOnLoad();

