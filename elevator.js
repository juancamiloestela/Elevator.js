/*!
 * Elevator.js
 * http://www.github.com/juancamiloestela/Elevator.js
 * MIT licensed
 * Version 0.1
 *
 * Copyright (C) 2013 Juan Camilo Estela http://www.mecannical.com
 *
 */

(function($) {
'user strict';


	function Floor(options){
		var f = options,
			totalTops = 0,
			used = false,
			top = [0],
			globalOffset = f.scrollable.offset().top,
			debugFloors;

		function run(i, dir){
			if (f.once && used){
				return;
			}
			used = true;
			f.callback( ((f.element) ? f.element[i] : top[i].top) , dir);
		}

		function execute(dir, prev, next){
			if (f.dir == dir || f.dir == 'both'){
				for (i = 0; i < totalTops; i++){
					var offset = ((typeof f.offset === 'function') ? f.offset(dir, next) : f.offset);

					if (dir === 'down' && prev < top[i] + offset && top[i] + offset <= next){
						run(i, dir);
					}else if (dir === 'up' && prev > top[i] + offset && top[i] + offset >= next){
						run(i, dir);
					}
				}
				if (f.step){
					f.step(dir, prev, next);
				}
			}
		}

		function refresh(){
			var t = [];
			$.each(f.element, function(i, el){
				t.push( $(el).offset().top - globalOffset + options.scrollable.scrollTop());
			});
			if (t.length === 0 && f.offset !== 0){
				t.push(0);
			}
			totalTops = t.length;
			top = t;
			//drawFloors();
		}

		function drawFloors(){
			var i;

			if (!debugFloors){
				f.scrollable.css({position: 'relative'});
				debugFloors = [];
				for (i = 0; i < totalTops; i++){
					var line = $('<div class="debug"></div>');
					line.css({
						backgroundColor: 'red',
						height: '1px',
						width: '100%',
						left: '0',
						top: '0',
						position: 'absolute',
						zIndex: '1000000',
						fontFamily: 'sans-serif',
						fontSize: '12px'
					});
					debugFloors.push(line);
					f.scrollable.append(line);
				}
			}

			for (i = 0; i < totalTops; i++){
				var value = top[i] + ((typeof f.offset === 'function') ? f.offset('down') : f.offset);
				debugFloors[i].html(parseInt(value, 10) + 'px - Debug Scroll Trigger').css({
					top: value
				});
			}
		}

		(function init(){
			refresh();
		})();

		return {
			execute: execute,
			refresh: refresh
		};
	}


	function Elevator(){

		var floors = [],
			totalFloors = 0,
			currentScrollTop = 0,
			drawFloors = false,
			$scrollable = $(window),
			step,
			resizeTimeout;

		function onScroll(){
			var i,
				scrollTop = $(this).scrollTop(),
				dir = (currentScrollTop < scrollTop) ? 'down' : 'up';

			for (i = 0; i < totalFloors; i++){
				floors[i].execute(dir, currentScrollTop, scrollTop);
			}
			if (step){
				step(dir, currentScrollTop, scrollTop);
			}

			currentScrollTop = scrollTop;
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(doResize, 100);
		}

		function doResize(){
			var i;
			for (i = 0; i < totalFloors; i++){
				floors[i].refresh();
			}
			console.log('refreshed');
		}

		function onResize(){
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(doResize, 300);
		}

		function config(options){
			if (options.element){
				$scrollable.off('scroll');
				$scrollable = $(options.element);
				$scrollable.on('scroll', onScroll);
			}
			drawFloors = options.drawFloors;
			step = options.step;
		}

		function on(options){
			// inject current elevator scrollable to each floor
			options.scrollable = $scrollable;
			var floor = new Floor(options);
			floors.push(floor);
			totalFloors = floors.length;
			return floor;
		}

		function listen(){
			$scrollable.on('scroll', onScroll).on('resize', onResize);
		}

		(function init(){
			listen();
			// re-measure stuff to handle change in content sizes
			setInterval(doResize, 5000);
		})();

		return {
			config: config,
			on: on
		};
	}

	$.elevator = (function(){
		var elevator;

		function config(options){
			elevator.config(options);
			return this;
		}

		function on(options){
			var settings = $.extend({
				element: false,
				dir: 'both',
				once: false,
				offset: 0,
				callback: false
			}, options);

			return elevator.on(settings);
		}

		(function init(){
			elevator = new Elevator();
		})();

		return {
			config: config,
			on: on
		};
	})();

}(jQuery));