export default class ThirdPartyUtils {

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	static debounce (func, wait, immediate) {

		let timeout;

		return () => {

			const args = arguments;

			const later = function () {
				timeout = null;
				if (!immediate) func.apply(this, args);
			};

			const callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(this, args);
			}
		};
	}


	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	static throttle (func, wait, options) {
		var timeout, context, args, result;
		var previous = 0;
		if (!options) options = {};

		var later = function () {
			previous = options.leading === false ? 0 : Date.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};

			var throttled = function () {
			var now = Date.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
			if (timeout) {
			clearTimeout(timeout);
			timeout = null;
			}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};

			throttled.cancel = function () {
			clearTimeout(timeout);
			previous = 0;
			timeout = context = args = null;
		};

		return throttled;
	}
}