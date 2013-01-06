
lychee.define('Viewport').tags({
	platform: 'html'
}).includes([
	'lychee.Events'
]).supports(function(lychee, global) {

	if (
		typeof global.addEventListener === 'function'
		&& typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	// I know, there's null and 0.
	// This is wanted. See below.
	var _clock = {
		orientationchange: null,
		resize:            0
	};


	var _instances = [];
	var _listeners = {

		orientationchange: function() {

			_clock.orientationchange = Date.now();

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processOrientation(global.orientation);
			}

		},

		resize: function() {

			// This fixes the multiple resize events bug
			// The DOM-concept related Bug by design:
			// 1. resize
			// 2. orientationchange
			// 3. resize (optional, if device was fast enough)
			// 4. orientationchange
			// 5. resize (if reflow was bad)
			// 6. resize

			if (
				_clock.orientationchange === null
				|| (
					_clock.orientationchange !== null
					&& _clock.resize < _clock.orientationchange
				)
			) {

				_clock.resize = Date.now();

				for (var i = 0, l = _instances.length; i < l; i++) {

					(function(instance) {
						setTimeout(function() {
							instance.__processReshape(global.innerWidth, global.innerHeight);
						}, 500);
					})(_instances[i]);

				}

			}

		},

		pageshow: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processShow();
			}

		},

		pagehide: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processHide();
			}

		}

	};


	(function() {

		var methods = [];

		if (typeof global.onorientationchange !== 'undefined') {
			methods.push('orientationchange');
			global.addEventListener('orientationchange', _listeners.orientationchange, true);
		}

		if (typeof global.onpageshow !== 'undefined') {
			methods.push('pageshow');
			global.addEventListener('pageshow', _listeners.pageshow, true);
		}

		if (typeof global.onpagehide !== 'undefined') {
			methods.push('pagehide');
			global.addEventListener('pagehide', _listeners.pagehide, true);
		}


		global.addEventListener('resize', _listeners.resize, true);


		if (lychee.debug === true) {

			console.log('lychee.Viewport: Supported methods are ' + methods.join(', '));

		}

	})();


	var Class = function() {

		this.__orientation = typeof global.orientation === 'number' ? global.orientation : 0;
		this.__width  = global.innerWidth;
		this.__height = global.innerHeight;


		lychee.Events.call(this, 'viewport');

		_instances.push(this);

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processOrientation: function(orientation) {
			this.__orientation = orientation;
		},

		__processReshape: function(width, height) {

			this.__width  = width;
			this.__height = height;


			//    TOP
			//  _______
			// |       |
			// |       |
			// |       |
			// |       |
			// |       |
			// [X][X][X] <- buttons
			//
			//  BOTTOM

			if (this.__orientation === 0) {

				if (width > height) {
					this.trigger('reshape', [
						'landscape',
						'landscape',
						width,
						height
					]);
				} else {
					this.trigger('reshape', [
						'portrait',
						'portrait',
						width,
						height
					]);
				}


			//    ____________    B
			// T |            [x] O
			// O |            [x] T
			// P |____________[x] T
			//                    O
			//                    M

			} else if (this.__orientation === 90) {

				if (width > height) {
					this.trigger('reshape', [
						'portrait',
						'landscape',
						width,
						height
					]);
				} else {
					this.trigger('reshape', [
						'landscape',
						'portrait',
						width,
						height
					]);
				}


			// B    ____________
			// O [x]            | T
			// T [x]            | O
			// T [x]____________| P
			// O
			// M

			} else if (this.__orientation === -90) {

				if (width > height) {
					this.trigger('reshape', [
						'portrait',
						'landscape',
						width,
						height
					]);
				} else {
					this.trigger('reshape', [
						'landscape',
						'portrait',
						width,
						height
					]);
				}

			}

		},

		__processShow: function() {
			this.trigger('show', []);
		},

		__processHide: function() {
			this.trigger('hide', []);
		}

	};


	return Class;

});

