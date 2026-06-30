const spinnerOptions = {
    selectorAttr: 'data-loading-spinner'
};

function getSpinner (classToAdd) {

    return `<div class="${classToAdd} e-spinner" ${spinnerOptions.selectorAttr}>
        <svg class="e-spinner__spinner" width="96px"  height="96px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="${classToAdd}__spinner" style="background: none;">
            <circle cx="50" cy="50" fill="none" stroke="#009685
" stroke-width="5" r="32" stroke-dasharray="150.79644737231007 52.26548245743669">
                <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform>
            </circle>
        </svg>
    </div>`;
}

function getSpinnerSelector () {

    return `[${spinnerOptions.selectorAttr}]`;
}

// Return the value
export default {
    getSpinner,
    getSpinnerSelector
};
